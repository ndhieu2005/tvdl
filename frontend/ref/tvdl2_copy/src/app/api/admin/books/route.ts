import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withEditorAuth } from '@/lib/middleware/auth';

/**
 * @swagger
 * /api/admin/books:
 *   get:
 *     summary: Lấy danh sách sách cho Admin
 *     description: Lấy danh sách sách với phân trang, tìm kiếm và lọc
 *     tags: [Admin - Books]
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
 *           default: 10
 *         description: Số sách mỗi trang
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, UNAVAILABLE, MAINTENANCE, LOST, DAMAGED]
 *         description: Lọc theo trạng thái sách
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Lọc theo thể loại
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên sách, tác giả, mã sách hoặc ISBN
 *     responses:
 *       200:
 *         description: Danh sách sách được trả về thành công
 *       500:
 *         description: Lỗi server
 */
export const GET = withEditorAuth(async (request: NextRequest) => {
  try {
    console.log('🔥 GET /api/admin/books - Starting request');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');

    // Build query
    let whereClause: any = {};
    
    // Add filters
    if (status) {
      whereClause.status = status;
    }
    
    if (genre) {
      whereClause.genre = { contains: genre, mode: 'insensitive' };
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { bookCode: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
        { publisher: { contains: search, mode: 'insensitive' } }
      ];
    }

    console.log('🔥 GET /api/admin/books - Where clause:', JSON.stringify(whereClause, null, 2));

    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.book.count({
        where: whereClause
      })
    ]);

    console.log('🔥 GET /api/admin/books - Found books:', books.length);
    console.log('🔥 GET /api/admin/books - Total books:', total);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('🔥 GET /api/admin/books - Error fetching books:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/admin/books:
 *   post:
 *     summary: Tạo sách mới
 *     description: Tạo sách mới với thông tin đầy đủ
 *     tags: [Admin - Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tên sách
 *               author:
 *                 type: string
 *                 description: Tác giả
 *               description:
 *                 type: string
 *                 description: Mô tả sách
 *               coverImage:
 *                 type: string
 *                 description: URL hình ảnh bìa sách
 *               bookCode:
 *                 type: string
 *                 description: Mã sách (unique)
 *               isbn:
 *                 type: string
 *                 description: ISBN (unique)
 *               publisher:
 *                 type: string
 *                 description: Nhà xuất bản
 *               publishYear:
 *                 type: integer
 *                 description: Năm xuất bản
 *               genre:
 *                 type: string
 *                 description: Thể loại
 *               pages:
 *                 type: integer
 *                 description: Số trang
 *               quantity:
 *                 type: integer
 *                 description: Số lượng
 *               location:
 *                 type: string
 *                 description: Vị trí trong thư viện
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, UNAVAILABLE, MAINTENANCE, LOST, DAMAGED]
 *                 description: Trạng thái sách
 *               metaTitle:
 *                 type: string
 *                 description: Meta title cho SEO
 *               metaDescription:
 *                 type: string
 *                 description: Meta description cho SEO
 *             required:
 *               - title
 *               - author
 *               - bookCode
 *     responses:
 *       201:
 *         description: Sách được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
export const POST = withEditorAuth(async (request: NextRequest) => {
  try {
    console.log('🔥 POST /api/admin/books - Starting request');
    
    const body = await request.json();
    const {
      title,
      author,
      description,
      coverImage,
      bookCode,
      isbn,
      publisher,
      publishYear,
      genre,
      pages,
      quantity = 1,
      location,
      status = 'AVAILABLE',
      metaTitle,
      metaDescription
    } = body;

    // Get user from request
    const user = (request as any).user;
    console.log('🔥 POST /api/admin/books - User from request:', user);

    // Validate required fields
    if (!title || !author || !bookCode) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc: title, author, bookCode' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if bookCode already exists
    const existingBookCode = await prisma.book.findFirst({
      where: { bookCode }
    });

    if (existingBookCode) {
      return NextResponse.json(
        { success: false, error: 'Mã sách đã tồn tại' },
        { status: 400 }
      );
    }

    // Check if ISBN already exists (if provided)
    if (isbn) {
      const existingISBN = await prisma.book.findFirst({
        where: { isbn }
      });

      if (existingISBN) {
        return NextResponse.json(
          { success: false, error: 'ISBN đã tồn tại' },
          { status: 400 }
        );
      }
    }

    // Check if slug already exists
    let finalSlug = slug;
    const existingSlug = await prisma.book.findFirst({
      where: { slug: finalSlug }
    });

    if (existingSlug) {
      // Add timestamp to make it unique
      finalSlug = `${slug}-${Date.now()}`;
    }

    // Create book
    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        coverImage,
        bookCode,
        isbn,
        publisher,
        publishYear,
        genre,
        pages,
        quantity,
        availableQuantity: quantity, // Initially all books are available
        location,
        status,
        slug: finalSlug,
        metaTitle,
        metaDescription,
        createdBy: user.userId
      }
    });

    console.log('🔥 POST /api/admin/books - Created book:', book.id);

    return NextResponse.json({
      success: true,
      data: book
    }, { status: 201 });

  } catch (error) {
    console.error('🔥 POST /api/admin/books - Error creating book:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create book' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/admin/books:
 *   delete:
 *     summary: Xóa nhiều sách cùng lúc
 *     description: Xóa nhiều sách dựa trên danh sách ID
 *     tags: [Admin - Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách ID của các sách cần xóa
 *             required:
 *               - ids
 *     responses:
 *       200:
 *         description: Xóa sách thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
export const DELETE = withEditorAuth(async (request: NextRequest) => {
  try {
    console.log('🔥 DELETE /api/admin/books - Starting bulk delete request');
    
    const body = await request.json();
    const { ids } = body;

    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Danh sách ID không hợp lệ' },
        { status: 400 }
      );
    }

    // Limit number of items to delete at once
    if (ids.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Chỉ có thể xóa tối đa 100 sách cùng lúc' },
        { status: 400 }
      );
    }

    console.log('🔥 DELETE /api/admin/books - IDs to delete:', ids);

    // Check if books exist and get their info
    const existingBooks = await prisma.book.findMany({
      where: {
        id: {
          in: ids
        }
      },
      select: {
        id: true,
        title: true,
        bookCode: true
      }
    });

    if (existingBooks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy sách nào để xóa' },
        { status: 404 }
      );
    }

    console.log('🔥 DELETE /api/admin/books - Found books to delete:', existingBooks.length);

    // Delete books
    const deleteResult = await prisma.book.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    console.log('🔥 DELETE /api/admin/books - Deleted books count:', deleteResult.count);

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: deleteResult.count,
        requestedCount: ids.length,
        deletedBooks: existingBooks
      },
      message: `Đã xóa thành công ${deleteResult.count}/${ids.length} sách`
    });

  } catch (error) {
    console.error('🔥 DELETE /api/admin/books - Error deleting books:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete books',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});