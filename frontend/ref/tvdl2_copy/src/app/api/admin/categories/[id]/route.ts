import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🏷️ Admin API - Getting category:', id);

    // Get category from database
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        },
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category không tồn tại' },
        { status: 404 }
      );
    }

    // Get category stats
    const stats = await prisma.post.aggregate({
      where: { categoryId: id },
      _sum: {
        viewCount: true,
        likeCount: true,
        shareCount: true,
        commentCount: true
      }
    });

    const categoryWithStats = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      status: category.status.toLowerCase(),
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      featured: category.featured,
      sortOrder: category.sortOrder,
      postsCount: category._count.posts,
      recentPosts: category.posts,
      stats: {
        totalViews: stats._sum.viewCount || 0,
        totalLikes: stats._sum.likeCount || 0,
        totalShares: stats._sum.shareCount || 0,
        totalComments: stats._sum.commentCount || 0
      },
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    };

    console.log('🏷️ Admin API - Category found:', category.name);
    
    return NextResponse.json({
      success: true,
      data: categoryWithStats
    });

  } catch (error) {
    console.error('🏷️ Admin API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy thông tin category' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *               featured:
 *                 type: boolean
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *       409:
 *         description: Slug already exists
 *       500:
 *         description: Internal server error
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    console.log('🏷️ Admin API - Updating category:', id, body);

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category không tồn tại' },
        { status: 404 }
      );
    }

    // Check slug uniqueness if slug is being updated
    if (body.slug && body.slug !== existingCategory.slug) {
      const existingSlug = await prisma.category.findUnique({
        where: { slug: body.slug }
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Slug đã tồn tại' },
          { status: 409 }
        );
      }
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: body.name || existingCategory.name,
        slug: body.slug || existingCategory.slug,
        description: body.description !== undefined ? body.description : existingCategory.description,
        color: body.color || existingCategory.color,
        status: body.status ? body.status.toUpperCase() : existingCategory.status,
        metaTitle: body.metaTitle !== undefined ? body.metaTitle : existingCategory.metaTitle,
        metaDescription: body.metaDescription !== undefined ? body.metaDescription : existingCategory.metaDescription,
        featured: body.featured !== undefined ? body.featured : existingCategory.featured,
        sortOrder: body.sortOrder !== undefined ? body.sortOrder : existingCategory.sortOrder
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedCategory.id,
        name: updatedCategory.name,
        slug: updatedCategory.slug,
        description: updatedCategory.description,
        color: updatedCategory.color,
        status: updatedCategory.status.toLowerCase(),
        metaTitle: updatedCategory.metaTitle,
        metaDescription: updatedCategory.metaDescription,
        featured: updatedCategory.featured,
        sortOrder: updatedCategory.sortOrder,
        createdAt: updatedCategory.createdAt.toISOString(),
        updatedAt: updatedCategory.updatedAt.toISOString()
      },
      message: 'Category đã được cập nhật thành công!'
    });

  } catch (error) {
    console.error('🏷️ Admin API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật category' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       409:
 *         description: Cannot delete category with posts
 *       500:
 *         description: Internal server error
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🏷️ Admin API - Deleting category:', id);

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category không tồn tại' },
        { status: 404 }
      );
    }

    // Check if there are posts using this category
    if (category._count.posts > 0) {
      return NextResponse.json({
        error: `Không thể xóa category này vì có ${category._count.posts} bài viết đang sử dụng.`
      }, { status: 409 });
    }

    // Delete category
    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Category đã được xóa thành công!'
    });

  } catch (error) {
    console.error('🏷️ Admin API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa category' },
      { status: 500 }
    );
  }
}