import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/public/books:
 *   get:
 *     summary: Lấy danh sách sách công khai
 *     description: Lấy danh sách sách có sẵn cho người dùng xem
 *     tags: [Public - Books]
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
 *           default: 18
 *         description: Số sách mỗi trang
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Lọc theo thể loại
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên sách, tác giả
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, title_asc, title_desc, author_asc, author_desc]
 *           default: newest
 *         description: Sắp xếp
 *     responses:
 *       200:
 *         description: Danh sách sách được trả về thành công
 *       500:
 *         description: Lỗi server
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔥 GET /api/public/books - Starting request');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '18');
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';

    // Build query - only show available books
    let whereClause: any = {
      status: 'AVAILABLE',
      availableQuantity: { gt: 0 }
    };
    
    if (genre) {
      whereClause.genre = { contains: genre, mode: 'insensitive' };
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build order by
    let orderBy: any = { createdAt: 'desc' }; // default newest
    
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'title_asc':
        orderBy = { title: 'asc' };
        break;
      case 'title_desc':
        orderBy = { title: 'desc' };
        break;
      case 'author_asc':
        orderBy = { author: 'asc' };
        break;
      case 'author_desc':
        orderBy = { author: 'desc' };
        break;
    }

    console.log('🔥 GET /api/public/books - Where clause:', JSON.stringify(whereClause, null, 2));

    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          author: true,
          description: true,
          coverImage: true,
          bookCode: true,
          isbn: true,
          publisher: true,
          publishYear: true,
          genre: true,
          pages: true,
          availableQuantity: true,
          slug: true,
          metaTitle: true,
          metaDescription: true,
          createdAt: true
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.book.count({
        where: whereClause
      })
    ]);

    console.log('🔥 GET /api/public/books - Found books:', books.length);
    console.log('🔥 GET /api/public/books - Total books:', total);

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
    console.error('🔥 GET /api/public/books - Error fetching books:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch books',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}