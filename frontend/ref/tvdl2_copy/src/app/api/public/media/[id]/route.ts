import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addWebPHeaders, isImageFile, shouldForceInline } from '@/lib/webp-headers';

/**
 * Public media endpoint for Next.js Image optimization
 * No authentication required for public images
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userAgent = request.headers.get('user-agent') || '';
    
    console.log('🔍 Public Media API - Serving media:', {
      id,
      userAgent: userAgent.substring(0, 100) + '...',
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      isNextImageOptimization: request.headers.get('user-agent')?.includes('Next.js')
    });

    // Get file info from database
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { 
        id,
        // Only serve public/published media files
        // Add additional filters if needed
      }
    });

    if (!mediaFile) {
      console.log('❌ Media file not found:', id);
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
    }

    // Check if file should be publicly accessible
    // Add your business logic here if needed
    // For now, we'll serve all media files publicly

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

      console.log('✅ Public Media API - File served successfully:', {
        id,
        name: mediaFile.name,
        type: mediaFile.type,
        mimeType: mediaFile.mimeType,
        size: fileBuffer.length
      });

      // Create response with proper headers
      const response = new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mediaFile.mimeType,
          'Content-Length': fileBuffer.length.toString(),
        }
      });

      // Add WebP-safe headers for images
      if (mediaFile.type === 'IMAGE') {
        return addWebPHeaders(response, mediaFile.name, {
          forceInline: shouldForceInline(userAgent, mediaFile.name),
          debug: process.env.NODE_ENV === 'development'
        });
      }

      // For non-images, add basic headers
      const headers = new Headers(response.headers);
      headers.set('Content-Disposition', `inline; filename="${mediaFile.name}"`);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('X-Content-Type-Options', 'nosniff');

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      });

    } catch (minioError) {
      console.error('❌ Error getting file from MinIO:', minioError);
      return NextResponse.json({ error: 'File not found in storage' }, { status: 404 });
    }

  } catch (error) {
    console.error('❌ Error serving public media file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}