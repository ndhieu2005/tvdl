import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/posts/reading-progress - Track reading progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, sessionId, userId, timeSpent, scrollDepth, isCompleted } = body;

    console.log('📖 POST /api/posts/reading-progress - Data:', {
      postId,
      sessionId,
      userId,
      timeSpent,
      scrollDepth,
      isCompleted
    });

    // Validate required fields
    if (!postId || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: postId, sessionId' },
        { status: 400 }
      );
    }

    // Get user agent and referrer from headers
    const userAgent = request.headers.get('user-agent');
    const referrer = request.headers.get('referer');

    // Update or create reading history
    const readingHistory = await prisma.readingHistory.upsert({
      where: {
        postId_sessionId: {
          postId,
          sessionId
        }
      },
      update: {
        timeSpent,
        scrollDepth,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        userId: userId || undefined,
        userAgent,
        referrer
      },
      create: {
        postId,
        sessionId,
        userId: userId || undefined,
        timeSpent,
        scrollDepth,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        userAgent,
        referrer
      }
    });

    // Update post view count if this is a new view
    if (readingHistory.timeSpent === 0 && timeSpent > 0) {
      await prisma.post.update({
        where: { id: postId },
        data: {
          viewCount: { increment: 1 }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: readingHistory
    });

  } catch (error) {
    console.error('📖 POST /api/posts/reading-progress - Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track reading progress',
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/posts/reading-progress - Get reading progress for session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing sessionId parameter' },
        { status: 400 }
      );
    }

    // Get reading history for this session
    const readingHistory = await prisma.readingHistory.findMany({
      where: {
        sessionId,
        userId: userId || undefined
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            readingTime: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: readingHistory
    });

  } catch (error) {
    console.error('📖 GET /api/posts/reading-progress - Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get reading progress',
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}