import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withEditorAuth } from '@/lib/middleware/auth';
import * as XLSX from 'xlsx';

/**
 * @swagger
 * /api/admin/books/import:
 *   post:
 *     summary: Import danh sách sách từ Excel
 *     description: Import danh sách sách từ file Excel
 *     tags: [Admin - Books]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File Excel chứa danh sách sách
 *     responses:
 *       200:
 *         description: Import thành công
 *       400:
 *         description: File không hợp lệ hoặc dữ liệu không đúng format
 *       500:
 *         description: Lỗi server
 */
export const POST = withEditorAuth(async (request: NextRequest) => {
  try {
    console.log('🔥 POST /api/admin/books/import - Starting import');
    
    // Get user from request
    const user = (request as any).user;
    console.log('🔥 POST /api/admin/books/import - User from request:', user);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy file' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { success: false, error: 'File phải có định dạng Excel (.xlsx hoặc .xls)' },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Get first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'File Excel không có dữ liệu' },
        { status: 400 }
      );
    }

    console.log('🔥 POST /api/admin/books/import - Found rows:', jsonData.length);

    // Validate and process data
    const processedBooks: any[] = [];
    const errors: string[] = [];
    const duplicateBookCodes: string[] = [];
    const duplicateISBNs: string[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;
      const rowNumber = i + 2; // Excel row number (starting from 2, assuming row 1 is header)

      try {
        // Map Excel columns to database fields (support template format)
        const bookData = {
          title: row['Tên sách (*)'] || row['Tên sách'] || row['Title'] || row['title'],
          author: row['Tác giả (*)'] || row['Tác giả'] || row['Author'] || row['author'],
          bookCode: row['Mã sách (*)'] || row['Mã sách'] || row['Book Code'] || row['bookCode'],
          isbn: row['ISBN'] || row['isbn'] || null,
          publisher: row['Nhà xuất bản'] || row['Publisher'] || row['publisher'] || null,
          publishYear: row['Năm xuất bản'] || row['Publish Year'] || row['publishYear'] || null,
          genre: row['Thể loại'] || row['Genre'] || row['genre'] || null,
          pages: row['Số trang'] || row['Pages'] || row['pages'] || null,
          quantity: row['Số lượng'] || row['Quantity'] || row['quantity'] || 1,
          location: row['Vị trí'] || row['Location'] || row['location'] || null,
          status: row['Trạng thái'] || row['Status'] || row['status'] || 'AVAILABLE',
          description: row['Mô tả'] || row['Description'] || row['description'] || null,
          metaTitle: row['Meta Title'] || row['metaTitle'] || null,
          metaDescription: row['Meta Description'] || row['metaDescription'] || null
        };

        // Validate required fields
        if (!bookData.title || bookData.title.toString().trim() === '') {
          errors.push(`Dòng ${rowNumber}: Thiếu tên sách (bắt buộc)`);
          continue;
        }
        
        if (!bookData.author || bookData.author.toString().trim() === '') {
          errors.push(`Dòng ${rowNumber}: Thiếu tác giả (bắt buộc)`);
          continue;
        }
        
        if (!bookData.bookCode || bookData.bookCode.toString().trim() === '') {
          errors.push(`Dòng ${rowNumber}: Thiếu mã sách (bắt buộc)`);
          continue;
        }

        // Clean up string fields
        bookData.title = bookData.title.toString().trim();
        bookData.author = bookData.author.toString().trim();
        bookData.bookCode = bookData.bookCode.toString().trim();
        
        if (bookData.isbn) {
          bookData.isbn = bookData.isbn.toString().trim();
        }
        
        if (bookData.publisher) {
          bookData.publisher = bookData.publisher.toString().trim();
        }
        
        if (bookData.genre) {
          bookData.genre = bookData.genre.toString().trim();
        }
        
        if (bookData.location) {
          bookData.location = bookData.location.toString().trim();
        }
        
        if (bookData.description) {
          bookData.description = bookData.description.toString().trim();
        }

        // Validate status
        const validStatuses = ['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE', 'LOST', 'DAMAGED'];
        if (!validStatuses.includes(bookData.status)) {
          bookData.status = 'AVAILABLE';
        }

        // Convert numeric fields
        if (bookData.publishYear) {
          bookData.publishYear = parseInt(bookData.publishYear.toString());
          if (isNaN(bookData.publishYear)) {
            bookData.publishYear = null;
          }
        }

        if (bookData.pages) {
          bookData.pages = parseInt(bookData.pages.toString());
          if (isNaN(bookData.pages)) {
            bookData.pages = null;
          }
        }

        if (bookData.quantity) {
          bookData.quantity = parseInt(bookData.quantity.toString());
          if (isNaN(bookData.quantity) || bookData.quantity < 1) {
            bookData.quantity = 1;
          }
        }

        processedBooks.push({
          ...bookData,
          rowNumber
        });

      } catch (error) {
        errors.push(`Dòng ${rowNumber}: Lỗi xử lý dữ liệu - ${error}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Có lỗi trong dữ liệu',
        details: errors
      }, { status: 400 });
    }

    // Check for duplicates in database
    const bookCodes = processedBooks.map(book => book.bookCode);
    const isbns = processedBooks.filter(book => book.isbn).map(book => book.isbn);

    const [existingBookCodes, existingISBNs] = await Promise.all([
      prisma.book.findMany({
        where: { bookCode: { in: bookCodes } },
        select: { bookCode: true }
      }),
      isbns.length > 0 ? prisma.book.findMany({
        where: { isbn: { in: isbns } },
        select: { isbn: true }
      }) : []
    ]);

    const existingBookCodeSet = new Set(existingBookCodes.map(book => book.bookCode));
    const existingISBNSet = new Set(existingISBNs.map(book => book.isbn));

    // Filter out duplicates
    const booksToImport = processedBooks.filter(book => {
      if (existingBookCodeSet.has(book.bookCode)) {
        duplicateBookCodes.push(`Dòng ${book.rowNumber}: Mã sách "${book.bookCode}" đã tồn tại`);
        return false;
      }
      if (book.isbn && existingISBNSet.has(book.isbn)) {
        duplicateISBNs.push(`Dòng ${book.rowNumber}: ISBN "${book.isbn}" đã tồn tại`);
        return false;
      }
      return true;
    });

    if (booksToImport.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Không có sách nào được import',
        details: [...duplicateBookCodes, ...duplicateISBNs]
      }, { status: 400 });
    }

    // Import books to database
    const importedBooks = [];
    for (const bookData of booksToImport) {
      try {
        // Generate slug
        const slug = bookData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        // Check if slug exists and make it unique
        let finalSlug = slug;
        const existingSlug = await prisma.book.findFirst({
          where: { slug: finalSlug }
        });

        if (existingSlug) {
          finalSlug = `${slug}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        }

        const book = await prisma.book.create({
          data: {
            title: bookData.title,
            author: bookData.author,
            description: bookData.description,
            bookCode: bookData.bookCode,
            isbn: bookData.isbn,
            publisher: bookData.publisher,
            publishYear: bookData.publishYear,
            genre: bookData.genre,
            pages: bookData.pages,
            quantity: bookData.quantity,
            availableQuantity: bookData.quantity, // Initially all books are available
            location: bookData.location,
            status: bookData.status,
            slug: finalSlug,
            metaTitle: bookData.metaTitle,
            metaDescription: bookData.metaDescription,
            createdBy: user.userId
          }
        });

        importedBooks.push(book);
      } catch (error) {
        console.error(`Error importing book at row ${bookData.rowNumber}:`, error);
        errors.push(`Dòng ${bookData.rowNumber}: Lỗi tạo sách - ${error}`);
      }
    }

    console.log('🔥 POST /api/admin/books/import - Imported books:', importedBooks.length);

    return NextResponse.json({
      success: true,
      message: `Import thành công ${importedBooks.length} sách`,
      data: {
        imported: importedBooks.length,
        total: jsonData.length,
        duplicates: duplicateBookCodes.length + duplicateISBNs.length,
        errors: errors.length
      },
      details: {
        duplicateBookCodes,
        duplicateISBNs,
        errors
      }
    });

  } catch (error) {
    console.error('🔥 POST /api/admin/books/import - Error importing books:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import books' },
      { status: 500 }
    );
  }
});