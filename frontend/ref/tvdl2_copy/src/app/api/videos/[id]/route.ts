import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withEditorAuth } from '@/lib/middleware/auth';
import { PostStatus, PostCategory } from '@/types/api';

// Video-specific platform mapping
const VIDEO_PLATFORMS = ['tiktok', 'youtube', 'upload', 'other'] as const;
type VideoPlatform = typeof VIDEO_PLATFORMS[number];

// Interface for video update
interface VideoUpdateInput {
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  platform?: VideoPlatform;
  category?: string;
  tags?: string[];
  status?: 'active' | 'inactive';
  metaTitle?: string;
  metaDescription?: string;
}

// Helper functions
function mapVideoStatusToPostStatus(status: 'active' | 'inactive'): PostStatus {
  return status === 'active' ? 'PUBLISHED' : 'DRAFT';
}

function mapCategoryToPostCategory(category: string): PostCategory {
  const categoryMap: Record<string, PostCategory> = {
    'Dance': 'TRENDING_NOW',
    'Comedy': 'TRENDING_NOW', 
    'Food': 'TRENDING_NOW',
    'Beauty': 'TRENDING_NOW',
    'Fashion': 'TRENDING_NOW',
    'Travel': 'TRENDING_NOW',
    'Educational': 'TRENDING_NOW',
    'Sports': 'TRENDING_NOW',
    'Music': 'SOUNDS',
    'Trends': 'TRENDING_NOW',
    'Challenge': 'CHALLENGES',
    'Other': 'TRENDING_NOW'
  };
  
  return categoryMap[category] || 'TRENDING_NOW';
}

function postToVideo(post: any) {
  // Extract platform from content
  let platform: VideoPlatform = 'other';
  if (post.content.includes('tiktok.com')) platform = 'tiktok';
  else if (post.content.includes('youtube.com')) platform = 'youtube';
  else if (post.content.includes('upload://')) platform = 'upload';

  // Extract video URL from content
  const videoUrl = post.content.match(/Video URL: (https?:\/\/[^\s\n]+)/)?.[1] || '';
  
  // Extract description (everything before "Video URL:")
  const description = post.content.split('\n\nVideo URL:')[0] || post.content;

  return {
    id: post.id,
    title: post.title,
    description,
    thumbnail: post.featuredImage || '',
    videoUrl,
    platform,
    status: post.status === 'PUBLISHED' ? 'active' : 'inactive',
    duration: 0,
    views: post.viewCount,
    likes: post.likeCount,
    shares: post.shareCount,
    tags: post.tags,
    category: post.category,
    uploadedAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    uploadedBy: post.author?.name || 'Unknown'
  };
}

/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     summary: Lấy thông tin video theo ID
 *     description: Lấy thông tin chi tiết của một video
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của video
 *     responses:
 *       200:
 *         description: Thông tin video được trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Video không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
export const GET = withEditorAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    console.log('🎬 GET /api/videos/[id] - Starting request for ID:', id);
    
    const user = (request as any).user;
    
    // Build query based on user role
    let whereClause: any = { id: id };
    
    if (user.role === 'EDITOR') {
      whereClause.authorId = user.userId;
    } else if (user.role === 'ADMIN') {
      whereClause.author = {
        role: {
          in: ['ADMIN', 'EDITOR']
        }
      };
    }

    const post = await prisma.post.findFirst({
      where: whereClause,
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
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    const video = postToVideo(post);

    return NextResponse.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('🎬 GET /api/videos/[id] - Error fetching video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     summary: Cập nhật video
 *     description: Cập nhật thông tin của một video
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề video
 *               description:
 *                 type: string
 *                 description: Mô tả video
 *               videoUrl:
 *                 type: string
 *                 description: URL của video
 *               thumbnailUrl:
 *                 type: string
 *                 description: URL thumbnail
 *               platform:
 *                 type: string
 *                 enum: [tiktok, youtube, upload, other]
 *                 description: Platform của video
 *               category:
 *                 type: string
 *                 description: Danh mục video
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags của video
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Trạng thái video
 *               metaTitle:
 *                 type: string
 *                 description: Tiêu đề SEO
 *               metaDescription:
 *                 type: string
 *                 description: Mô tả SEO
 *     responses:
 *       200:
 *         description: Video được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       404:
 *         description: Video không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
export const PUT = withEditorAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    console.log('🎬 PUT /api/videos/[id] - Starting request for ID:', id);
    
    const body: VideoUpdateInput = await request.json();
    console.log('🎬 PUT /api/videos/[id] - Request body:', body);
    
    const user = (request as any).user;
    
    // Build query based on user role
    let whereClause: any = { id: id };
    
    if (user.role === 'EDITOR') {
      whereClause.authorId = user.userId;
    } else if (user.role === 'ADMIN') {
      whereClause.author = {
        role: {
          in: ['ADMIN', 'EDITOR']
        }
      };
    }

    // Check if video exists
    const existingPost = await prisma.post.findFirst({
      where: whereClause,
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

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.thumbnailUrl !== undefined) updateData.featuredImage = body.thumbnailUrl;
    if (body.tags !== undefined) {
      updateData.tags = Array.isArray(body.tags) ? body.tags.join(',') : (body.tags || '');
    }
    if (body.metaTitle !== undefined) updateData.seoTitle = body.metaTitle;
    if (body.metaDescription !== undefined) updateData.seoDescription = body.metaDescription;
    
    if (body.status !== undefined) {
      updateData.status = mapVideoStatusToPostStatus(body.status);
      if (body.status === 'active' && existingPost.status !== 'PUBLISHED') {
        updateData.publishDate = new Date();
      }
    }
    
    if (body.category !== undefined) {
      updateData.category = mapCategoryToPostCategory(body.category);
    }
    
    // Handle content update if description or videoUrl changed
    if (body.description !== undefined || body.videoUrl !== undefined) {
      const currentDescription = existingPost.content.split('\n\nVideo URL:')[0];
      const currentVideoUrl = existingPost.content.match(/Video URL: (https?:\/\/[^\s\n]+)/)?.[1] || '';
      const currentPlatform = existingPost.content.match(/Platform: (\w+)/)?.[1] || 'other';
      
      const newDescription = body.description !== undefined ? body.description : currentDescription;
      const newVideoUrl = body.videoUrl !== undefined ? body.videoUrl : currentVideoUrl;
      const newPlatform = body.platform !== undefined ? body.platform : currentPlatform;
      
      updateData.content = `${newDescription}\n\nVideo URL: ${newVideoUrl}\nPlatform: ${newPlatform}`;
      updateData.excerpt = newDescription.substring(0, 200) + (newDescription.length > 200 ? '...' : '');
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: id },
      data: updateData,
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

    console.log('🎬 PUT /api/videos/[id] - Post updated:', updatedPost.id);

    const video = postToVideo(updatedPost);

    return NextResponse.json({
      success: true,
      data: video,
      message: 'Video updated successfully'
    });
  } catch (error) {
    console.error('🎬 PUT /api/videos/[id] - Error updating video:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to update video' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     summary: Xóa video
 *     description: Xóa một video khỏi hệ thống
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của video
 *     responses:
 *       200:
 *         description: Video được xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Video không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
export const DELETE = withEditorAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    console.log('🎬 DELETE /api/videos/[id] - Starting request for ID:', id);
    
    const user = (request as any).user;
    
    // Build query based on user role
    let whereClause: any = { id: id };
    
    if (user.role === 'EDITOR') {
      whereClause.authorId = user.userId;
    } else if (user.role === 'ADMIN') {
      whereClause.author = {
        role: {
          in: ['ADMIN', 'EDITOR']
        }
      };
    }

    // Check if video exists
    const existingPost = await prisma.post.findFirst({
      where: whereClause
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    // Delete the post
    await prisma.post.delete({
      where: { id: id }
    });

    console.log('🎬 DELETE /api/videos/[id] - Post deleted:', id);

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('🎬 DELETE /api/videos/[id] - Error deleting video:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete video' },
      { status: 500 }
    );
  }
});