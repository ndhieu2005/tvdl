import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withEditorAuth } from '@/lib/middleware/auth';

/**
 * @swagger
 * /api/admin/books/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết sách
 *     description: Lấy thông tin chi tiết của một sách theo ID
 *     tags: [Admin - Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sách
 *     responses:
 *       200:
 *         description: Thông tin sách được trả về thành công
 *       404:
 *         description: Không tìm thấy sách
 *       500:
 *         description: Lỗi server
 */
export const GET = withEditorAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    console.log('🔥 GET /api/admin/books/[id] - Starting request for ID:', params.id);
    
    const book = await prisma.book.findUnique({
      where: { id: params.id }
    });

    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy sách' },
        { status: 404 }
      );
    }

    console.log('🔥 GET /api/admin/books/[id] - Found book:', book.title);

    return NextResponse.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('🔥 GET /api/admin/books/[id] - Error fetching book:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/admin/books/{id}:
 *   put:
 *     summary: Cập nhật thông tin sách
 *     description: Cập nhật thông tin của một sách theo ID
 *     tags: [Admin - Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sách
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
 *               availableQuantity:
 *                 type: integer
 *                 description: Số lượng có sẵn
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
 *     responses:
 *       200:
 *         description: Sách được cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy sách
 *       500:
 *         description: Lỗi server
 */
export const PUT = withEditorAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    console.log('🔥 PUT /api/admin/books/[id] - Starting request for ID:', params.id);
    
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
      quantity,
      availableQuantity,
      location,
      status,
      metaTitle,
      metaDescription
    } = body;

    // Get user from request
    const user = (request as any).user;
    console.log('🔥 PUT /api/admin/books/[id] - User from request:', user);

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: params.id }
    });

    if (!existingBook) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy sách' },
        { status: 404 }
      );
    }

    // Check if bookCode already exists (excluding current book)
    if (bookCode && bookCode !== existingBook.bookCode) {
      const existingBookCode = await prisma.book.findFirst({
        where: { 
          bookCode,
          id: { not: params.id }
        }
      });

      if (existingBookCode) {
        return NextResponse.json(
          { success: false, error: 'Mã sách đã tồn tại' },
          { status: 400 }
        );
      }
    }

    // Check if ISBN already exists (excluding current book)
    if (isbn && isbn !== existingBook.isbn) {
      const existingISBN = await prisma.book.findFirst({
        where: { 
          isbn,
          id: { not: params.id }
        }
      });

      if (existingISBN) {
        return NextResponse.json(
          { success: false, error: 'ISBN đã tồn tại' },
          { status: 400 }
        );
      }
    }

    // Generate new slug if title changed
    let finalSlug = existingBook.slug;
    if (title && title !== existingBook.title) {
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if new slug already exists
      const existingSlug = await prisma.book.findFirst({
        where: { 
          slug: newSlug,
          id: { not: params.id }
        }
      });

      if (existingSlug) {
        finalSlug = `${newSlug}-${Date.now()}`;
      } else {
        finalSlug = newSlug;
      }
    }

    // Update book
    const updatedBook = await prisma.book.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(author && { author }),
        ...(description !== undefined && { description }),
        ...(coverImage !== undefined && { coverImage }),
        ...(bookCode && { bookCode }),
        ...(isbn !== undefined && { isbn }),
        ...(publisher !== undefined && { publisher }),
        ...(publishYear !== undefined && { publishYear }),
        ...(genre !== undefined && { genre }),
        ...(pages !== undefined && { pages }),
        ...(quantity !== undefined && { quantity }),
        ...(availableQuantity !== undefined && { availableQuantity }),
        ...(location !== undefined && { location }),
        ...(status && { status }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        slug: finalSlug,
        updatedBy: user.userId
      }
    });

    console.log('🔥 PUT /api/admin/books/[id] - Updated book:', updatedBook.id);

    return NextResponse.json({
      success: true,
      data: updatedBook
    });

  } catch (error) {
    console.error('🔥 PUT /api/admin/books/[id] - Error updating book:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update book' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/admin/books/{id}:
 *   delete:
 *     summary: Xóa sách
 *     description: Xóa một sách theo ID
 *     tags: [Admin - Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sách
 *     responses:
 *       200:
 *         description: Sách được xóa thành công
 *       404:
 *         description: Không tìm thấy sách
 *       500:
 *         description: Lỗi server
 */
export const DELETE = withEditorAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    console.log('🔥 DELETE /api/admin/books/[id] - Starting request for ID:', params.id);
    
    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: params.id }
    });

    if (!existingBook) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy sách' },
        { status: 404 }
      );
    }

    // Delete book
    await prisma.book.delete({
      where: { id: params.id }
    });

    console.log('🔥 DELETE /api/admin/books/[id] - Deleted book:', params.id);

    return NextResponse.json({
      success: true,
      message: 'Sách đã được xóa thành công'
    });

  } catch (error) {
    console.error('🔥 DELETE /api/admin/books/[id] - Error deleting book:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete book' },
      { status: 500 }
    );
  }
});