import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Create new category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('🆕 Admin API - Creating new category:', body);

    const { name, slug, description, color, status, metaTitle, metaDescription, featured } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Tên và slug là bắt buộc' },
        { status: 400 }
      );
    }

    // Check if slug already exists (simulate checking against predefined categories)
    const existingCategories = [
      'trending-now', 'sounds', 'challenges', 'celebrities', 
      'top-lists', 'filters', 'social-media', 'guidelines'
    ];

    if (existingCategories.includes(slug)) {
      return NextResponse.json(
        { error: 'Slug đã tồn tại' },
        { status: 409 }
      );
    }

    // Since categories are handled as enums in the current system,
    // we'll simulate the creation but explain the limitation
    const newCategory = {
      id: slug.toUpperCase().replace(/-/g, '_'),
      name,
      slug,
      description: description || '',
      color: color || '#8B5CF6',
      status: status || 'active',
      metaTitle: metaTitle || name,
      metaDescription: metaDescription || description || '',
      featured: featured || false,
      postsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real implementation, you would:
    // 1. Add the category to the database
    // 2. Update the enum in your schema if needed
    // 3. Handle database migrations
    
    // For now, we'll return a success response with instructions
    console.log('🆕 Admin API - Category would be created:', newCategory);
    
    return NextResponse.json({
      success: true,
      data: newCategory,
      message: 'Danh mục mới đã được tạo thành công! Lưu ý: Trong hệ thống hiện tại, danh mục được quản lý thông qua enum. Để áp dụng thay đổi, bạn cần cập nhật code và deploy lại.',
      instructions: [
        '1. Thêm danh mục mới vào PREDEFINED_CATEGORIES trong route.ts',
        '2. Cập nhật enum Category trong schema database',
        '3. Chạy migration database',
        '4. Deploy lại ứng dụng'
      ]
    });

  } catch (error) {
    console.error('🆕 Admin API - Error creating category:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo danh mục mới' },
      { status: 500 }
    );
  }
}

// GET: Get form data for creating new category
export async function GET(req: NextRequest) {
  try {
    // Return default form data and existing categories for validation
    const existingCategories = [
      'trending-now', 'sounds', 'challenges', 'celebrities', 
      'top-lists', 'filters', 'social-media', 'guidelines'
    ];

    const defaultColors = [
      '#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
      '#EC4899', '#F97316', '#84CC16', '#06B6D4', '#6366F1'
    ];

    return NextResponse.json({
      success: true,
      data: {
        existingCategories,
        defaultColors,
        defaultData: {
          name: '',
          slug: '',
          description: '',
          color: defaultColors[0],
          status: 'active',
          metaTitle: '',
          metaDescription: '',
          featured: false
        }
      }
    });
  } catch (error) {
    console.error('🆕 Admin API - Error getting form data:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tải dữ liệu form' },
      { status: 500 }
    );
  }
}