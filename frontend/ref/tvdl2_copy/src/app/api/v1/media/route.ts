import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth } from '@/lib/middleware/api-auth';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

// Force Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient();

// GET: Lấy danh sách media files
export const GET = withApiKeyAuth('media', 'read', async (req, context) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // IMAGE, VIDEO, AUDIO, DOCUMENT
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
      ];
    }

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
              email: true,
            },
          },
        },
      }),
      prisma.mediaFile.count({ where }),
    ]);

    return NextResponse.json({
      files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get Media Files Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// POST: Upload media file
export const POST = withApiKeyAuth('media', 'create', async (req, context) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Must be IMAGE, VIDEO, AUDIO, or DOCUMENT' 
      }, { status: 400 });
    }

    // Generate unique object name
    const fileExtension = file.name.split('.').pop();
    const objectName = `${type.toLowerCase()}/${randomUUID()}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get file dimensions for images/videos
    let dimensions = null;
    if (type === 'IMAGE') {
      try {
        // You might want to use a library like sharp for image processing
        // dimensions = await getImageDimensions(buffer);
      } catch (error) {
        console.error('Error getting image dimensions:', error);
      }
    }

    // Upload to MinIO
    const { minioClient } = await import('@/lib/minio');
    await minioClient.putObject(
      process.env.MINIO_BUCKET_NAME || 'viralpeek-media',
      objectName,
      buffer,
      file.size,
      {
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="${file.name}"`,
      }
    );

    // Generate public URL
    const publicUrl = await minioClient.presignedGetObject(
      process.env.MINIO_BUCKET_NAME || 'viralpeek-media',
      objectName,
      24 * 60 * 60 // 24 hours
    );

    // Save to database
    const mediaFile = await prisma.mediaFile.create({
      data: {
        name: name || file.name,
        originalName: file.name,
        objectName,
        type: type as any,
        mimeType: file.type,
        size: file.size,
        dimensions: dimensions || undefined,
        url: publicUrl,
        uploadedBy: req.user!.id,
        metadata: {
          originalSize: file.size,
          uploadedAt: new Date(),
        },
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'File uploaded successfully',
      file: mediaFile,
    }, { status: 201 });
  } catch (error) {
    console.error('Upload Media Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});