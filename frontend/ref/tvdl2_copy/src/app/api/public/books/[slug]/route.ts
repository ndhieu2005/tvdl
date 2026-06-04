import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/public/books/{slug}:
 *   get:
 *     summary: Lấy thông tin chi tiết sách theo slug
 *     description: Lấy thông tin chi tiết của một sách dựa trên slug
 *     tags: [Public - Books]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug của sách
 *     responses:
 *       200:
 *         description: Thông tin sách được trả về thành công
 *       404:
 *         description: Không tìm thấy sách
 *       500:
 *         description: Lỗi server
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('🔥 GET /api/public/books/[slug] - Starting request for slug:', slug);
    
    const book = await prisma.book.findFirst({
      where: {
        slug: slug,
        status: {
          not: 'LOST' // Không hiển thị sách bị mất
        }
      },
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
        quantity: true,
        availableQuantity: true,
        location: true,
        status: true,
        slug: true,
        metaTitle: true,
        metaDescription: true,
        createdAt: true
      }
    });

    if (!book) {
      console.log('🔥 GET /api/public/books/[slug] - Book not found for slug:', slug);
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy sách' },
        { status: 404 }
      );
    }

    console.log('🔥 GET /api/public/books/[slug] - Found book:', book.id);

    return NextResponse.json({
      success: true,
      data: book
    });

  } catch (error) {
    console.error('🔥 GET /api/public/books/[slug] - Error fetching book:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch book',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}