import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *       properties:
 *         id:
 *           type: string
 *           description: Category ID
 *         name:
 *           type: string
 *           description: Category name
 *         slug:
 *           type: string
 *           description: URL-friendly category slug
 *         description:
 *           type: string
 *           description: Category description
 *         color:
 *           type: string
 *           description: Category color (hex code)
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           description: Category status
 *         metaTitle:
 *           type: string
 *           description: SEO meta title
 *         metaDescription:
 *           type: string
 *           description: SEO meta description
 *         featured:
 *           type: boolean
 *           description: Whether category is featured
 *         sortOrder:
 *           type: integer
 *           description: Sort order for display
 *         postsCount:
 *           type: integer
 *           description: Number of posts in category
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Get all categories with statistics
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     active:
 *                       type: integer
 *                     inactive:
 *                       type: integer
 *                     totalPosts:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    console.log('🏷️ Admin API - Getting categories');

    // Get all categories from database with post counts
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    // Transform data to include postsCount
    const categoriesWithStats = categories.map(category => ({
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
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    }));

    console.log('🏷️ Admin API - Categories found:', categoriesWithStats.length);
    
    return NextResponse.json({
      success: true,
      data: categoriesWithStats,
      stats: {
        total: categoriesWithStats.length,
        active: categoriesWithStats.filter(cat => cat.status === 'active').length,
        inactive: categoriesWithStats.filter(cat => cat.status === 'inactive').length,
        totalPosts: categoriesWithStats.reduce((sum, cat) => sum + cat.postsCount, 0)
      }
    });

  } catch (error) {
    console.error('🏷️ Admin API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách categories' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               slug:
 *                 type: string
 *                 description: URL-friendly slug
 *               description:
 *                 type: string
 *                 description: Category description
 *               color:
 *                 type: string
 *                 description: Category color (hex code)
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *               metaTitle:
 *                 type: string
 *                 description: SEO meta title
 *               metaDescription:
 *                 type: string
 *                 description: SEO meta description
 *               featured:
 *                 type: boolean
 *                 default: false
 *               sortOrder:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       409:
 *         description: Slug already exists
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('🏷️ Admin API - Creating new category:', body);

    const { name, slug, description, color, status, metaTitle, metaDescription, featured, sortOrder } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Tên và slug là bắt buộc' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Slug đã tồn tại' },
        { status: 409 }
      );
    }

    // Get the highest sortOrder to place new category at the end
    const maxSortOrder = await prisma.category.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true }
    });

    // Create new category
    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || '',
        color: color || '#8B5CF6',
        status: status?.toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        metaTitle: metaTitle || name,
        metaDescription: metaDescription || description || '',
        featured: featured || false,
        sortOrder: sortOrder || ((maxSortOrder?.sortOrder || 0) + 1)
      }
    });

    console.log('🏷️ Admin API - Category created:', newCategory);
    
    return NextResponse.json({
      success: true,
      data: {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,
        color: newCategory.color,
        status: newCategory.status.toLowerCase(),
        metaTitle: newCategory.metaTitle,
        metaDescription: newCategory.metaDescription,
        featured: newCategory.featured,
        sortOrder: newCategory.sortOrder,
        postsCount: 0,
        createdAt: newCategory.createdAt.toISOString(),
        updatedAt: newCategory.updatedAt.toISOString()
      },
      message: 'Danh mục mới đã được tạo thành công!'
    }, { status: 201 });

  } catch (error) {
    console.error('🏷️ Admin API - Error creating category:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo danh mục mới' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/categories:
 *   put:
 *     summary: Update category settings (bulk update)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     sortOrder:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Categories updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('🏷️ Admin API - Bulk updating categories:', body);

    const { categories } = body;

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Categories array is required' },
        { status: 400 }
      );
    }

    // Update categories in batch
    const updatePromises = categories.map(async (cat: any) => {
      return await prisma.category.update({
        where: { id: cat.id },
        data: {
          sortOrder: cat.sortOrder,
          status: cat.status?.toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE'
        }
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Categories đã được cập nhật thành công!'
    });

  } catch (error) {
    console.error('🏷️ Admin API - Error updating categories:', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật categories' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/categories:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID to delete
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Category not found
 *       409:
 *         description: Cannot delete category with posts
 *       500:
 *         description: Internal server error
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID là bắt buộc' },
        { status: 400 }
      );
    }

    console.log('🏷️ Admin API - Deleting category:', categoryId);

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
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

    // Check if category has posts
    if (category._count.posts > 0) {
      return NextResponse.json(
        { error: `Không thể xóa category có ${category._count.posts} bài viết. Vui lòng di chuyển các bài viết sang category khác trước.` },
        { status: 409 }
      );
    }

    // Delete category
    await prisma.category.delete({
      where: { id: categoryId }
    });

    console.log('🏷️ Admin API - Category deleted:', categoryId);

    return NextResponse.json({
      success: true,
      message: 'Category đã được xóa thành công!'
    });

  } catch (error) {
    console.error('🏷️ Admin API - Error deleting category:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa category' },
      { status: 500 }
    );
  }
}