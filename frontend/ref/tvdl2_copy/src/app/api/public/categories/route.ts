import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth } from '@/lib/middleware/api-auth';

// GET: Lấy danh sách categories với API key
export const GET = withApiKeyAuth('category', 'read', async (req: NextRequest) => {
  try {
    console.log('🏷️ Public API - Getting categories');

    // Return predefined categories from PostCategory enum
    const categories = [
      { id: 'TRENDING_NOW', name: 'Trending Now', slug: 'trending-now' },
      { id: 'SOUNDS', name: 'Sounds', slug: 'sounds' },
      { id: 'CHALLENGES', name: 'Challenges', slug: 'challenges' },
      { id: 'CELEBRITIES', name: 'Celebrities', slug: 'celebrities' },
      { id: 'TOP_LISTS', name: 'Top Lists', slug: 'top-lists' },
      { id: 'FILTERS', name: 'Filters', slug: 'filters' },
      { id: 'SOCIAL_MEDIA', name: 'Social Media', slug: 'social-media' },
      { id: 'GUIDELINES', name: 'Guidelines', slug: 'guidelines' }
    ];
    
    console.log('🏷️ Public API - Categories found:', categories.length);
    
    return NextResponse.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('🏷️ Public API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách categories' },
      { status: 500 }
    );
  }
});

// POST: Tạo category với API key (custom categories)
export const POST = withApiKeyAuth('category', 'create', async (req: NextRequest) => {
  try {
    const body = await req.json();
    console.log('🏷️ Public API - Creating category with data:', body);

    // Note: Since PostCategory is an enum, we can't create new categories in the database
    // This endpoint could be used for custom category management if needed
    
    return NextResponse.json({
      success: false,
      message: 'Categories được quản lý thông qua enum, không thể tạo mới qua API'
    }, { status: 400 });

  } catch (error) {
    console.error('🏷️ Public API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo category' },
      { status: 500 }
    );
  }
});

// PUT: Update category với API key
export const PUT = withApiKeyAuth('category', 'update', async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get('id');
    const body = await req.json();

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID là bắt buộc' },
        { status: 400 }
      );
    }

    // Note: Since PostCategory is an enum, we can't update categories in the database
    // This endpoint could be used for custom category management if needed
    
    return NextResponse.json({
      success: false,
      message: 'Categories được quản lý thông qua enum, không thể cập nhật qua API'
    }, { status: 400 });

  } catch (error) {
    console.error('🏷️ Public API - Update Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật category' },
      { status: 500 }
    );
  }
});

// DELETE: Xóa category với API key
export const DELETE = withApiKeyAuth('category', 'delete', async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID là bắt buộc' },
        { status: 400 }
      );
    }

    // Note: Since PostCategory is an enum, we can't delete categories from the database
    // This endpoint could be used for custom category management if needed
    
    return NextResponse.json({
      success: false,
      message: 'Categories được quản lý thông qua enum, không thể xóa qua API'
    }, { status: 400 });

  } catch (error) {
    console.error('🏷️ Public API - Delete Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa category' },
      { status: 500 }
    );
  }
});