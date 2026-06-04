import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withEditorAuth } from '@/lib/middleware/auth';
import { PostStatus, PostCategory } from '@/types/api';

// Video-specific platform mapping
const VIDEO_PLATFORMS = ['tiktok', 'youtube', 'upload', 'other'] as const;
type VideoPlatform = typeof VIDEO_PLATFORMS[number];

// Interface for video creation
interface VideoInput {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  platform: VideoPlatform;
  category: string;
  tags?: string[];
  status: 'active' | 'inactive';
  metaTitle?: string;
  metaDescription?: string;
}

// Helper function to convert video status to post status
function mapVideoStatusToPostStatus(status: 'active' | 'inactive'): PostStatus {
  return status === 'active' ? 'PUBLISHED' : 'DRAFT';
}

// Helper function to convert category to PostCategory
function mapCategoryToPostCategory(category: string): PostCategory {
  const categoryMap: Record<string, PostCategory> = {
    'Dance': 'TRENDING_NOW',
    'Comedy': 'TRENDING_NOW', 
    'Food': 'TRENDING_NOW',
    'Beauty': 'TRENDING_NOW',
    'Fashion': 'TRENDING_NOW',
    'Travel': 'TRENDING_NOW',
    'Educational': 'TRENDING_NOW',
    'Sports': 'TRENDING_NOW',
    'Music': 'SOUNDS',
    'Trends': 'TRENDING_NOW',
    'Challenge': 'CHALLENGES',
    'Other': 'TRENDING_NOW'
  };
  
  return categoryMap[category] || 'TRENDING_NOW';
}

// Helper function to generate unique slug
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Lấy danh sách video
 *     description: Lấy danh sách video với phân trang và bộ lọc
 *     tags: [Videos]
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
 *         description: Số video mỗi trang
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [tiktok, youtube, upload, other]
 *         description: Lọc theo platform
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề
 *     responses:
 *       200:
 *         description: Danh sách video được trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 */
export const GET = withEditorAuth(async (request: NextRequest) => {
  try {
    console.log('🎬 GET /api/videos - Starting request');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Get user from request
    const user = (request as any).user;
    console.log('🎬 GET /api/videos - User from request:', user);

    // Build query based on user role
    let whereClause: any = {};
    
    if (user.role === 'EDITOR') {
      whereClause.authorId = user.userId;
    } else if (user.role === 'ADMIN') {
      whereClause.author = {
        role: {
          in: ['ADMIN', 'EDITOR']
        }
      };
    }

    // Add video-specific filters
    if (platform && VIDEO_PLATFORMS.includes(platform as VideoPlatform)) {
      // Filter by content containing video URL patterns
      whereClause.content = {
        contains: platform === 'tiktok' ? 'tiktok.com' : 
                  platform === 'youtube' ? 'youtube.com' : 
                  platform === 'upload' ? 'upload://' : 
                  'other://'
      };
    }
    
    if (status) {
      const postStatus = mapVideoStatusToPostStatus(status as 'active' | 'inactive');
      whereClause.status = postStatus;
    }
    
    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' };
    }

    console.log('🎬 GET /api/videos - Final where clause:', JSON.stringify(whereClause, null, 2));

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

    // Transform posts to video format
    const videos = posts.map(post => {
      // Extract platform from content
      let platform: VideoPlatform = 'other';
      if (post.content.includes('tiktok.com')) platform = 'tiktok';
      else if (post.content.includes('youtube.com')) platform = 'youtube';
      else if (post.content.includes('upload://')) platform = 'upload';

      return {
        id: post.id,
        title: post.title,
        description: post.content,
        thumbnail: post.featuredImage || '',
        videoUrl: post.content.match(/https?:\/\/[^\s]+/)?.[0] || '',
        platform,
        status: post.status === 'PUBLISHED' ? 'active' : 'inactive',
        duration: 0, // Could be stored in metadata
        views: post.viewCount,
        likes: post.likeCount,
        shares: post.shareCount,
        tags: post.tags,
        category: post.category.slug,
        uploadedAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        uploadedBy: post.author.name
      };
    });

    console.log('🎬 GET /api/videos - Found videos:', videos.length);
    console.log('🎬 GET /api/videos - Total videos:', total);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: videos,
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
    console.error('🎬 GET /api/videos - Error fetching videos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/videos:
 *   post:
 *     summary: Tạo video mới
 *     description: Tạo một video mới trong hệ thống
 *     tags: [Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - videoUrl
 *               - platform
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề video
 *               description:
 *                 type: string
 *                 description: Mô tả video
 *               videoUrl:
 *                 type: string
 *                 description: URL của video
 *               thumbnailUrl:
 *                 type: string
 *                 description: URL thumbnail
 *               platform:
 *                 type: string
 *                 enum: [tiktok, youtube, upload, other]
 *                 description: Platform của video
 *               category:
 *                 type: string
 *                 description: Danh mục video
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags của video
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Trạng thái video
 *               metaTitle:
 *                 type: string
 *                 description: Tiêu đề SEO
 *               metaDescription:
 *                 type: string
 *                 description: Mô tả SEO
 *     responses:
 *       201:
 *         description: Video được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
export const POST = withEditorAuth(async (request: NextRequest) => {
  try {
    console.log('🎬 POST /api/videos - Starting request');
    
    const body: VideoInput = await request.json();
    console.log('🎬 POST /api/videos - Request body:', body);
    
    // Validate required fields
    if (!body.title || !body.description || !body.videoUrl || !body.platform || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Title, description, videoUrl, platform and category are required' },
        { status: 400 }
      );
    }

    // Validate platform
    if (!VIDEO_PLATFORMS.includes(body.platform)) {
      return NextResponse.json(
        { success: false, error: `Invalid platform: ${body.platform}` },
        { status: 400 }
      );
    }

    // Add author information from authenticated user
    const user = (request as any).user;
    console.log('🎬 POST /api/videos - User from request:', user);
    
    // Generate unique slug
    const slug = await generateUniqueSlug(body.title);
    
    // Map video data to post data
    const postStatus = mapVideoStatusToPostStatus(body.status || 'active');
    
    // Handle category - find or create category
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
    
    // Create content with video information
    const content = `${body.description}\n\nVideo URL: ${body.videoUrl}\nPlatform: ${body.platform}`;
    
    console.log('🎬 POST /api/videos - Creating post with:', {
      title: body.title,
      slug,
      content,
      status: postStatus,
      categoryId: category.id,
      platform: body.platform
    });

    // Create post in database
    const post = await prisma.post.create({
      data: {
        title: body.title,
        slug,
        content,
        excerpt: body.description.substring(0, 200) + (body.description.length > 200 ? '...' : ''),
        status: postStatus,
        categoryId: category.id,
        tags: Array.isArray(body.tags) ? body.tags.join(',') : (body.tags || ''),
        authorId: user.userId,
        createdBy: user.userId,
        publishDate: postStatus === 'PUBLISHED' ? new Date() : null,
        seoTitle: body.metaTitle || body.title,
        seoDescription: body.metaDescription || body.description.substring(0, 160),
        featuredImage: body.thumbnailUrl || null,
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

    console.log('🎬 POST /api/videos - Post created:', post.id);

    // Transform post back to video format for response
    const video = {
      id: post.id,
      title: post.title,
      description: body.description,
      thumbnail: post.featuredImage || '',
      videoUrl: body.videoUrl,
      platform: body.platform,
      status: post.status === 'PUBLISHED' ? 'active' : 'inactive',
      duration: 0,
      views: post.viewCount,
      likes: post.likeCount,
      shares: post.shareCount,
      tags: post.tags,
      category: post.category.slug,
      uploadedAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      uploadedBy: post.author.name
    };

    return NextResponse.json({
      success: true,
      data: video,
      message: 'Video created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('🎬 POST /api/videos - Error creating video:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to create video' },
      { status: 500 }
    );
  }
});