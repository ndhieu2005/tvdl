import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth } from '@/lib/middleware/api-auth';
import { PrismaClient } from '@prisma/client';

// Force Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient();

// GET: Lấy thông tin media file
export const GET = withApiKeyAuth('media', 'read', async (req, { params }) => {
  try {
    const fileId = params.id;

    const file = await prisma.mediaFile.findUnique({
      where: { id: fileId },
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

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Generate fresh URL if needed
    let publicUrl = file.url;
    if (!publicUrl || (file.url && file.url.includes('X-Amz-Expires'))) {
      try {
        const { minioClient } = await import('@/lib/minio');
        publicUrl = await minioClient.presignedGetObject(
          process.env.MINIO_BUCKET_NAME || 'viralpeek-media',
          file.objectName,
          24 * 60 * 60 // 24 hours
        );
        
        // Update URL in database
        await prisma.mediaFile.update({
          where: { id: fileId },
          data: { url: publicUrl },
        });
      } catch (error) {
        console.error('Error generating URL:', error);
      }
    }

    return NextResponse.json({
      file: {
        ...file,
        url: publicUrl,
      },
    });
  } catch (error) {
    console.error('Get Media File Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// PUT: Cập nhật thông tin media file
export const PUT = withApiKeyAuth('media', 'update', async (req, { params }) => {
  try {
    const fileId = params.id;
    const body = await req.json();

    // Kiểm tra file có tồn tại không
    const existingFile = await prisma.mediaFile.findUnique({
      where: { id: fileId },
    });

    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const { name, metadata } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (metadata !== undefined) updateData.metadata = metadata;

    const updatedFile = await prisma.mediaFile.update({
      where: { id: fileId },
      data: updateData,
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
      message: 'File updated successfully',
      file: updatedFile,
    });
  } catch (error) {
    console.error('Update Media File Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// DELETE: Xóa media file
export const DELETE = withApiKeyAuth('media', 'delete', async (req, { params }) => {
  try {
    const fileId = params.id;

    // Kiểm tra file có tồn tại không
    const existingFile = await prisma.mediaFile.findUnique({
      where: { id: fileId },
    });

    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    try {
      // Xóa file từ MinIO
      const { minioClient } = await import('@/lib/minio');
      await minioClient.removeObject(
        process.env.MINIO_BUCKET_NAME || 'viralpeek-media',
        existingFile.objectName
      );
    } catch (error) {
      console.error('Error deleting file from MinIO:', error);
      // Continue with database deletion even if MinIO deletion fails
    }

    // Xóa record từ database
    await prisma.mediaFile.delete({
      where: { id: fileId },
    });

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete Media File Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});