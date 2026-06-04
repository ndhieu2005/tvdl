import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Utility function to calculate priority score
function calculatePriorityScore(post: any, sessionReadingHistory: any[] = []): number {
  let score = 0;
  
  // Base score from view count (normalized)
  const viewScore = Math.log(post.viewCount + 1) * 10; // Logarithmic scale
  score += viewScore;
  
  // Recent posts bonus (within last 7 days)
  const daysSincePublished = post.publishDate ? 
    (Date.now() - new Date(post.publishDate).getTime()) / (1000 * 60 * 60 * 24) : 999;
  
  if (daysSincePublished <= 7) {
    score += (7 - daysSincePublished) * 5; // Recency bonus
  }
  
  // Like and share engagement
  score += post.likeCount * 2;
  score += post.shareCount * 3;
  score += post.commentCount * 1.5;
  
  // Check if user has already read this post
  const readingRecord = sessionReadingHistory.find(h => h.postId === post.id);
  if (readingRecord) {
    // Penalize if user already completed reading this post
    if (readingRecord.isCompleted) {
      score *= 0.1; // Dramatically reduce priority for completed posts
    } else if (readingRecord.scrollDepth > 0.5) {
      score *= 0.5; // Reduce priority for partially read posts
    } else if (readingRecord.timeSpent > 30) {
      score *= 0.7; // Slight penalty for posts user started but didn't engage much
    }
  }
  
  // Category boost (some categories might be more important)
  const categoryBoost = {
    'TRENDING_NOW': 10,
    'CELEBRITIES': 8,
    'CHALLENGES': 6,
    'SOUNDS': 5,
    'TOP_LISTS': 4,
    'FILTERS': 3,
    'SOCIAL_MEDIA': 2,
    'GUIDELINES': 1
  };
  
  score += categoryBoost[post.category as keyof typeof categoryBoost] || 0;
  
  return Math.max(0, score);
}

// POST /api/posts/calculate-priority - Calculate and update priority scores
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId, limit = 50 } = body;

    console.log('🎯 POST /api/posts/calculate-priority - Params:', {
      sessionId,
      userId,
      limit
    });

    // Get user's reading history if sessionId provided
    let sessionReadingHistory: any[] = [];
    if (sessionId) {
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

    // Get published posts
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { status: 'PUBLISHED' },
          { 
            status: 'SCHEDULED',
            publishDate: { lte: new Date() }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    console.log(`🎯 Found ${posts.length} posts to calculate priority`);

    // Calculate priority scores
    const postsWithScores = posts.map(post => ({
      ...post,
      priorityScore: calculatePriorityScore(post, sessionReadingHistory)
    }));

    // Update priority scores in database
    const updatePromises = postsWithScores.map(post => 
      prisma.post.update({
        where: { id: post.id },
        data: { priorityScore: post.priorityScore }
      })
    );

    await Promise.all(updatePromises);

    console.log(`🎯 Updated priority scores for ${postsWithScores.length} posts`);

    return NextResponse.json({
      success: true,
      data: {
        updated: postsWithScores.length,
        scores: postsWithScores.map(p => ({
          id: p.id,
          title: p.title,
          priorityScore: p.priorityScore,
          viewCount: p.viewCount,
          hasReadingHistory: sessionReadingHistory.some(h => h.postId === p.id)
        }))
      }
    });

  } catch (error) {
    console.error('🎯 POST /api/posts/calculate-priority - Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate priority scores',
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/posts/calculate-priority - Get posts with calculated priority
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get user's reading history if sessionId provided
    let sessionReadingHistory: any[] = [];
    if (sessionId) {
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

    // Get published posts with priority scores
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { status: 'PUBLISHED' },
          { 
            status: 'SCHEDULED',
            publishDate: { lte: new Date() }
          }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        priorityScore: 'desc' // Order by priority score first
      },
      take: limit
    });

    // Recalculate priority scores for current session
    const postsWithFreshScores = posts.map(post => ({
      ...post,
      priorityScore: calculatePriorityScore(post, sessionReadingHistory),
      hasReadingHistory: sessionReadingHistory.some(h => h.postId === post.id)
    }));

    // Sort by fresh priority scores
    postsWithFreshScores.sort((a, b) => b.priorityScore - a.priorityScore);

    return NextResponse.json({
      success: true,
      data: postsWithFreshScores,
      meta: {
        sessionId,
        userId,
        totalPosts: postsWithFreshScores.length,
        hasReadingHistory: sessionReadingHistory.length > 0
      }
    });

  } catch (error) {
    console.error('🎯 GET /api/posts/calculate-priority - Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get priority posts',
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}