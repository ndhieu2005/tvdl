import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth } from '@/lib/middleware/api-auth';
import { PrismaClient } from '@prisma/client';

// Force Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient();

// GET: Lấy danh sách bài viết
export const GET = withApiKeyAuth('posts', 'read', async (req, context) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get Posts Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// POST: Tạo bài viết mới
export const POST = withApiKeyAuth('posts', 'create', async (req, context) => {
  try {
    const body = await req.json();
    const {
      title,
      content,
      excerpt,
      featuredImage,
      category,
      status = 'DRAFT',
      tags = [],
      publishDate,
      seoTitle,
      seoDescription,
      seoKeywords = [],
      videoUrl,
      videoThumbnail,
      videoPlatform,
      videoTitle,
      videoDescription,
      videoMetadata,
    } = body;

    // Validate required fields
    if (!title || !content || !category) {
      return NextResponse.json({
        error: 'Title, content, and category are required',
      }, { status: 400 });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json({
        error: 'A post with this title already exists',
      }, { status: 400 });
    }

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Handle category - find or create category
    const categorySlug = category;
    const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    
    let categoryRecord = await prisma.category.findFirst({
      where: { slug: categorySlug }
    });
    
    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: {
          name: categoryName,
          slug: categorySlug,
          description: `${categoryName} category`,
          status: 'ACTIVE'
        }
      });
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        categoryId: categoryRecord.id,
        status,
        tags,
        authorId: req.user!.id,
        createdBy: req.user!.id,
        publishDate: publishDate ? new Date(publishDate) : undefined,
        seoTitle,
        seoDescription,
        seoKeywords,
        videoUrl,
        videoThumbnail,
        videoPlatform,
        videoTitle,
        videoDescription,
        videoMetadata,
        readingTime,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Post created successfully',
      post,
    }, { status: 201 });
  } catch (error) {
    console.error('Create Post Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});