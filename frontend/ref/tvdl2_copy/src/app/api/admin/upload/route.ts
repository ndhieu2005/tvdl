import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { withAdminAuth } from '@/lib/middleware/auth';
import type { AuthenticatedRequest } from '@/lib/middleware/auth';

export const POST = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    console.log('⬆️ Admin API - File upload request');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'logo' or 'favicon'
    
    if (!file) {
      return NextResponse.json(
        { error: 'Không tìm thấy file' },
        { status: 400 }
      );
    }
    
    if (!type || !['logo', 'favicon'].includes(type)) {
      return NextResponse.json(
        { error: 'Loại file không hợp lệ' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File quá lớn. Kích thước tối đa 5MB' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = {
      logo: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'],
      favicon: ['image/jpeg', 'image/jpg', 'image/png', 'image/x-icon', 'image/vnd.microsoft.icon']
    };
    
    if (!allowedTypes[type as keyof typeof allowedTypes].includes(file.type)) {
      return NextResponse.json(
        { error: `Loại file không được hỗ trợ cho ${type}` },
        { status: 400 }
      );
    }
    
    // Check if MinIO is configured
    const isMinioConfigured = process.env.STORAGE_ENDPOINT && 
                               process.env.STORAGE_ACCESS_KEY && 
                               process.env.STORAGE_SECRET_KEY && 
                               process.env.STORAGE_BUCKET;
    
    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const filename = `${baseName}-${timestamp}${extension}`;
    
    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let publicUrl: string;
    
    if (isMinioConfigured) {
      // Upload to MinIO
      try {
        const { initializeBucket, getMinioClient, getBucketName } = await import('@/lib/minio');
        await initializeBucket();
        const client = getMinioClient();
        const bucket = getBucketName();
        const objectName = `uploads/${type}/${filename}`;
        
        const metadata = {
          'Content-Type': file.type,
          'Original-Name': originalName,
          'Upload-Type': type,
          'Uploaded-At': new Date().toISOString()
        };
        
        await client.putObject(bucket, objectName, buffer, buffer.length, metadata);
        
        // Generate public URL that will be served by our API
        publicUrl = `/api/public/files/${type}/${filename}`;
        
        console.log('⬆️ Admin API - File uploaded to MinIO successfully:', {
          objectName,
          bucket,
          publicUrl
        });
        
      } catch (minioError) {
        console.error('⬆️ Admin API - MinIO upload failed, falling back to local:', minioError);
        // Fall back to local storage
        await uploadToLocal(buffer, type, filename);
        publicUrl = `/api/public/files/${type}/${filename}`;
      }
    } else {
      // Upload to local filesystem
      await uploadToLocal(buffer, type, filename);
      publicUrl = `/api/public/files/${type}/${filename}`;
    }
    
    // Helper function for local upload
    async function uploadToLocal(buffer: Buffer, type: string, filename: string) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
    }
    
    console.log('⬆️ Admin API - File uploaded successfully:', {
      type,
      filename,
      size: file.size,
      publicUrl
    });
    
    return NextResponse.json({
      success: true,
      data: {
        filename,
        url: publicUrl,
        type: file.type,
        size: file.size
      },
      message: 'File đã được upload thành công'
    });
    
  } catch (error) {
    console.error('⬆️ Admin API - Upload error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi upload file' },
      { status: 500 }
    );
  }
});