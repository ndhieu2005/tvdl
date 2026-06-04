import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth } from '@/lib/middleware/api-auth';

// GET: Public API để lấy posts với API key
export const GET = withApiKeyAuth('post', 'read', async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status') || 'published';
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    
    console.log('📚 Public API - Getting posts with params:', {
      page,
      limit,
      status,
      category,
      search
    });

    // Import Posts service
    const { getPostsWithFilters } = await import('@/lib/posts');
    
    const result = await getPostsWithFilters({
      page,
      limit,
      status,
      category: category || undefined,
      search: search || undefined
    });
    
    console.log('📚 Public API - Posts found:', result.posts.length);
    
    return NextResponse.json({
      success: true,
      data: result.posts,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit)
      }
    });

  } catch (error) {
    console.error('📚 Public API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách bài viết' },
      { status: 500 }
    );
  }
});

// POST: Public API để tạo bài post với API key
export const POST = withApiKeyAuth('post', 'create', async (req: NextRequest) => {
  try {
    const body = await req.json();
    console.log('📝 Public API - Creating post with data:', body);

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title và content là bắt buộc' },
        { status: 400 }
      );
    }

    // Import Prisma
    const { prisma } = await import('@/lib/prisma');
    
    // Get user ID from API key context
    const userReq = req as any;
    const userId = userReq.user?.id;
    
    console.log('📝 Public API - User context:', {
      hasUser: !!userReq.user,
      hasApiKey: !!userReq.apiKey,
      userId
    });
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Không thể xác định user ID từ API key' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug }
    });

    if (existingPost) {
      return NextResponse.json(
        { error: 'Slug đã tồn tại' },
        { status: 400 }
      );
    }

    // Handle category - find or create category
    const categorySlug = body.category || 'trending-now';
    const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    
    let category = await prisma.category.findFirst({
      where: { slug: categorySlug }
    });
    
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          slug: categorySlug,
          description: `${categoryName} category`,
          status: 'ACTIVE'
        }
      });
    }

    const postData = {
      title: body.title,
      slug,
      content: body.content,
      excerpt: body.excerpt || '',
      featuredImage: body.featuredImage || '',
      categoryId: category.id,
      status: body.status || 'DRAFT',
      tags: body.tags || [],
      authorId: userId,
      createdBy: userId,
      publishDate: body.publishDate ? new Date(body.publishDate) : null,
      seoTitle: body.seoTitle || body.title,
      seoDescription: body.seoDescription || body.excerpt,
      seoKeywords: body.seoKeywords || [],
      videoUrl: body.videoUrl || null,
      videoThumbnail: body.videoThumbnail || null,
      videoPlatform: body.videoPlatform || null,
      videoTitle: body.videoTitle || null,
      videoDescription: body.videoDescription || null,
      videoMetadata: body.videoMetadata || null,
      readingTime: body.readingTime || null,
      priorityScore: body.priorityScore || 0.0
    };

    const result = await prisma.post.create({
      data: postData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        }
      }
    });
    
    console.log('📝 Public API - Post created:', result.id);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Bài viết đã được tạo thành công'
    });

  } catch (error) {
    console.error('📝 Public API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo bài viết' },
      { status: 500 }
    );
  }
});

// PUT: Update post với API key
export const PUT = withApiKeyAuth('post', 'update', async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get('id');
    const body = await req.json();

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID là bắt buộc' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        category: true
      }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Bài viết không tồn tại' },
        { status: 404 }
      );
    }

    // Handle category update if provided
    let categoryId = existingPost.categoryId;
    if (body.category) {
      const categorySlug = body.category;
      const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      
      let category = await prisma.category.findFirst({
        where: { slug: categorySlug }
      });
      
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryName,
            slug: categorySlug,
            description: `${categoryName} category`,
            status: 'ACTIVE'
          }
        });
      }
      
      categoryId = category.id;
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: body.title || existingPost.title,
        content: body.content || existingPost.content,
        excerpt: body.excerpt || existingPost.excerpt,
        featuredImage: body.featuredImage || existingPost.featuredImage,
        categoryId: categoryId,
        status: body.status || existingPost.status,
        tags: body.tags || existingPost.tags,
        seoTitle: body.seoTitle || existingPost.seoTitle,
        seoDescription: body.seoDescription || existingPost.seoDescription,
        seoKeywords: body.seoKeywords || existingPost.seoKeywords,
        videoUrl: body.videoUrl || existingPost.videoUrl,
        videoThumbnail: body.videoThumbnail || existingPost.videoThumbnail,
        videoPlatform: body.videoPlatform || existingPost.videoPlatform,
        videoTitle: body.videoTitle || existingPost.videoTitle,
        videoDescription: body.videoDescription || existingPost.videoDescription,
        videoMetadata: body.videoMetadata || existingPost.videoMetadata,
        readingTime: body.readingTime || existingPost.readingTime,
        priorityScore: body.priorityScore || existingPost.priorityScore,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedPost,
      message: 'Bài viết đã được cập nhật thành công'
    });

  } catch (error) {
    console.error('📝 Public API - Update Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật bài viết' },
      { status: 500 }
    );
  }
});

// DELETE: Xóa post với API key
export const DELETE = withApiKeyAuth('post', 'delete', async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID là bắt buộc' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Bài viết không tồn tại' },
        { status: 404 }
      );
    }

    // Delete post
    await prisma.post.delete({
      where: { id: postId }
    });

    return NextResponse.json({
      success: true,
      message: 'Bài viết đã được xóa thành công'
    });

  } catch (error) {
    console.error('📝 Public API - Delete Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa bài viết' },
      { status: 500 }
    );
  }
});