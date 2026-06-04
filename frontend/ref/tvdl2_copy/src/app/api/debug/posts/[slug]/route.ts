import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Get post details
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
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('🔍 Debug Post - Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    
    // Update post status and video info
    const post = await prisma.post.update({
      where: { slug },
      data: {
        status: body.status || 'PUBLISHED',
        publishDate: body.publishDate ? new Date(body.publishDate) : new Date(),
        // Video fields - only update if provided
        ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
        ...(body.videoThumbnail !== undefined && { videoThumbnail: body.videoThumbnail }),
        ...(body.videoPlatform !== undefined && { videoPlatform: body.videoPlatform }),
        ...(body.videoTitle !== undefined && { videoTitle: body.videoTitle }),
        ...(body.videoDescription !== undefined && { videoDescription: body.videoDescription }),
        ...(body.videoMetadata !== undefined && { videoMetadata: body.videoMetadata })
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
      }
    });

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('🔍 Debug Post Update - Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}