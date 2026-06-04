import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Handle CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * @swagger
 * /api/media/{id}:
 *   get:
 *     tags:
 *       - Media
 *     summary: Download media file by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media file ID
 *       - in: query
 *         name: download
 *         schema:
 *           type: boolean
 *         description: Force download as attachment
 *     responses:
 *       200:
 *         description: File content
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Media file not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const forceDownload = searchParams.get('download') === 'true';
    const requestedFormat = searchParams.get('format'); // jpeg, png, webp
    const isIOSRequest = searchParams.get('ios') === 'true';
    const userAgent = req.headers.get('user-agent') || '';
    const isIOSSafari = /iPad|iPhone|iPod/.test(userAgent) && /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

    // Get file info from database
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id }
    });

    if (!mediaFile) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
    }

    try {
      // Get file from MinIO
      const { getMinioClient, getBucketName } = await import('@/lib/minio');
      const fileStream = await getMinioClient().getObject(getBucketName(), mediaFile.objectName);
      
      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of fileStream) {
        chunks.push(chunk);
      }
      const fileBuffer = Buffer.concat(chunks);

      // Determine optimal content type for iOS Safari
      let contentType = mediaFile.mimeType;
      if ((isIOSSafari || isIOSRequest) && mediaFile.type === 'IMAGE') {
        // Force JPEG for iOS Safari to avoid WebP issues
        if (requestedFormat === 'jpeg' || mediaFile.mimeType.includes('webp')) {
          contentType = 'image/jpeg';
        }
      }
      
      // Set appropriate headers with mobile optimization
      const headers = new Headers();
      headers.set('Content-Type', contentType);
      headers.set('Content-Length', mediaFile.size.toString());
      
      // Add CORS headers for better mobile compatibility
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Add mobile-friendly headers
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('Accept-Ranges', 'bytes');
      
      if (forceDownload) {
        headers.set('Content-Disposition', `attachment; filename="${mediaFile.name}"`);
      } else {
        // For images and videos, display inline
        if (mediaFile.type === 'IMAGE' || mediaFile.type === 'VIDEO') {
          headers.set('Content-Disposition', `inline; filename="${mediaFile.name}"`);
        } else {
          headers.set('Content-Disposition', `attachment; filename="${mediaFile.name}"`);
        }
      }

      // Optimized cache headers for mobile
      headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      headers.set('ETag', `"${mediaFile.objectName}"`);
      
      // Add mobile-specific optimization headers
      if (mediaFile.type === 'IMAGE') {
        headers.set('Vary', 'Accept, User-Agent');
        
        // iOS Safari specific headers
        if (isIOSSafari || isIOSRequest) {
          headers.set('X-iOS-Optimized', 'true');
          headers.set('X-Content-Format', contentType);
        }
      }

      return new NextResponse(fileBuffer, {
        status: 200,
        headers
      });

    } catch (minioError) {
      console.error('Error getting file from MinIO:', minioError);
      return NextResponse.json({ error: 'File not found in storage' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error serving media file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}