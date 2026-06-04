import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Category analytics and detailed statistics
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('timeRange') || '30'; // days
    const includeDetails = url.searchParams.get('includeDetails') === 'true';
    
    console.log('📊 Admin API - Getting category analytics:', {
      timeRange,
      includeDetails
    });

    const days = parseInt(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Predefined categories
    const PREDEFINED_CATEGORIES = {
      'TRENDING_NOW': { 
        id: 'TRENDING_NOW', 
        name: 'Trending Now', 
        slug: 'trending-now',
        description: 'Những xu hướng hot nhất hiện tại trên TikTok',
        color: '#8B5CF6',
        status: 'active'
      },
      'SOUNDS': { 
        id: 'SOUNDS', 
        name: 'Sounds', 
        slug: 'sounds',
        description: 'Âm thanh và nhạc nền trending',
        color: '#EF4444',
        status: 'active'
      },
      'CHALLENGES': { 
        id: 'CHALLENGES', 
        name: 'Challenges', 
        slug: 'challenges',
        description: 'Các thử thách viral trên TikTok',
        color: '#F59E0B',
        status: 'active'
      },
      'CELEBRITIES': { 
        id: 'CELEBRITIES', 
        name: 'Celebrities', 
        slug: 'celebrities',
        description: 'Tin tức về các nghệ sĩ và người nổi tiếng',
        color: '#10B981',
        status: 'active'
      },
      'TOP_LISTS': { 
        id: 'TOP_LISTS', 
        name: 'Top Lists', 
        slug: 'top-lists',
        description: 'Danh sách top trending',
        color: '#EC4899',
        status: 'active'
      },
      'FILTERS': { 
        id: 'FILTERS', 
        name: 'Filters', 
        slug: 'filters',
        description: 'Filters và effects hot',
        color: '#3B82F6',
        status: 'active'
      },
      'SOCIAL_MEDIA': { 
        id: 'SOCIAL_MEDIA', 
        name: 'Social Media', 
        slug: 'social-media',
        description: 'Tin tức về các nền tảng mạng xã hội',
        color: '#6366F1',
        status: 'active'
      },
      'GUIDELINES': { 
        id: 'GUIDELINES', 
        name: 'Guidelines', 
        slug: 'guidelines',
        description: 'Hướng dẫn và tips',
        color: '#84CC16',
        status: 'active'
      }
    };

    const categoryKeys = Object.keys(PREDEFINED_CATEGORIES);
    
    // First, get or create categories in database
    const dbCategories = await Promise.all(
      categoryKeys.map(async (categoryKey) => {
        const categoryInfo = PREDEFINED_CATEGORIES[categoryKey as keyof typeof PREDEFINED_CATEGORIES];
        
        // Try to find existing category
        let dbCategory = await prisma.category.findFirst({
          where: { slug: categoryInfo.slug }
        });
        
        // Create if doesn't exist
        if (!dbCategory) {
          dbCategory = await prisma.category.create({
            data: {
              name: categoryInfo.name,
              slug: categoryInfo.slug,
              description: categoryInfo.description,
              color: categoryInfo.color,
              status: categoryInfo.status === 'active' ? 'ACTIVE' : 'INACTIVE'
            }
          });
        }
        
        return { categoryKey, dbCategory };
      })
    );

    // Get stats for each category
    const categoryStats = await Promise.all(
      dbCategories.map(async ({ categoryKey, dbCategory }) => {
        const categoryInfo = PREDEFINED_CATEGORIES[categoryKey as keyof typeof PREDEFINED_CATEGORIES];
        
        // Get posts count
        const postsCount = await prisma.post.count({
          where: { 
            categoryId: dbCategory.id,
            createdAt: { gte: startDate }
          }
        });

        // Get total posts count (all time)
        const totalPosts = await prisma.post.count({
          where: { categoryId: dbCategory.id }
        });

        // Get aggregated stats
        const stats = await prisma.post.aggregate({
          where: { 
            categoryId: dbCategory.id,
            createdAt: { gte: startDate }
          },
          _sum: {
            viewCount: true,
            likeCount: true,
            shareCount: true,
            commentCount: true,
            priorityScore: true
          },
          _avg: {
            priorityScore: true
          }
        });

        // Get recent posts if details requested
        let recentPosts: any[] = [];
        if (includeDetails) {
          recentPosts = await prisma.post.findMany({
            where: { 
              categoryId: dbCategory.id,
              createdAt: { gte: startDate }
            },
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              viewCount: true,
              likeCount: true,
              shareCount: true,
              commentCount: true,
              createdAt: true,
              publishDate: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          });
        }

        // Get status distribution
        const statusDistribution = await prisma.post.groupBy({
          by: ['status'],
          where: { 
            categoryId: dbCategory.id,
            createdAt: { gte: startDate }
          },
          _count: {
            id: true
          }
        });

        return {
          category: categoryKey,
          name: categoryInfo.name,
          timeRange: {
            days,
            startDate: startDate.toISOString(),
            endDate: new Date().toISOString()
          },
          posts: {
            recent: postsCount,
            total: totalPosts,
            recentPosts: includeDetails ? recentPosts : undefined
          },
          stats: {
            totalViews: stats._sum.viewCount || 0,
            totalLikes: stats._sum.likeCount || 0,
            totalShares: stats._sum.shareCount || 0,
            totalComments: stats._sum.commentCount || 0,
            averagePriority: stats._avg.priorityScore || 0,
            totalPriorityScore: stats._sum.priorityScore || 0
          },
          statusDistribution: statusDistribution.reduce((acc, item) => {
            acc[item.status] = item._count.id;
            return acc;
          }, {} as Record<string, number>),
          engagement: {
            averageViewsPerPost: postsCount > 0 ? (stats._sum.viewCount || 0) / postsCount : 0,
            averageLikesPerPost: postsCount > 0 ? (stats._sum.likeCount || 0) / postsCount : 0,
            averageSharesPerPost: postsCount > 0 ? (stats._sum.shareCount || 0) / postsCount : 0,
            averageCommentsPerPost: postsCount > 0 ? (stats._sum.commentCount || 0) / postsCount : 0,
            engagementRate: postsCount > 0 ? 
              ((stats._sum.likeCount || 0) + (stats._sum.shareCount || 0) + (stats._sum.commentCount || 0)) / postsCount : 0
          }
        };
      })
    );

    // Calculate totals
    const totals = categoryStats.reduce((acc, cat) => {
      acc.totalPosts += cat.posts.total;
      acc.recentPosts += cat.posts.recent;
      acc.totalViews += cat.stats.totalViews;
      acc.totalLikes += cat.stats.totalLikes;
      acc.totalShares += cat.stats.totalShares;
      acc.totalComments += cat.stats.totalComments;
      return acc;
    }, {
      totalPosts: 0,
      recentPosts: 0,
      totalViews: 0,
      totalLikes: 0,
      totalShares: 0,
      totalComments: 0
    });

    // Sort categories by engagement or posts count
    const sortedCategories = categoryStats.sort((a, b) => {
      const aEngagement = a.engagement.engagementRate;
      const bEngagement = b.engagement.engagementRate;
      if (aEngagement !== bEngagement) {
        return bEngagement - aEngagement;
      }
      return b.posts.total - a.posts.total;
    });

    // Get top performing categories
    const topCategories = sortedCategories.slice(0, 5);

    // Get growth trends (simplified)
    const growthTrends = await Promise.all(
      topCategories.map(async (cat) => {
        const previousPeriodStart = new Date(startDate);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - days);
        
        // Find the database category for this category
        const dbCat = dbCategories.find(dc => dc.categoryKey === cat.category);
        if (!dbCat) return null;

        const previousPeriodStats = await prisma.post.aggregate({
          where: { 
            categoryId: dbCat.dbCategory.id,
            createdAt: { 
              gte: previousPeriodStart,
              lt: startDate
            }
          },
          _sum: {
            viewCount: true,
            likeCount: true
          }
        });

        const currentViews = cat.stats.totalViews;
        const previousViews = previousPeriodStats._sum.viewCount || 0;
        const viewsGrowth = previousViews > 0 ? 
          ((currentViews - previousViews) / previousViews) * 100 : 0;

        return {
          category: cat.category,
          name: cat.name,
          viewsGrowth: Math.round(viewsGrowth * 100) / 100,
          postsGrowth: cat.posts.recent // Simplified
        };
      })
    );

    // Filter out null values from growth trends
    const validGrowthTrends = (await Promise.all(growthTrends)).filter(trend => trend !== null);

    console.log('📊 Admin API - Category analytics calculated');
    
    return NextResponse.json({
      success: true,
      data: {
        timeRange: {
          days,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        },
        totals,
        categories: sortedCategories,
        topCategories,
        growthTrends: validGrowthTrends,
        summary: {
          totalCategories: categoryKeys.length,
          activeCategories: categoryStats.filter(cat => cat.posts.total > 0).length,
          mostActiveCategory: sortedCategories[0]?.name || 'None',
          averagePostsPerCategory: Math.round(totals.totalPosts / categoryKeys.length),
          totalEngagement: totals.totalLikes + totals.totalShares + totals.totalComments
        }
      }
    });

  } catch (error) {
    console.error('📊 Admin API - Analytics error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tải analytics' },
      { status: 500 }
    );
  }
}