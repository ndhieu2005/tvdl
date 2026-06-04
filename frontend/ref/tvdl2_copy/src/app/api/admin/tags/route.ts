import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { z } from 'zod';

const createTagSchema = z.object({
  name: z.string().min(1, 'Tên tag là bắt buộc'),
  slug: z.string().min(1, 'Slug là bắt buộc'),
  description: z.string().optional(),
  color: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const updateTagSchema = createTagSchema.partial();

/**
 * @swagger
 * /api/admin/tags:
 *   get:
 *     summary: Lấy danh sách tags
 *     description: Lấy danh sách tất cả tags với phân trang, tìm kiếm và sắp xếp
 *     tags: [Admin - Tags]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng tag trên mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên, slug hoặc mô tả
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: name
 *         description: Sắp xếp theo trường
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Danh sách tags được trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tag'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     hasNext:
 *                       type: boolean
 *                       example: true
 *                     hasPrev:
 *                       type: boolean
 *                       example: false
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET: Lấy danh sách tags (Admin)
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    const sortBy = url.searchParams.get('sortBy') || 'name';
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      }),
      prisma.tag.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: tags.map(tag => ({
        ...tag,
        postCount: tag._count.posts,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Admin Tags GET Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách tags' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/admin/tags:
 *   post:
 *     summary: Tạo tag mới
 *     description: Tạo một tag mới trong hệ thống
 *     tags: [Admin - Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TagInput'
 *     responses:
 *       201:
 *         description: Tag được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *                 message:
 *                   type: string
 *                   example: Tạo tag thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc tag đã tồn tại
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
// POST: Tạo tag mới (Admin)
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const validatedData = createTagSchema.parse(body);

    // Kiểm tra duplicate
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name: validatedData.name },
          { slug: validatedData.slug },
        ],
      },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag name hoặc slug đã tồn tại' },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        ...validatedData,
        createdBy: req.user?.userId || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      data: tag,
      message: 'Tạo tag thành công',
    });

  } catch (error) {
    console.error('Admin Tags POST Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Lỗi khi tạo tag' },
      { status: 500 }
    );
  }
});

// PUT: Cập nhật tag (Admin)
export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID tag là bắt buộc' },
        { status: 400 }
      );
    }

    const validatedData = updateTagSchema.parse(updateData);

    // Kiểm tra tag tồn tại
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag không tồn tại' },
        { status: 404 }
      );
    }

    // Kiểm tra duplicate name/slug nếu có thay đổi
    if (validatedData.name || validatedData.slug) {
      const duplicateTag = await prisma.tag.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                validatedData.name ? { name: validatedData.name } : {},
                validatedData.slug ? { slug: validatedData.slug } : {},
              ].filter(condition => Object.keys(condition).length > 0),
            },
          ],
        },
      });

      if (duplicateTag) {
        return NextResponse.json(
          { error: 'Tag name hoặc slug đã tồn tại' },
          { status: 400 }
        );
      }
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: updatedTag,
      message: 'Cập nhật tag thành công',
    });

  } catch (error) {
    console.error('Admin Tags PUT Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật tag' },
      { status: 500 }
    );
  }
});

// DELETE: Xóa tag (Admin)
export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID tag là bắt buộc' },
        { status: 400 }
      );
    }

    // Kiểm tra tag tồn tại
    const existingTag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag không tồn tại' },
        { status: 404 }
      );
    }

    // Kiểm tra xem có bài viết nào đang sử dụng tag này không
    if (existingTag._count.posts > 0) {
      return NextResponse.json(
        { 
          error: `Không thể xóa tag đang được sử dụng bởi ${existingTag._count.posts} bài viết`,
          canForceDelete: true,
        },
        { status: 400 }
      );
    }

    // Xóa tag
    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa tag thành công',
    });

  } catch (error) {
    console.error('Admin Tags DELETE Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa tag' },
      { status: 500 }
    );
  }
});