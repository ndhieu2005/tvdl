import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Bulk actions for categories
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('🔄 Admin API - Bulk action:', body);

    const { action, categoryIds } = body;

    if (!action || !categoryIds || !Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: 'Action và categoryIds là bắt buộc' },
        { status: 400 }
      );
    }

    let results = [];

    switch (action) {
      case 'delete':
        // Check if any category has posts
        const categoriesWithPosts = await Promise.all(
          categoryIds.map(async (categoryId) => {
            const postsCount = await prisma.post.count({
              where: { category: categoryId as any }
            });
            return { categoryId, postsCount };
          })
        );

        const hasPostsCategories = categoriesWithPosts.filter(c => c.postsCount > 0);
        
        if (hasPostsCategories.length > 0) {
          return NextResponse.json({
            error: `Không thể xóa ${hasPostsCategories.length} danh mục vì có bài viết liên quan`
          }, { status: 400 });
        }

        // Since categories are enums, we can't actually delete them
        results = categoryIds.map(id => ({ id, success: false, message: 'Không thể xóa danh mục enum' }));
        break;

      case 'activate':
      case 'deactivate':
        // Since categories are enums, we can't actually update their status
        results = categoryIds.map(id => ({ 
          id, 
          success: false, 
          message: 'Không thể thay đổi trạng thái danh mục enum' 
        }));
        break;

      case 'export':
        // Export categories data
        const categoriesData = await Promise.all(
          categoryIds.map(async (categoryId) => {
            const postsCount = await prisma.post.count({
              where: { category: categoryId as any }
            });
            
            const stats = await prisma.post.aggregate({
              where: { category: categoryId as any },
              _sum: {
                viewCount: true,
                likeCount: true,
                shareCount: true,
                commentCount: true
              }
            });

            return {
              categoryId,
              postsCount,
              totalViews: stats._sum.viewCount || 0,
              totalLikes: stats._sum.likeCount || 0,
              totalShares: stats._sum.shareCount || 0,
              totalComments: stats._sum.commentCount || 0
            };
          })
        );

        return NextResponse.json({
          success: true,
          data: categoriesData,
          message: 'Dữ liệu categories đã được xuất'
        });

      default:
        return NextResponse.json(
          { error: 'Action không hợp lệ' },
          { status: 400 }
        );
    }

    console.log('🔄 Admin API - Bulk action completed:', results);
    
    return NextResponse.json({
      success: true,
      results,
      message: `Đã thực hiện ${action} trên ${categoryIds.length} danh mục`
    });

  } catch (error) {
    console.error('🔄 Admin API - Bulk action error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi thực hiện bulk action' },
      { status: 500 }
    );
  }
}