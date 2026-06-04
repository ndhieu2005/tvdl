import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth } from '@/lib/middleware/api-auth';

// GET: Lấy danh sách tags với API key
export const GET = withApiKeyAuth('tag', 'read', async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search');
    const featured = url.searchParams.get('featured');
    const sortBy = url.searchParams.get('sortBy') || 'postCount';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    
    console.log('🏷️ Public API - Getting tags with params:', {
      page,
      limit,
      search,
      featured,
      sortBy,
      sortOrder
    });

    const { prisma } = await import('@/lib/prisma');
    
    const skip = (page - 1) * limit;
    
    const where: any = {
      status: 'ACTIVE', // Only active tags
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (featured === 'true') {
      where.featured = true;
    }

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          color: true,
          featured: true,
          postCount: true,
          usageCount: true,
          metaTitle: true,
          metaDescription: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
            },
          },
        },
      }),
      prisma.tag.count({ where }),
    ]);
    
    console.log('🏷️ Public API - Tags found:', tags.length);
    
    return NextResponse.json({
      success: true,
      data: tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        color: tag.color,
        featured: tag.featured,
        postCount: tag._count.posts,
        usageCount: tag.usageCount,
        metaTitle: tag.metaTitle,
        metaDescription: tag.metaDescription,
        createdAt: tag.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('🏷️ Public API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách tags' },
      { status: 500 }
    );
  }
});

// POST: Tạo tag với API key (for programmatic access)
export const POST = withApiKeyAuth('tag', 'create', async (req: NextRequest) => {
  try {
    const body = await req.json();
    console.log('🏷️ Public API - Creating tag with data:', body);

    const { prisma } = await import('@/lib/prisma');
    
    const { name, slug, description, color } = body;
    
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name và slug là bắt buộc' },
        { status: 400 }
      );
    }

    // Check if tag exists
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag name hoặc slug đã tồn tại' },
        { status: 400 }
      );
    }

    // Create new tag
    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
        description,
        color: color || '#8B5CF6',
        status: 'ACTIVE',
        createdBy: 'api-key' // Since we don't have user context in API key auth
      }
    });

    return NextResponse.json({
      success: true,
      data: tag,
      message: 'Tạo tag thành công'
    });

  } catch (error) {
    console.error('🏷️ Public API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo tag' },
      { status: 500 }
    );
  }
});

// PUT: Update tag với API key
export const PUT = withApiKeyAuth('tag', 'update', async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { id, name, slug, description, color, featured } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID tag là bắt buộc' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag không tồn tại' },
        { status: 404 }
      );
    }

    // Check for duplicate name/slug if changed
    if (name && name !== existingTag.name) {
      const duplicateName = await prisma.tag.findFirst({
        where: {
          name,
          id: { not: id }
        }
      });
      if (duplicateName) {
        return NextResponse.json(
          { error: 'Tên tag đã tồn tại' },
          { status: 400 }
        );
      }
    }

    if (slug && slug !== existingTag.slug) {
      const duplicateSlug = await prisma.tag.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      });
      if (duplicateSlug) {
        return NextResponse.json(
          { error: 'Slug tag đã tồn tại' },
          { status: 400 }
        );
      }
    }

    // Update tag
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(featured !== undefined && { featured }),
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedTag,
      message: 'Cập nhật tag thành công'
    });

  } catch (error) {
    console.error('🏷️ Public API - Update Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật tag' },
      { status: 500 }
    );
  }
});

// DELETE: Xóa tag với API key
export const DELETE = withApiKeyAuth('tag', 'delete', async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const tagId = url.searchParams.get('id');

    if (!tagId) {
      return NextResponse.json(
        { error: 'ID tag là bắt buộc' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag không tồn tại' },
        { status: 404 }
      );
    }

    // Check if tag is being used
    if (existingTag._count.posts > 0) {
      return NextResponse.json(
        { error: `Tag đang được sử dụng bởi ${existingTag._count.posts} bài viết` },
        { status: 400 }
      );
    }

    // Delete tag
    await prisma.tag.delete({
      where: { id: tagId }
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa tag thành công'
    });

  } catch (error) {
    console.error('🏷️ Public API - Delete Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa tag' },
      { status: 500 }
    );
  }
});