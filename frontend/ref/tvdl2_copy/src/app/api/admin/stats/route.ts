import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withHybridAuth, HybridAuthRequest } from '@/lib/middleware/hybrid-auth';

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    },
  });
}

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Lấy thống kê dashboard admin
 *     description: Lấy các thống kê tổng quan cho dashboard admin
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Thống kê được trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPosts:
 *                       type: number
 *                     publishedPosts:
 *                       type: number
 *                     draftPosts:
 *                       type: number
 *                     totalViews:
 *                       type: number
 *                     todayViews:
 *                       type: number
 *                     totalComments:
 *                       type: number
 *                     trendingPosts:
 *                       type: number
 *                     recentPosts:
 *                       type: array
 *                       items:
 *                         type: object
 *       500:
 *         description: Lỗi server
 */
export const GET = withHybridAuth('post', 'read', async (request: HybridAuthRequest) => {
  try {
    console.log('🔥 GET /api/admin/stats - Starting request');
    
    const user = request.user;
    console.log('🔥 GET /api/admin/stats - User from request:', user);

    // Build query based on user role
    let whereClause: any = {};
    
    if (user && user.role === 'EDITOR') {
      // Editor can only see their own posts
      whereClause.authorId = user.userId;
    } else if (user && user.role === 'ADMIN') {
      // Admin can see all posts from editors and other admins
      whereClause.author = {
        role: {
          in: ['ADMIN', 'EDITOR']
        }
      };
    }

    // Get current date for today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all stats in parallel
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      todayViews,
      totalComments,
      trendingPosts,
      recentPosts
    ] = await Promise.all([
      // Total posts
      prisma.post.count({
        where: whereClause
      }),
      
      // Published posts
      prisma.post.count({
        where: {
          ...whereClause,
          status: 'PUBLISHED'
        }
      }),
      
      // Draft posts
      prisma.post.count({
        where: {
          ...whereClause,
          status: 'DRAFT'
        }
      }),
      
      // Total views (sum of all viewCount)
      prisma.post.aggregate({
        where: whereClause,
        _sum: {
          viewCount: true
        }
      }),
      
      // Today's views (posts created today)
      prisma.post.aggregate({
        where: {
          ...whereClause,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        },
        _sum: {
          viewCount: true
        }
      }),
      
      // Total comments (if you have comments table)
      // For now, we'll use a placeholder since comments might not be implemented
      Promise.resolve(0),
      
      // Trending posts (posts with high view count in trending category)
      prisma.post.count({
        where: {
          ...whereClause,
          status: 'PUBLISHED',
          category: {
            slug: {
              in: ['trending-now', 'trending']
            }
          }
        }
      }),
      
      // Recent posts (last 5 posts)
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
        take: 5
      })
    ]);

    // Try to get comments count if comments table exists
    let commentsCount = 0;
    try {
      // This will fail if comments table doesn't exist, which is fine
      commentsCount = await (prisma as any).comment?.count() || 0;
    } catch (error) {
      console.log('Comments table not found, using 0');
      commentsCount = 0;
    }

    const stats = {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews: totalViews._sum.viewCount || 0,
      todayViews: todayViews._sum.viewCount || 0,
      totalComments: commentsCount,
      trendingPosts,
      recentPosts: recentPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        createdAt: post.createdAt,
        viewCount: post.viewCount,
        featuredImage: post.featuredImage,
        category: post.category,
        author: post.author
      }))
    };

    console.log('🔥 GET /api/admin/stats - Stats:', stats);

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('🔥 GET /api/admin/stats - Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
});