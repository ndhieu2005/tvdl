import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth } from '@/lib/middleware/api-auth';
import { PrismaClient } from '@prisma/client';

// Force Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient();

// GET: Lấy bài viết theo ID
export const GET = withApiKeyAuth('posts', 'read', async (req, { params }) => {
  try {
    const postId = params.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Get Post Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// PUT: Cập nhật bài viết
export const PUT = withApiKeyAuth('posts', 'update', async (req, { params }) => {
  try {
    const postId = params.id;
    const body = await req.json();

    // Kiểm tra bài viết có tồn tại không
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const {
      title,
      content,
      excerpt,
      featuredImage,
      category,
      status,
      tags,
      publishDate,
      seoTitle,
      seoDescription,
      seoKeywords,
      videoUrl,
      videoThumbnail,
      videoPlatform,
      videoTitle,
      videoDescription,
      videoMetadata,
    } = body;

    const updateData: any = {};

    if (title !== undefined) {
      updateData.title = title;
      
      // Update slug if title changed
      if (title !== existingPost.title) {
        const newSlug = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');

        // Check if new slug already exists
        const slugExists = await prisma.post.findFirst({
          where: { 
            slug: newSlug,
            id: { not: postId },
          },
        });

        if (slugExists) {
          return NextResponse.json({
            error: 'A post with this title already exists',
          }, { status: 400 });
        }

        updateData.slug = newSlug;
      }
    }

    if (content !== undefined) {
      updateData.content = content;
      
      // Recalculate reading time
      const wordCount = content.split(/\s+/).length;
      updateData.readingTime = Math.ceil(wordCount / 200);
    }

    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags.join(',') : (tags || '');
    }
    if (publishDate !== undefined) updateData.publishDate = publishDate ? new Date(publishDate) : null;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (videoThumbnail !== undefined) updateData.videoThumbnail = videoThumbnail;
    if (videoPlatform !== undefined) updateData.videoPlatform = videoPlatform;
    if (videoTitle !== undefined) updateData.videoTitle = videoTitle;
    if (videoDescription !== undefined) updateData.videoDescription = videoDescription;
    if (videoMetadata !== undefined) updateData.videoMetadata = videoMetadata;

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Post updated successfully',
      post: updatedPost,
    });
  } catch (error) {
    console.error('Update Post Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// DELETE: Xóa bài viết
export const DELETE = withApiKeyAuth('posts', 'delete', async (req, { params }) => {
  try {
    const postId = params.id;

    // Kiểm tra bài viết có tồn tại không
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete Post Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});