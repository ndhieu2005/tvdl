import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Initialize MinIO bucket on startup - moved to runtime
// initializeBucket();

/**
 * @swagger
 * /api/admin/media:
 *   get:
 *     tags:
 *       - Media
 *     summary: Get all media files
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [IMAGE, VIDEO, AUDIO, DOCUMENT]
 *         description: Filter by media type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of media files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MediaFile'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Admin Media API - Headers:', req.headers.get('Authorization'));
    const token = await getToken(req);
    console.log('🔍 Admin Media API - Token:', token);
    
    if (!token || !['ADMIN', 'EDITOR'].includes(token.role)) {
      console.log('🔍 Admin Media API - Token validation failed:', { token, hasToken: !!token });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (type) {
      where.type = type;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get files from database
    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.mediaFile.count({ where })
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      files,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Error fetching media files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/media:
 *   post:
 *     tags:
 *       - Media
 *     summary: Upload media file
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *                 description: Custom name for the file
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaFile'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken(req);
    if (!token || !['ADMIN', 'EDITOR'].includes(token.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const customName = formData.get('name') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/avi', 'video/mov',
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not supported' }, { status: 400 });
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to MinIO
    const { uploadFile } = await import('@/lib/minio');
    const uploadResult = await uploadFile(
      file.name,
      fileBuffer,
      file.type,
      {
        'uploaded-by': token.userId,
        'original-name': file.name
      }
    );

    // Determine media type
    let mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' = 'DOCUMENT';
    console.log('🔍 Upload API: File type:', file.type);
    if (file.type.startsWith('image/')) {
      mediaType = 'IMAGE';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'VIDEO';
    } else if (file.type.startsWith('audio/')) {
      mediaType = 'AUDIO';
    }
    console.log('🔍 Upload API: Media type determined as:', mediaType);

    // Get image dimensions if it's an image
    let dimensions = null;
    if (mediaType === 'IMAGE') {
      try {
        // Note: In production, you might want to use a library like sharp to get dimensions
        // For now, we'll set default dimensions
        dimensions = { width: 0, height: 0 };
      } catch (error) {
        console.error('Error getting image dimensions:', error);
      }
    }

    // Save to database (without storing the direct URL)
    const mediaFile = await prisma.mediaFile.create({
      data: {
        name: customName || file.name,
        originalName: file.name,
        objectName: uploadResult.objectName,
        type: mediaType,
        mimeType: file.type,
        size: file.size,
        dimensions: dimensions || undefined,
        url: null, // Don't store direct URL
        uploadedBy: token.userId,
        metadata: {
          uploadedAt: new Date().toISOString(),
          userAgent: req.headers.get('user-agent') || 'unknown'
        }
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(mediaFile, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     MediaFile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         originalName:
 *           type: string
 *         objectName:
 *           type: string
 *         type:
 *           type: string
 *           enum: [IMAGE, VIDEO, AUDIO, DOCUMENT]
 *         mimeType:
 *           type: string
 *         size:
 *           type: integer
 *         dimensions:
 *           type: object
 *           properties:
 *             width:
 *               type: integer
 *             height:
 *               type: integer
 *         url:
 *           type: string
 *         uploadedBy:
 *           type: string
 *         uploader:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */