import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withHybridAuth, HybridAuthRequest } from '@/lib/middleware/hybrid-auth';
import { PostStatus, PostCategory, PostInput } from '@/types/api';

// Constants for validation
const VALID_STATUSES: PostStatus[] = ['DRAFT', 'PUBLISHED', 'SCHEDULED'];

// Helper function to validate and convert status
function validateStatus(status?: string): PostStatus {
  if (!status) return 'DRAFT';
  const upperStatus = status.toUpperCase() as PostStatus;
  if (VALID_STATUSES.includes(upperStatus)) {
    return upperStatus;
  }
  throw new Error(`Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}`);
}

// Helper function to normalize category slug
function normalizeCategory(category: string): string {
  return category.toLowerCase().trim().replace(/\s+/g, '-');
}

// Helper function to generate category name from slug
function generateCategoryName(slug: string): string {
  return slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Helper function to find or create category
async function findOrCreateCategory(categoryInput: string) {
  if (!categoryInput) {
    // Default category
    const defaultSlug = 'trending-now';
    let category = await prisma.category.findFirst({
      where: { slug: defaultSlug }
    });
    
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'Trending Now',
          slug: defaultSlug,
          description: 'Latest trending content'
        }
      });
    }
    return category;
  }
  
  // Normalize category input
  const categorySlug = normalizeCategory(categoryInput);
  
  // Try to find existing category
  let category = await prisma.category.findFirst({
    where: { slug: categorySlug }
  });
  
  // If not found, create new category
  if (!category) {
    const categoryName = generateCategoryName(categorySlug);
    category = await prisma.category.create({
      data: {
        name: categoryName,
        slug: categorySlug,
        description: `Content related to ${categoryName.toLowerCase()}`
      }
    });
    console.log(`✅ Created new category: ${categoryName} (${categorySlug})`);
  }
  
  return category;
}

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Lấy danh sách bài viết
 *     description: Lấy danh sách bài viết với phân trang và bộ lọc
 *     tags: [Posts]
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
 *           enum: [trending-now, sounds, challenges, celebrities, top-lists, filters]
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
export const GET = withHybridAuth('post', 'read', async (request: HybridAuthRequest) => {
  try {
    console.log('🔥 GET /api/posts - Starting request');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Get user from request
    const user = request.user;
    console.log('🔥 GET /api/posts - User from request:', user);
    console.log('🔥 GET /api/posts - Auth type:', request.authType);

    // Build query based on user role
    let whereClause: any = {};
    
    if (user && user.role === 'EDITOR') {
      // Editor can only see their own posts
      whereClause.authorId = user.userId;
      console.log('🔥 GET /api/posts - Editor filter: authorId =', user.userId);
    } else if (user && user.role === 'ADMIN') {
      // Admin can see all posts from editors and other admins
      whereClause.author = {
        role: {
          in: ['ADMIN', 'EDITOR']
        }
      };
      console.log('🔥 GET /api/posts - Admin filter: author role in [ADMIN, EDITOR]');
    }

    // Add additional filters
    if (status) {
      const upperStatus = status.toUpperCase() as PostStatus;
      if (VALID_STATUSES.includes(upperStatus)) {
        whereClause.status = upperStatus;
      }
    }
    
    if (category) {
      // Use dynamic category lookup by slug
      const categorySlug = normalizeCategory(category);
      whereClause.category = {
        slug: categorySlug
      };
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }

    console.log('🔥 GET /api/posts - Final where clause:', JSON.stringify(whereClause, null, 2));

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
                  slug: true
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

    console.log('🔥 GET /api/posts - Found posts:', posts.length);
    console.log('🔥 GET /api/posts - Total posts:', total);

    // Transform data for frontend
    const transformedPosts = posts.map(post => ({
      ...post,
      // Keep category as object for display
      category: post.category ? {
        id: post.category.id,
        name: post.category.name,
        slug: post.category.slug,
        color: post.category.color
      } : null,
      // Add categorySlug for frontend dropdown selection
      categorySlug: post.category?.slug || '',
      // Transform tags from postTags relation to flat array
      tags: post.postTags?.map(pt => pt.tag) || [],
      // Remove postTags from response to avoid confusion
      postTags: undefined
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: transformedPosts,
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
    console.error('🔥 GET /api/posts - Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Tạo bài viết mới
 *     description: Tạo một bài viết mới trong hệ thống
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostInput'
 *     responses:
 *       201:
 *         description: Bài viết được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Post'
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const POST = withHybridAuth('post', 'create', async (request: HybridAuthRequest) => {
  try {
    console.log('🔥 POST /api/posts - Starting request');
    
    const body = await request.json();
    console.log('🔥 POST /api/posts - Request body:', body);
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Add author information from authenticated user
    const user = request.user;
    console.log('🔥 POST /api/posts - User from request:', user);
    console.log('🔥 POST /api/posts - Auth type:', request.authType);
    
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      );
    }
    
    // Generate slug if not provided
    const slug = body.slug || body.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug }
    });
    
    if (existingPost) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Handle status validation
    let postStatus: PostStatus = 'DRAFT';
    if (body.status) {
      try {
        postStatus = validateStatus(body.status);
      } catch (error) {
        console.error('🔥 POST /api/posts - Invalid status:', body.status);
        return NextResponse.json(
          { success: false, error: error instanceof Error ? error.message : 'Invalid status' },
          { status: 400 }
        );
      }
    }
    
    // Handle category - find or create dynamically
    let categoryId: string;
    try {
      const category = await findOrCreateCategory(body.category);
      categoryId = category.id;
    } catch (error) {
      console.error('🔥 POST /api/posts - Category error:', error);
      return NextResponse.json(
        { success: false, error: `Failed to process category: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 400 }
      );
    }
    
    // Handle tags processing
    let tagsToUpdate: string[] = [];
    let tagIds: string[] = [];
    
    // Check for tagIds first (from frontend)
    if (body.tagIds && Array.isArray(body.tagIds)) {
      tagIds = body.tagIds;
      
      // Get tag names from database for tags field
      if (tagIds.length > 0) {
        const tags = await prisma.tag.findMany({
          where: { id: { in: tagIds } },
          select: { id: true, name: true }
        });
        tagsToUpdate = tags.map(tag => tag.name);
      }
    }
    // Fallback to body.tags (legacy support)
    else if (body.tags && Array.isArray(body.tags)) {
      if (body.tags.length > 0 && typeof body.tags[0] === 'object' && body.tags[0].id) {
        tagIds = body.tags.map((tag: any) => tag.id);
        tagsToUpdate = body.tags.map((tag: any) => tag.name || tag.slug);
      } else if (body.tags.length > 0 && typeof body.tags[0] === 'string') {
        tagsToUpdate = body.tags as string[];
      }
    }
    
    console.log('🔥 POST /api/posts - Final status:', postStatus);
    console.log('🔥 POST /api/posts - Category ID:', categoryId);
    console.log('🔥 POST /api/posts - Tags to update:', tagsToUpdate);
    console.log('🔥 POST /api/posts - Tag IDs:', tagIds);

    console.log('🔥 POST /api/posts - Creating post with status:', postStatus, 'categoryId:', categoryId);

    // Create post in database
    const post = await prisma.post.create({
      data: {
        title: body.title,
        slug,
        content: body.content,
        excerpt: body.excerpt || body.content.substring(0, 200) + '...',
        status: postStatus,
        categoryId: categoryId,
        tags: tagsToUpdate.length > 0 ? tagsToUpdate.join(',') : null,
        authorId: user.userId,
        createdBy: user.userId,
        publishDate: postStatus === 'PUBLISHED' 
          ? new Date() 
          : body.publishDate 
          ? new Date(body.publishDate) 
          : null,
        seoTitle: body.seoTitle || body.title,
        seoDescription: body.seoDescription || body.excerpt || body.content.substring(0, 160),
        featuredImage: body.featuredImage || null,
        // Video fields
        videoUrl: body.videoUrl || null,
        videoThumbnail: body.videoThumbnail || null,
        videoPlatform: body.videoPlatform || null,
        videoTitle: body.videoTitle || null,
        videoDescription: body.videoDescription || null,
        videoMetadata: body.videoMetadata || null,
        viewCount: 0,
        likeCount: 0,
        shareCount: 0,
        commentCount: 0
      },
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
        }
      }
    });

    console.log('🔥 POST /api/posts - Post created:', post);

    // Create postTags relation if tagIds provided
    if (tagIds && tagIds.length > 0) {
      await prisma.postTag.createMany({
        data: tagIds.map(tagId => ({
          postId: post.id,
          tagId: tagId
        }))
      });
      console.log('🔥 POST /api/posts - PostTags created:', tagIds.length);
    }

    // Get final post with all relations
    const finalPost = await prisma.post.findUnique({
      where: { id: post.id },
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
                slug: true
              }
            }
          }
        }
      }
    });

    // Transform data for frontend
    const transformedPost = {
      ...finalPost,
      // Keep category as object for display
      category: finalPost?.category ? {
        id: finalPost.category.id,
        name: finalPost.category.name,
        slug: finalPost.category.slug,
        color: finalPost.category.color
      } : null,
      // Add categorySlug for frontend dropdown selection
      categorySlug: finalPost?.category?.slug || '',
      // Transform tags from postTags relation to flat array
      tags: finalPost?.postTags?.map(pt => pt.tag) || [],
      // Remove postTags from response to avoid confusion
      postTags: undefined
    };

    return NextResponse.json({
      success: true,
      data: transformedPost,
      message: 'Post created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('🔥 POST /api/posts - Error creating post:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
});