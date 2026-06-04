import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API for previewing posts - allows viewing unpublished posts
 * This endpoint bypasses the publish status check for preview purposes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('🔍 GET /api/posts/preview/[slug] - Preview Slug:', slug);

    // Find post by slug with author and category information - NO STATUS CHECK
    const post = await prisma.post.findUnique({
      where: { slug },
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
            slug: true
          }
        }
      }
    });

    if (!post) {
      console.log('🔍 GET /api/posts/preview/[slug] - Post not found');
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // For preview, we show the post regardless of status
    console.log('🔍 GET /api/posts/preview/[slug] - Post found for preview:', post.title, 'Status:', post.status);

    // Don't increment view count for preview
    return NextResponse.json({
      success: true,
      data: post,
      isPreview: true
    });
  } catch (error) {
    console.error('🔍 GET /api/posts/preview/[slug] - Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post for preview' },
      { status: 500 }
    );
  }
}