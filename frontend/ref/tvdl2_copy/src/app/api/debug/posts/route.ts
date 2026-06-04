import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all posts without authentication
    const posts = await prisma.post.findMany({
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
      orderBy: { createdAt: 'desc' }
    });

    console.log('🔍 Debug Posts - Found posts:', posts.length);
    
    return NextResponse.json({
      success: true,
      data: posts,
      count: posts.length
    });
  } catch (error) {
    console.error('🔍 Debug Posts - Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}