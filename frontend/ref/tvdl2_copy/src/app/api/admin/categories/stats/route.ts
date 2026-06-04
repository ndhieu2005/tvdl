import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Get category statistics
export async function GET(req: NextRequest) {
  try {
    console.log('📊 Admin API - Getting category statistics');

    // Get posts count by category
    const categoryStats = await prisma.post.groupBy({
      by: ['categoryId'],
      _count: {
        id: true
      },
      _sum: {
        viewCount: true,
        likeCount: true,
        shareCount: true,
        commentCount: true
      },
      _avg: {
        priorityScore: true
      }
    });

    // Get total stats
    const totalStats = await prisma.post.aggregate({
      _count: {
        id: true
      },
      _sum: {
        viewCount: true,
        likeCount: true,
        shareCount: true,
        commentCount: true
      }
    });

    // Get posts by status for each category
    const statusStats = await prisma.post.groupBy({
      by: ['categoryId', 'status'],
      _count: {
        id: true
      }
    });

    // Get recent activity (posts created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await prisma.post.groupBy({
      by: ['categoryId'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      }
    });

    // Get category details
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    // Format the response with category names
    const formattedStats = await Promise.all(
      categoryStats.map(async (stat) => {
        const category = categories.find(c => c.id === stat.categoryId);
        return {
          category: category?.slug || stat.categoryId,
          categoryId: stat.categoryId,
          postsCount: stat._count.id,
          totalViews: stat._sum.viewCount || 0,
          totalLikes: stat._sum.likeCount || 0,
          totalShares: stat._sum.shareCount || 0,
          totalComments: stat._sum.commentCount || 0,
          averagePriority: stat._avg.priorityScore || 0,
          recentPosts: recentActivity.find(r => r.categoryId === stat.categoryId)?._count.id || 0,
          publishedPosts: statusStats.filter(s => s.categoryId === stat.categoryId && s.status === 'PUBLISHED').reduce((sum, s) => sum + s._count.id, 0),
          draftPosts: statusStats.filter(s => s.categoryId === stat.categoryId && s.status === 'DRAFT').reduce((sum, s) => sum + s._count.id, 0),
          scheduledPosts: statusStats.filter(s => s.categoryId === stat.categoryId && s.status === 'SCHEDULED').reduce((sum, s) => sum + s._count.id, 0),
        };
      })
    );

    // Sort by posts count
    formattedStats.sort((a, b) => b.postsCount - a.postsCount);

    console.log('📊 Admin API - Category statistics calculated');
    
    return NextResponse.json({
      success: true,
      data: {
        categories: formattedStats,
        totals: {
          totalPosts: totalStats._count.id || 0,
          totalViews: totalStats._sum.viewCount || 0,
          totalLikes: totalStats._sum.likeCount || 0,
          totalShares: totalStats._sum.shareCount || 0,
          totalComments: totalStats._sum.commentCount || 0,
          totalCategories: formattedStats.length,
          recentPosts: recentActivity.reduce((sum, r) => sum + r._count.id, 0)
        }
      }
    });

  } catch (error) {
    console.error('📊 Admin API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy thống kê categories' },
      { status: 500 }
    );
  }
}