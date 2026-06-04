import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware/auth';

// GET: Thống kê tags (Admin)
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || '7d'; // 7d, 30d, 90d, 1y
    
    // Tính toán thời gian
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Thống kê tổng quan
    const [
      totalTags,
      activeTags,
      inactiveTags,
      featuredTags,
      tagsWithPosts,
      recentTags
    ] = await Promise.all([
      prisma.tag.count(),
      prisma.tag.count({ where: { status: 'ACTIVE' } }),
      prisma.tag.count({ where: { status: 'INACTIVE' } }),
      prisma.tag.count({ where: { featured: true } }),
      prisma.tag.count({
        where: {
          posts: {
            some: {}
          }
        }
      }),
      prisma.tag.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      })
    ]);

    // Top tags được sử dụng nhiều nhất
    const topTags = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        postCount: true,
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        postCount: 'desc'
      },
      take: 10
    });

    // Tags mới nhất
    const latestTags = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Thống kê theo tháng (6 tháng gần nhất)
    const monthlyStats = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "tags"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `;

    // Tags chưa được sử dụng
    const unusedTags = await prisma.tag.findMany({
      where: {
        postCount: 0,
        posts: {
          none: {}
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalTags,
          activeTags,
          inactiveTags,
          featuredTags,
          tagsWithPosts,
          unusedTags: totalTags - tagsWithPosts,
          recentTags,
          usageRate: totalTags > 0 ? Math.round((tagsWithPosts / totalTags) * 100) : 0
        },
        topTags: topTags.map(tag => ({
          ...tag,
          postCount: tag._count.posts
        })),
        latestTags,
        unusedTags,
        monthlyStats,
        period
      }
    });

  } catch (error) {
    console.error('Admin Tags Stats Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy thống kê tags' },
      { status: 500 }
    );
  }
});