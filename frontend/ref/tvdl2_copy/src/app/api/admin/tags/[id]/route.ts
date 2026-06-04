import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';

/**
 * @swagger
 * /api/admin/tags/{id}:
 *   get:
 *     summary: Lấy thông tin tag theo ID
 *     description: Lấy thông tin chi tiết của một tag cụ thể
 *     tags: [Admin - Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tag
 *     responses:
 *       200:
 *         description: Thông tin tag được trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Tag'
 *                     - type: object
 *                       properties:
 *                         recentPosts:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               slug:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *       404:
 *         description: Tag không tồn tại
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
// GET: Lấy thông tin tag theo ID (Admin)
export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
        posts: {
          include: {
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Lấy 10 bài viết gần nhất
        },
      },
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...tag,
        postCount: tag._count.posts,
        recentPosts: tag.posts.map(pt => pt.post),
      },
    });

  } catch (error) {
    console.error('Admin Tag GET Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy thông tin tag' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/admin/tags/{id}:
 *   delete:
 *     summary: Xóa tag
 *     description: Xóa một tag khỏi hệ thống. Hỗ trợ force delete để xóa ngay cả khi tag đang được sử dụng
 *     tags: [Admin - Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tag cần xóa
 *       - in: query
 *         name: force
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Bắt buộc xóa ngay cả khi tag đang được sử dụng
 *     responses:
 *       200:
 *         description: Tag được xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Xóa tag thành công
 *       400:
 *         description: Tag đang được sử dụng và không thể xóa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tag không tồn tại
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
// DELETE: Xóa tag với force option (Admin)
export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const url = new URL(req.url);
    const force = url.searchParams.get('force') === 'true';

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

    // Nếu có bài viết và không force delete
    if (existingTag._count.posts > 0 && !force) {
      return NextResponse.json(
        { 
          error: `Không thể xóa tag đang được sử dụng bởi ${existingTag._count.posts} bài viết`,
          canForceDelete: true,
        },
        { status: 400 }
      );
    }

    // Nếu force delete, xóa tất cả quan hệ PostTag trước
    if (force && existingTag._count.posts > 0) {
      await prisma.postTag.deleteMany({
        where: { tagId: id },
      });
    }

    // Xóa tag
    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: force 
        ? `Xóa tag và ${existingTag._count.posts} quan hệ với bài viết thành công`
        : 'Xóa tag thành công',
    });

  } catch (error) {
    console.error('Admin Tag DELETE Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa tag' },
      { status: 500 }
    );
  }
});