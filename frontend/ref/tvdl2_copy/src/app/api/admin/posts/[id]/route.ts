import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withEditorAuth } from '@/lib/middleware/auth';

/**
 * @swagger
 * /api/admin/posts/{id}:
 *   get:
 *     summary: Lấy thông tin bài viết theo ID
 *     description: Lấy thông tin chi tiết bài viết với tags và category
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Thông tin bài viết được trả về thành công
 *       404:
 *         description: Bài viết không tồn tại
 *       500:
 *         description: Lỗi server
 */
export const GET = withEditorAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    console.log('🔥 GET /api/admin/posts/[id] - Starting request for ID:', params.id);
    
    const user = (request as any).user;
    console.log('🔥 GET /api/admin/posts/[id] - User from request:', user);

    // Build query based on user role
    let whereClause: any = { id: params.id };
    
    if (user.role === 'EDITOR') {
      // Editor can only see their own posts
      whereClause.authorId = user.userId;
    } else if (user.role === 'ADMIN') {
      // Admin can see all posts from editors and other admins
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
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
                featured: true
              }
            }
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Bài viết không tồn tại hoặc bạn không có quyền truy cập' },
        { status: 404 }
      );
    }

    // Format post to include tags properly
    const { tags: originalTags, postTags, ...postWithoutTags } = post;
    const formattedPost = {
      ...postWithoutTags,
      tags: post.postTags?.map(pt => pt.tag) || [],
    };

    console.log('🔥 GET /api/admin/posts/[id] - Found post:', post.id);

    return NextResponse.json({
      success: true,
      data: formattedPost
    });

  } catch (error) {
    console.error('🔥 GET /api/admin/posts/[id] - Error fetching post:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy thông tin bài viết' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/admin/posts/{id}:
 *   put:
 *     summary: Cập nhật bài viết
 *     description: Cập nhật thông tin bài viết với tags và category
 *     tags: [Admin]
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
 *               title:
 *                 type: string
 *                 description: Tiêu đề bài viết
 *               slug:
 *                 type: string
 *                 description: URL slug
 *               content:
 *                 type: string
 *                 description: Nội dung bài viết
 *               excerpt:
 *                 type: string
 *                 description: Tóm tắt bài viết
 *               featuredImage:
 *                 type: string
 *                 description: URL hình ảnh đại diện
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, SCHEDULED]
 *                 description: Trạng thái bài viết
 *               categoryId:
 *                 type: string
 *                 description: ID danh mục
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Mảng ID các tags
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Thời gian xuất bản (cho SCHEDULED)
 *               seo:
 *                 type: object
 *                 properties:
 *                   metaTitle:
 *                     type: string
 *                   metaDescription:
 *                     type: string
 *                   keywords:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Bài viết được cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Bài viết không tồn tại
 *       500:
 *         description: Lỗi server
 */
export const PUT = withEditorAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    console.log('🔥 PUT /api/admin/posts/[id] - Starting request for ID:', params.id);
    
    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      status,
      categoryId,
      tagIds,
      publishedAt,
      seo = {}
    } = body;

    const user = (request as any).user;
    console.log('🔥 PUT /api/admin/posts/[id] - User from request:', user);

    // Build query based on user role
    let whereClause: any = { id: params.id };
    
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
        { success: false, error: 'Bài viết không tồn tại hoặc bạn không có quyền cập nhật' },
        { status: 404 }
      );
    }

    // Validate category if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return NextResponse.json(
          { success: false, error: 'Danh mục không tồn tại' },
          { status: 400 }
        );
      }
    }

    // Validate tags if provided
    if (tagIds && tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: { id: { in: tagIds } }
      });

      if (tags.length !== tagIds.length) {
        const foundIds = tags.map(tag => tag.id);
        const missingIds = tagIds.filter((id: string) => !foundIds.includes(id));
        return NextResponse.json(
          { success: false, error: `Tags không tồn tại: ${missingIds.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Check slug uniqueness if provided
    if (slug && slug !== existingPost.slug) {
      const existingSlugPost = await prisma.post.findFirst({
        where: { 
          slug,
          id: { not: params.id }
        }
      });

      if (existingSlugPost) {
        return NextResponse.json(
          { success: false, error: 'Slug đã tồn tại' },
          { status: 400 }
        );
      }
    }

    // Update post in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = {};
      
      if (title !== undefined) updateData.title = title;
      if (slug !== undefined) updateData.slug = slug;
      if (content !== undefined) updateData.content = content;
      if (excerpt !== undefined) updateData.excerpt = excerpt;
      if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
      if (status !== undefined) updateData.status = status.toUpperCase();
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (publishedAt !== undefined) updateData.publishDate = publishedAt ? new Date(publishedAt) : null;
      if (seo.metaTitle !== undefined) updateData.seoTitle = seo.metaTitle;
      if (seo.metaDescription !== undefined) updateData.seoDescription = seo.metaDescription;
      if (seo.keywords !== undefined) updateData.seoKeywords = seo.keywords || [];

      // Update post
      const post = await tx.post.update({
        where: { id: params.id },
        data: updateData
      });

      // Update tags if provided
      if (tagIds !== undefined) {
        // Delete existing tag relations
        await tx.postTag.deleteMany({
          where: { postId: params.id }
        });

        // Create new tag relations
        if (tagIds.length > 0) {
          await tx.postTag.createMany({
            data: tagIds.map((tagId: string) => ({
              postId: params.id,
              tagId
            }))
          });
        }
      }

      return post;
    });

    console.log('🔥 PUT /api/admin/posts/[id] - Updated post:', result.id);

    // Fetch complete updated post with relations
    const completePost = await prisma.post.findUnique({
      where: { id: params.id },
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
            slug: true,
            color: true
          }
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
                featured: true
              }
            }
          }
        }
      }
    });

    // Format response
    const { tags: originalTags, postTags: completePostTags, ...postWithoutTags } = completePost!;
    const formattedPost = {
      ...postWithoutTags,
      tags: completePost?.postTags?.map(pt => pt.tag) || [],
    };

    return NextResponse.json({
      success: true,
      data: formattedPost,
      message: 'Cập nhật bài viết thành công'
    });

  } catch (error) {
    console.error('🔥 PUT /api/admin/posts/[id] - Error updating post:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật bài viết' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/admin/posts/{id}:
 *   delete:
 *     summary: Xóa bài viết
 *     description: Xóa bài viết và tất cả các quan hệ liên quan
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Bài viết được xóa thành công
 *       404:
 *         description: Bài viết không tồn tại
 *       500:
 *         description: Lỗi server
 */
export const DELETE = withEditorAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    console.log('🔥 DELETE /api/admin/posts/[id] - Starting request for ID:', params.id);
    
    const user = (request as any).user;
    console.log('🔥 DELETE /api/admin/posts/[id] - User from request:', user);

    // Build query based on user role
    let whereClause: any = { id: params.id };
    
    if (user.role === 'EDITOR') {
      // Editor can only delete their own posts
      whereClause.authorId = user.userId;
    } else if (user.role === 'ADMIN') {
      // Admin can delete all posts from editors and other admins
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
        { success: false, error: 'Bài viết không tồn tại hoặc bạn không có quyền xóa' },
        { status: 404 }
      );
    }

    // Delete post in transaction (cascade delete will handle postTags)
    await prisma.$transaction(async (tx) => {
      // Delete tag relations first
      await tx.postTag.deleteMany({
        where: { postId: params.id }
      });

      // Delete post
      await tx.post.delete({
        where: { id: params.id }
      });
    });

    console.log('🔥 DELETE /api/admin/posts/[id] - Deleted post:', params.id);

    return NextResponse.json({
      success: true,
      message: 'Xóa bài viết thành công'
    });

  } catch (error) {
    console.error('🔥 DELETE /api/admin/posts/[id] - Error deleting post:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa bài viết' },
      { status: 500 }
    );
  }
});