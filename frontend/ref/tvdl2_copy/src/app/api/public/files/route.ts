import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth } from '@/lib/middleware/api-auth';

// GET: Lấy danh sách files với API key
export const GET = withApiKeyAuth('file', 'read', async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const type = url.searchParams.get('type'); // IMAGE, VIDEO, AUDIO, DOCUMENT
    const search = url.searchParams.get('search');
    
    console.log('📁 Public API - Getting files with params:', {
      page,
      limit,
      type,
      search
    });

    const { prisma } = await import('@/lib/prisma');
    
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
    
    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.mediaFile.count({ where })
    ]);
    
    console.log('📁 Public API - Files found:', files.length);
    
    return NextResponse.json({
      success: true,
      data: files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('📁 Public API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách files' },
      { status: 500 }
    );
  }
});

// POST: Upload file với API key
export const POST = withApiKeyAuth('file', 'upload', async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'File là bắt buộc' },
        { status: 400 }
      );
    }

    // Get user ID from API key context
    const userReq = req as any;
    const userId = userReq.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Không thể xác định user ID từ API key' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Generate unique object name
    const timestamp = Date.now();
    const objectName = `${timestamp}-${file.name}`;
    
    // Create file record
    const fileRecord = await prisma.mediaFile.create({
      data: {
        name: name || file.name,
        originalName: file.name,
        objectName,
        type: (type as any) || 'IMAGE',
        mimeType: file.type,
        size: file.size,
        uploadedBy: userId,
        url: `/uploads/${objectName}`, // Placeholder URL
        metadata: {
          uploadedAt: new Date(),
          userAgent: req.headers.get('user-agent')
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

    return NextResponse.json({
      success: true,
      data: fileRecord,
      message: 'File đã được upload thành công'
    });

  } catch (error) {
    console.error('📁 Public API - Upload Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi upload file' },
      { status: 500 }
    );
  }
});

// PUT: Update file với API key
export const PUT = withApiKeyAuth('file', 'update', async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const fileId = url.searchParams.get('id');
    const body = await req.json();

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID là bắt buộc' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    const updatedFile = await prisma.mediaFile.update({
      where: { id: fileId },
      data: {
        name: body.name,
        metadata: body.metadata,
        updatedAt: new Date()
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

    return NextResponse.json({
      success: true,
      data: updatedFile,
      message: 'File đã được cập nhật thành công'
    });

  } catch (error) {
    console.error('📁 Public API - Update Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật file' },
      { status: 500 }
    );
  }
});

// DELETE: Xóa file với API key
export const DELETE = withApiKeyAuth('file', 'delete', async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const fileId = url.searchParams.get('id');

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID là bắt buộc' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    await prisma.mediaFile.delete({
      where: { id: fileId }
    });

    return NextResponse.json({
      success: true,
      message: 'File đã được xóa thành công'
    });

  } catch (error) {
    console.error('📁 Public API - Delete Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa file' },
      { status: 500 }
    );
  }
});