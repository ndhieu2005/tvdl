import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/posts/slug/{slug}:
 *   get:
 *     summary: Lấy bài viết theo slug
 *     description: Lấy thông tin chi tiết của một bài viết theo slug và tăng số lượt xem
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug của bài viết
 *         example: trending-tiktok-dance-challenge
 *     responses:
 *       200:
 *         description: Thông tin bài viết được trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Post'
 *       404:
 *         description: Không tìm thấy bài viết
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('🔍 GET /api/posts/slug/[slug] - Slug:', slug);

    // Find post by slug with author and category information
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
      console.log('🔍 GET /api/posts/slug/[slug] - Post not found');
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Only show published posts or scheduled posts that should be published
    const now = new Date();
    const shouldBePublished = post.status === 'PUBLISHED' || 
      (post.status === 'SCHEDULED' && post.publishDate && new Date(post.publishDate) <= now);
    
    if (!shouldBePublished) {
      console.log('🔍 GET /api/posts/slug/[slug] - Post not published or not yet scheduled');
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    });

    console.log('🔍 GET /api/posts/slug/[slug] - Post found:', post.title);

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('🔍 GET /api/posts/slug/[slug] - Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}