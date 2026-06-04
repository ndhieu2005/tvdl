import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Utility function to calculate base priority score (without reading history)
function calculateBasePriorityScore(post: any): number {
  let score = 0;
  
  // Base score from view count (logarithmic scale)
  const viewScore = Math.log(post.viewCount + 1) * 10;
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
  
  // Category boost
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
  
  // Calculate and add reading time to post
  const wordsPerMinute = 200;
  const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  
  return Math.max(0, score);
}

// POST /api/posts/initialize-priority - Initialize priority scores for all posts
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/posts/initialize-priority - Starting initialization...');

    // Get all posts
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        publishDate: true,
        viewCount: true,
        likeCount: true,
        shareCount: true,
        commentCount: true,
        category: true,
        createdAt: true
      }
    });

    console.log(`🚀 Found ${posts.length} posts to initialize`);

    // Calculate priority scores and reading times
    const updates = posts.map(post => {
      const priorityScore = calculateBasePriorityScore(post);
      const wordsPerMinute = 200;
      const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
      
      return {
        id: post.id,
        priorityScore,
        readingTime,
        title: post.title
      };
    });

    // Update all posts with priority scores and reading times
    const updatePromises = updates.map(update => 
      prisma.post.update({
        where: { id: update.id },
        data: { 
          priorityScore: update.priorityScore,
          readingTime: update.readingTime
        }
      })
    );

    await Promise.all(updatePromises);

    console.log(`🚀 Updated ${updates.length} posts with priority scores and reading times`);

    // Calculate some statistics
    const avgScore = updates.reduce((sum, u) => sum + u.priorityScore, 0) / updates.length;
    const maxScore = Math.max(...updates.map(u => u.priorityScore));
    const minScore = Math.min(...updates.map(u => u.priorityScore));
    const avgReadingTime = updates.reduce((sum, u) => sum + u.readingTime, 0) / updates.length;

    return NextResponse.json({
      success: true,
      data: {
        totalPosts: updates.length,
        statistics: {
          avgPriorityScore: avgScore,
          maxPriorityScore: maxScore,
          minPriorityScore: minScore,
          avgReadingTime: avgReadingTime
        },
        topPosts: updates
          .sort((a, b) => b.priorityScore - a.priorityScore)
          .slice(0, 10)
          .map(u => ({
            title: u.title,
            priorityScore: u.priorityScore,
            readingTime: u.readingTime
          }))
      }
    });

  } catch (error) {
    console.error('🚀 POST /api/posts/initialize-priority - Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize priority scores',
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/posts/initialize-priority - Get current priority statistics
export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        priorityScore: true,
        readingTime: true,
        viewCount: true,
        likeCount: true,
        category: true,
        publishDate: true
      },
      orderBy: {
        priorityScore: 'desc'
      },
      take: 20
    });

    const totalPosts = await prisma.post.count();
    const avgScore = posts.reduce((sum, p) => sum + p.priorityScore, 0) / posts.length;
    const totalReadingHistory = await prisma.readingHistory.count();
    const uniqueSessions = await prisma.readingHistory.groupBy({
      by: ['sessionId'],
      _count: {
        sessionId: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalPosts,
        totalReadingHistory,
        uniqueSessions: uniqueSessions.length,
        avgPriorityScore: avgScore,
        topPosts: posts.map(p => ({
          title: p.title,
          priorityScore: p.priorityScore,
          readingTime: p.readingTime,
          viewCount: p.viewCount,
          likeCount: p.likeCount,
          category: p.category
        }))
      }
    });

  } catch (error) {
    console.error('🚀 GET /api/posts/initialize-priority - Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get priority statistics',
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}