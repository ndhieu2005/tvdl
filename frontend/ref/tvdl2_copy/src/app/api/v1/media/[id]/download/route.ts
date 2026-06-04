import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth } from '@/lib/middleware/api-auth';
import { PrismaClient } from '@prisma/client';

// Force Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient();

// GET: Download media file
export const GET = withApiKeyAuth('media', 'read', async (req, { params }) => {
  try {
    const fileId = params.id;

    const file = await prisma.mediaFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    try {
      // Get file stream from MinIO
      const { minioClient } = await import('@/lib/minio');
      const fileStream = await minioClient.getObject(
        process.env.MINIO_BUCKET_NAME || 'viralpeek-media',
        file.objectName
      );

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of fileStream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Return file with proper headers
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': file.mimeType,
          'Content-Disposition': `attachment; filename="${file.originalName}"`,
          'Content-Length': file.size.toString(),
        },
      });
    } catch (error) {
      console.error('Error downloading file from MinIO:', error);
      return NextResponse.json({ error: 'File not accessible' }, { status: 404 });
    }
  } catch (error) {
    console.error('Download Media File Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});