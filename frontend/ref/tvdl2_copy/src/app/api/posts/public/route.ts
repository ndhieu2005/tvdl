import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/posts/public - Get published posts for public view (no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const category = searchParams.get('category');
    const statusParam = searchParams.get('status');
    const search = searchParams.get('search');

    console.log('🔍 GET /api/posts/public - Params:', {
      page,
      limit,
      category,
      statusParam,
      search
    });

    // Build where clause - include scheduled posts that should be published
    const now = new Date();
    let whereClause: any = {
      OR: [
        { status: 'PUBLISHED' },
        { 
          status: 'SCHEDULED',
          publishDate: { lte: now }
        }
      ]
    };
    
    // Override if specific status is requested
    if (statusParam && statusParam !== 'published') {
      // Convert string status to enum
      const statusMap: { [key: string]: string } = {
        'draft': 'DRAFT',
        'published': 'PUBLISHED',
        'scheduled': 'SCHEDULED'
      };
      
      const enumStatus = statusMap[statusParam.toLowerCase()] || 'PUBLISHED';
      whereClause = {
        status: enumStatus
      };
    }

    // Filter by category if provided
    if (category) {
      whereClause.category = {
        name: {
          equals: category,
          mode: 'insensitive'
        }
      };
    }

    // Search functionality
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }

    console.log('🔍 GET /api/posts/public - Where clause:', JSON.stringify(whereClause, null, 2));

    // Get total count for pagination
    const totalPosts = await prisma.post.count({
      where: whereClause
    });

    // Get sessionId from headers or query params for personalized ordering
    const sessionId = searchParams.get('sessionId') || request.headers.get('x-session-id');
    const userId = searchParams.get('userId');
    const usesPriority = searchParams.get('priority') === 'true';

    // Get user's reading history if sessionId provided
    let sessionReadingHistory: any[] = [];
    if (sessionId && usesPriority) {
      sessionReadingHistory = await prisma.readingHistory.findMany({
        where: {
          sessionId,
          userId: userId || undefined
        },
        select: {
          postId: true,
          timeSpent: true,
          scrollDepth: true,
          isCompleted: true
        }
      });
    }

    // Determine ordering strategy
    let orderBy: any[] = [];
    if (usesPriority) {
      // Priority-based ordering
      orderBy = [
        { priorityScore: 'desc' },
        { viewCount: 'desc' },
        { publishDate: 'desc' },
        { createdAt: 'desc' }
      ];
    } else {
      // Default chronological ordering
      orderBy = [
        { publishDate: 'desc' },
        { createdAt: 'desc' }
      ];
    }

    // Get posts with pagination
    const posts = await prisma.post.findMany({
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
                color: true
              }
            }
          }
        }
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    });

    console.log('🔍 GET /api/posts/public - Found posts:', posts.length);
    console.log('🔍 GET /api/posts/public - Total posts:', totalPosts);
    console.log('🔍 GET /api/posts/public - Using priority:', usesPriority);

    // If using priority, recalculate fresh priority scores for current session
    let finalPosts = posts;
    if (usesPriority && sessionId) {
      // Calculate fresh priority scores
      const postsWithFreshPriority = posts.map(post => {
        const readingRecord = sessionReadingHistory.find(h => h.postId === post.id);
        let priorityScore = post.priorityScore;
        
        // Apply reading history penalty
        if (readingRecord) {
          if (readingRecord.isCompleted) {
            priorityScore *= 0.1; // Dramatically reduce priority for completed posts
          } else if (readingRecord.scrollDepth > 0.5) {
            priorityScore *= 0.5; // Reduce priority for partially read posts
          } else if (readingRecord.timeSpent > 30) {
            priorityScore *= 0.7; // Slight penalty for posts user started but didn't engage much
          }
        }
        
        return {
          ...post,
          priorityScore,
          hasReadingHistory: !!readingRecord
        };
      });
      
      // Sort by fresh priority scores
      finalPosts = postsWithFreshPriority.sort((a, b) => b.priorityScore - a.priorityScore);
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalPosts / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Format posts for frontend (add backward compatibility)
    const formattedPosts = finalPosts.map(post => ({
      ...post,
      category: post.category || null, // Keep original category object or null
      tags: [
        ...(post.tags ?? []), // old format tags, ensure array
        ...post.postTags.map(pt => pt.tag.name) // new format tags
      ].filter((tag, index, arr) => arr.indexOf(tag) === index), // remove duplicates
      publishedAt: post.publishDate || post.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedPosts,
      pagination: {
        page,
        limit,
        total: totalPosts,
        totalPages,
        hasNext,
        hasPrev
      },
      meta: {
        usesPriority,
        sessionId,
        userId,
        hasReadingHistory: sessionReadingHistory.length > 0
      }
    });
  } catch (error) {
    console.error('🔍 GET /api/posts/public - Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch posts',
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}