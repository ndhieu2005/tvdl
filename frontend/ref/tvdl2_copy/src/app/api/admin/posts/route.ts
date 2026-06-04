import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withEditorAuth } from '@/lib/middleware/auth';

/**
 * @swagger
 * /api/admin/posts:
 *   get:
 *     summary: Lấy danh sách bài viết cho Admin
 *     description: Lấy danh sách bài viết với phân quyền - Editor chỉ xem bài viết của mình, Admin xem tất cả
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số bài viết mỗi trang
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, scheduled]
 *         description: Lọc theo trạng thái bài viết
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [trending_now, sounds, challenges, celebrities, top_lists, filters]
 *         description: Lọc theo danh mục
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề, nội dung hoặc tags
 *     responses:
 *       200:
 *         description: Danh sách bài viết được trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedPostsResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const GET = withEditorAuth(async (request: NextRequest) => {
  try {
    console.log('🔥 GET /api/admin/posts - Starting request');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Get user from request
    const user = (request as any).user;
    console.log('🔥 GET /api/admin/posts - User from request:', user);

    // Build query based on user role
    let whereClause: any = {};
    
    if (user.role === 'EDITOR') {
      // Editor can only see their own posts
      whereClause.authorId = user.userId;
      console.log('🔥 GET /api/admin/posts - Editor filter: authorId =', user.userId);
    } else if (user.role === 'ADMIN') {
      // Admin can see all posts from editors and other admins
      whereClause.author = {
        role: {
          in: ['ADMIN', 'EDITOR']
        }
      };
      console.log('🔥 GET /api/admin/posts - Admin filter: author role in [ADMIN, EDITOR]');
    }

    // Add additional filters
    if (status) {
      whereClause.status = status.toUpperCase();
    }
    
    if (category) {
      whereClause.category = category.toUpperCase();
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { 
          postTags: {
            some: {
              tag: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { slug: { contains: search, mode: 'insensitive' } }
                ]
              }
            }
          }
        }
      ];
    }

    console.log('🔥 GET /api/admin/posts - Final where clause:', JSON.stringify(whereClause, null, 2));

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          },
          postTags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                  featured: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({
        where: whereClause
      })
    ]);

    console.log('🔥 GET /api/admin/posts - Found posts:', posts.length);
    console.log('🔥 GET /api/admin/posts - Total posts:', total);

    const totalPages = Math.ceil(total / limit);

    // Format posts to include tags properly
    const formattedPosts = posts.map(post => ({
      ...post,
      tags: post.postTags?.map(pt => pt.tag) || [],
      postTags: undefined, // Remove the relation object from response
    }));

    return NextResponse.json({
      success: true,
      data: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('🔥 GET /api/admin/posts - Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/admin/posts:
 *   post:
 *     summary: Tạo bài viết mới
 *     description: Tạo bài viết mới với tags và category
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề bài viết
 *               slug:
 *                 type: string
 *                 description: URL slug
 *               content:
 *                 type: string
 *                 description: Nội dung bài viết
 *               excerpt:
 *                 type: string
 *                 description: Tóm tắt bài viết
 *               featuredImage:
 *                 type: string
 *                 description: URL hình ảnh đại diện
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, SCHEDULED]
 *                 description: Trạng thái bài viết
 *               categoryId:
 *                 type: string
 *                 description: ID danh mục
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Mảng ID các tags
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Thời gian xuất bản (cho SCHEDULED)
 *               seo:
 *                 type: object
 *                 properties:
 *                   metaTitle:
 *                     type: string
 *                   metaDescription:
 *                     type: string
 *                   keywords:
 *                     type: array
 *                     items:
 *                       type: string
 *             required:
 *               - title
 *               - content
 *               - categoryId
 *     responses:
 *       201:
 *         description: Bài viết được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
export const POST = withEditorAuth(async (request: NextRequest) => {
  try {
    console.log('🔥 POST /api/admin/posts - Starting request');
    
    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      status = 'DRAFT',
      categoryId,
      tagIds = [],
      publishedAt,
      seo = {}
    } = body;

    // Get user from request
    const user = (request as any).user;
    console.log('🔥 POST /api/admin/posts - User from request:', user);

    // Validate required fields
    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc: title, content, categoryId' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // Check if slug already exists
    const existingPost = await prisma.post.findFirst({
      where: { slug: finalSlug }
    });

    if (existingPost) {
      // Add timestamp to make it unique
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Danh mục không tồn tại' },
        { status: 400 }
      );
    }

    // Validate tags exist
    if (tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: { id: { in: tagIds } }
      });

      if (tags.length !== tagIds.length) {
        const foundIds = tags.map(tag => tag.id);
        const missingIds = tagIds.filter((id: string) => !foundIds.includes(id));
        return NextResponse.json(
          { success: false, error: `Tags không tồn tại: ${missingIds.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Create post in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create post
    
      console.log('🔥 POST /api/admin/posts - Creating post with data:', {
        title,
        slug: finalSlug,
        content,
        excerpt,
        featuredImage,
        status: status.toUpperCase(),
        categoryId,
        authorId: user.userId,
        createdBy: user.userId,
        publishDate: publishedAt ? new Date(publishedAt) : null,
        seoTitle: seo.metaTitle || null,
        seoDescription: seo.metaDescription || null,
        seoKeywords: seo.keywords && Array.isArray(seo.keywords) && seo.keywords.length > 0 ? seo.keywords.join(', ') : null
      });
      const post = await tx.post.create({
        data: {
          title,
          slug: finalSlug,
          content,
          excerpt,
          featuredImage,
          status: status.toUpperCase(),
          categoryId,
          authorId: user.userId,
          createdBy: user.userId,
          publishDate: publishedAt ? new Date(publishedAt) : null,
          seoTitle: seo.metaTitle || null,
          seoDescription: seo.metaDescription || null,
          seoKeywords: seo.keywords && Array.isArray(seo.keywords) && seo.keywords.length > 0 ? seo.keywords.join(', ') : null
        }
      });

      // Link tags to post
      if (tagIds.length > 0) {
        await tx.postTag.createMany({
          data: tagIds.map((tagId: string) => ({
            postId: post.id,
            tagId
          }))
        });
      }

      return post;
    });

    console.log('🔥 POST /api/admin/posts - Created post:', result.id);

    // Fetch complete post with relations
    const completePost = await prisma.post.findUnique({
      where: { id: result.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
                featured: true
              }
            }
          }
        }
      }
    });

    // Format response
    const formattedPost = {
      ...completePost,
      tags: completePost?.postTags?.map(pt => pt.tag) || [],
      postTags: undefined,
    };

    return NextResponse.json({
      success: true,
      data: formattedPost,
      message: 'Tạo bài viết thành công'
    }, { status: 201 });

  } catch (error) {
    console.error('🔥 POST /api/admin/posts - Error creating post:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo bài viết' },
      { status: 500 }
    );
  }
});