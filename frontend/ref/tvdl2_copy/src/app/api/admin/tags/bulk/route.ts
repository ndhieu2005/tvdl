import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware/auth';
import { z } from 'zod';

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()),
  force: z.boolean().optional(),
});

const bulkUpdateSchema = z.object({
  ids: z.array(z.string()),
  data: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    featured: z.boolean().optional(),
    color: z.string().optional(),
  }),
});

// POST: Bulk operations cho tags (Admin)
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();
    const { action, ...data } = body;

    switch (action) {
      case 'delete':
        return await handleBulkDelete(data);
      case 'update':
        return await handleBulkUpdate(data);
      default:
        return NextResponse.json(
          { error: 'Action không hợp lệ' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Admin Tags Bulk Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi thực hiện bulk operation' },
      { status: 500 }
    );
  }
});

async function handleBulkDelete(data: any) {
  try {
    const { ids, force } = bulkDeleteSchema.parse(data);

    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'Danh sách ID không được trống' },
        { status: 400 }
      );
    }

    // Kiểm tra tags tồn tại và đếm số bài viết
    const tags = await prisma.tag.findMany({
      where: { id: { in: ids } },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (tags.length !== ids.length) {
      return NextResponse.json(
        { error: 'Một số tags không tồn tại' },
        { status: 404 }
      );
    }

    // Kiểm tra tags có bài viết
    const tagsWithPosts = tags.filter(tag => tag._count.posts > 0);
    
    if (tagsWithPosts.length > 0 && !force) {
      return NextResponse.json(
        { 
          error: `${tagsWithPosts.length} tags đang được sử dụng bởi bài viết`,
          tagsWithPosts: tagsWithPosts.map(tag => ({
            id: tag.id,
            name: tag.name,
            postCount: tag._count.posts,
          })),
          canForceDelete: true,
        },
        { status: 400 }
      );
    }

    // Nếu force delete, xóa tất cả quan hệ PostTag
    if (force && tagsWithPosts.length > 0) {
      await prisma.postTag.deleteMany({
        where: { tagId: { in: ids } },
      });
    }

    // Xóa tags
    const deleteResult = await prisma.tag.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      success: true,
      message: `Xóa ${deleteResult.count} tags thành công`,
      deletedCount: deleteResult.count,
    });

  } catch (error) {
    console.error('Bulk Delete Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}

async function handleBulkUpdate(data: any) {
  try {
    const { ids, data: updateData } = bulkUpdateSchema.parse(data);

    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'Danh sách ID không được trống' },
        { status: 400 }
      );
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Dữ liệu cập nhật không được trống' },
        { status: 400 }
      );
    }

    // Kiểm tra tags tồn tại
    const existingTags = await prisma.tag.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    if (existingTags.length !== ids.length) {
      return NextResponse.json(
        { error: 'Một số tags không tồn tại' },
        { status: 404 }
      );
    }

    // Cập nhật tags
    const updateResult = await prisma.tag.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Cập nhật ${updateResult.count} tags thành công`,
      updatedCount: updateResult.count,
    });

  } catch (error) {
    console.error('Bulk Update Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}