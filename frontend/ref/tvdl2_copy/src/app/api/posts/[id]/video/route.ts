import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { withEditorAuth } from '@/lib/middleware/auth';
import { extractVideoInfo } from '@/lib/video-extractor';

/**
 * @swagger
 * /api/posts/{id}/video:
 *   patch:
 *     summary: Cập nhật thông tin video cho bài viết
 *     description: Cập nhật thông tin video cho bài viết từ URL video
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoUrl:
 *                 type: string
 *                 description: URL của video
 *               autoExtract:
 *                 type: boolean
 *                 default: true
 *                 description: Tự động trích xuất thông tin video
 *               videoTitle:
 *                 type: string
 *                 description: Tiêu đề video (tùy chọn)
 *               videoDescription:
 *                 type: string
 *                 description: Mô tả video (tùy chọn)
 *               videoThumbnail:
 *                 type: string
 *                 description: URL thumbnail video (tùy chọn)
 *               videoPlatform:
 *                 type: string
 *                 description: Nền tảng video (tùy chọn)
 *               videoMetadata:
 *                 type: object
 *                 description: Metadata bổ sung (tùy chọn)
 *     responses:
 *       200:
 *         description: Thông tin video được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Post'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */
export const PATCH = withEditorAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const user = (request as any).user;
    const body = await request.json();

    console.log('🎥 PATCH /api/posts/[id]/video - Post ID:', id);
    console.log('🎥 PATCH /api/posts/[id]/video - User:', user);
    console.log('🎥 PATCH /api/posts/[id]/video - Body:', body);

    // Validate required fields
    if (!body.videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Build query based on user role
    let whereClause: any = { id };
    
    if (user.role === 'EDITOR') {
      // Editor can only update their own posts
      whereClause.authorId = user.userId;
    } else if (user.role === 'ADMIN') {
      // Admin can update all posts from editors and other admins
      whereClause.author = {
        role: {
          in: ['ADMIN', 'EDITOR']
        }
      };
    }

    // Check if post exists and user has permission
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
        { success: false, error: 'Post not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    // Prepare video update data
    let videoUpdateData: any = {
      videoUrl: body.videoUrl
    };

    // Auto-extract video info if enabled (default: true)
    const autoExtract = body.autoExtract !== false;
    
    if (autoExtract) {
      console.log('🎥 Auto-extracting video info from URL:', body.videoUrl);
      
      try {
        const extractResult = await extractVideoInfo(body.videoUrl);
        
        if (extractResult.success && extractResult.data) {
          console.log('🎥 Extracted video info:', extractResult.data);
          
          videoUpdateData.videoTitle = extractResult.data.title;
          videoUpdateData.videoDescription = extractResult.data.description;
          videoUpdateData.videoThumbnail = extractResult.data.thumbnailUrl;
          videoUpdateData.videoPlatform = extractResult.data.platform;
          videoUpdateData.videoMetadata = {
            author: extractResult.data.author,
            views: extractResult.data.views,
            duration: extractResult.data.duration,
            extractedAt: new Date().toISOString()
          };
        } else {
          console.warn('🎥 Failed to extract video info:', extractResult.error);
          // Continue with manual data if extraction fails
        }
      } catch (error) {
        console.error('🎥 Error during video extraction:', error);
        // Continue with manual data if extraction fails
      }
    }

    // Override with manually provided data
    if (body.videoTitle !== undefined) {
      videoUpdateData.videoTitle = body.videoTitle;
    }
    if (body.videoDescription !== undefined) {
      videoUpdateData.videoDescription = body.videoDescription;
    }
    if (body.videoThumbnail !== undefined) {
      videoUpdateData.videoThumbnail = body.videoThumbnail;
    }
    if (body.videoPlatform !== undefined) {
      videoUpdateData.videoPlatform = body.videoPlatform;
    }
    if (body.videoMetadata !== undefined) {
      videoUpdateData.videoMetadata = body.videoMetadata;
    }

    // Update post with video info
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...videoUpdateData,
        updatedAt: new Date()
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

    console.log('🎥 PATCH /api/posts/[id]/video - Video info updated for post:', updatedPost.title);

    return NextResponse.json({
      success: true,
      data: updatedPost,
      message: 'Video information updated successfully'
    });
  } catch (error) {
    console.error('🎥 PATCH /api/posts/[id]/video - Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update video information' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/posts/{id}/video:
 *   delete:
 *     summary: Xóa thông tin video khỏi bài viết
 *     description: Xóa tất cả thông tin video liên quan đến bài viết
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Thông tin video được xóa thành công
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
 *       500:
 *         description: Lỗi server
 */
export const DELETE = withEditorAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const user = (request as any).user;

    console.log('🎥 DELETE /api/posts/[id]/video - Post ID:', id);
    console.log('🎥 DELETE /api/posts/[id]/video - User:', user);

    // Build query based on user role
    let whereClause: any = { id };
    
    if (user.role === 'EDITOR') {
      // Editor can only update their own posts
      whereClause.authorId = user.userId;
    } else if (user.role === 'ADMIN') {
      // Admin can update all posts from editors and other admins
      whereClause.author = {
        role: {
          in: ['ADMIN', 'EDITOR']
        }
      };
    }

    // Check if post exists and user has permission
    const existingPost = await prisma.post.findFirst({
      where: whereClause
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    // Clear all video fields
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        videoUrl: null,
        videoThumbnail: null,
        videoPlatform: null,
        videoTitle: null,
        videoDescription: null,
        videoMetadata: Prisma.JsonNull,
        updatedAt: new Date()
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

    console.log('🎥 DELETE /api/posts/[id]/video - Video info cleared for post:', updatedPost.title);

    return NextResponse.json({
      success: true,
      data: updatedPost,
      message: 'Video information cleared successfully'
    });
  } catch (error) {
    console.error('🎥 DELETE /api/posts/[id]/video - Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear video information' },
      { status: 500 }
    );
  }
});