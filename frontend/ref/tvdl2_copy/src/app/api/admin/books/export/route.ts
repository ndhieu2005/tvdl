import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withEditorAuth } from '@/lib/middleware/auth';
import * as XLSX from 'xlsx';

/**
 * @swagger
 * /api/admin/books/export:
 *   get:
 *     summary: Export danh sách sách ra Excel
 *     description: Export toàn bộ danh sách sách ra file Excel
 *     tags: [Admin - Books]
 *     parameters:
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
 *     responses:
 *       200:
 *         description: File Excel được tạo thành công
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Lỗi server
 */
export const GET = withEditorAuth(async (request: NextRequest) => {
  try {
    console.log('🔥 GET /api/admin/books/export - Starting export');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const genre = searchParams.get('genre');

    // Build query
    let whereClause: any = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (genre) {
      whereClause.genre = { contains: genre, mode: 'insensitive' };
    }

    // Fetch all books
    const books = await prisma.book.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    console.log('🔥 GET /api/admin/books/export - Found books:', books.length);

    // Prepare data for Excel
    const excelData = books.map(book => ({
      'Mã sách': book.bookCode,
      'Tên sách': book.title,
      'Tác giả': book.author,
      'ISBN': book.isbn || '',
      'Nhà xuất bản': book.publisher || '',
      'Năm xuất bản': book.publishYear || '',
      'Thể loại': book.genre || '',
      'Số trang': book.pages || '',
      'Số lượng': book.quantity,
      'Số lượng có sẵn': book.availableQuantity,
      'Vị trí': book.location || '',
      'Trạng thái': book.status,
      'Mô tả': book.description || '',
      'Ngày tạo': book.createdAt.toISOString().split('T')[0],
      'Ngày cập nhật': book.updatedAt.toISOString().split('T')[0]
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Mã sách
      { wch: 30 }, // Tên sách
      { wch: 20 }, // Tác giả
      { wch: 15 }, // ISBN
      { wch: 20 }, // Nhà xuất bản
      { wch: 12 }, // Năm xuất bản
      { wch: 15 }, // Thể loại
      { wch: 10 }, // Số trang
      { wch: 10 }, // Số lượng
      { wch: 15 }, // Số lượng có sẵn
      { wch: 15 }, // Vị trí
      { wch: 12 }, // Trạng thái
      { wch: 40 }, // Mô tả
      { wch: 12 }, // Ngày tạo
      { wch: 12 }  // Ngày cập nhật
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách sách');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `danh-sach-sach-${timestamp}.xlsx`;

    console.log('🔥 GET /api/admin/books/export - Export completed');

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('🔥 GET /api/admin/books/export - Error exporting books:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export books' },
      { status: 500 }
    );
  }
});