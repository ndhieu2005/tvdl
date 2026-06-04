import { NextRequest, NextResponse } from 'next/server';
import { withEditorAuth } from '@/lib/middleware/auth';
import * as XLSX from 'xlsx';

/**
 * @swagger
 * /api/admin/books/template:
 *   get:
 *     summary: Tải template Excel mẫu cho import sách
 *     description: Tạo và tải về file Excel template với các cột mẫu để import sách
 *     tags: [Admin - Books]
 *     responses:
 *       200:
 *         description: File Excel template được tạo thành công
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
    console.log('🔥 GET /api/admin/books/template - Creating Excel template');

    // Tạo dữ liệu mẫu cho template
    const templateData = [
      {
        'Tên sách (*)': 'Lập trình JavaScript cơ bản',
        'Tác giả (*)': 'Nguyễn Văn A',
        'Mã sách (*)': 'JS001',
        'Mô tả': 'Cuốn sách hướng dẫn lập trình JavaScript từ cơ bản đến nâng cao, phù hợp cho người mới bắt đầu',
        'Thể loại': 'Công nghệ thông tin',
        'ISBN': '978-604-777-123-4',
        'Nhà xuất bản': 'NXB Giáo dục Việt Nam',
        'Năm xuất bản': 2023,
        'Số trang': 350,
        'Số lượng': 5,
        'Vị trí': 'Kệ A1-01',
        'Trạng thái': 'AVAILABLE',
        'Meta Title': 'Lập trình JavaScript cơ bản - Sách hay về lập trình',
        'Meta Description': 'Tìm hiểu lập trình JavaScript từ cơ bản đến nâng cao với cuốn sách này'
      },
      {
        'Tên sách (*)': 'Trí tuệ nhân tạo và Machine Learning',
        'Tác giả (*)': 'Trần Thị B',
        'Mã sách (*)': 'AI001',
        'Mô tả': 'Khám phá thế giới trí tuệ nhân tạo và machine learning với các ví dụ thực tế',
        'Thể loại': 'Khoa học công nghệ',
        'ISBN': '978-604-777-456-7',
        'Nhà xuất bản': 'NXB Khoa học và Kỹ thuật',
        'Năm xuất bản': 2024,
        'Số trang': 420,
        'Số lượng': 3,
        'Vị trí': 'Kệ B2-05',
        'Trạng thái': 'AVAILABLE',
        'Meta Title': 'Trí tuệ nhân tạo và Machine Learning - Sách chuyên sâu',
        'Meta Description': 'Tìm hiểu về AI và ML với cuốn sách chuyên sâu này'
      },
      {
        'Tên sách (*)': 'Văn học Việt Nam hiện đại',
        'Tác giả (*)': 'Lê Văn C',
        'Mã sách (*)': 'VH001',
        'Mô tả': 'Tổng quan về văn học Việt Nam từ đầu thế kỷ 20 đến nay',
        'Thể loại': 'Văn học',
        'ISBN': '978-604-777-789-0',
        'Nhà xuất bản': 'NXB Văn học',
        'Năm xuất bản': 2023,
        'Số trang': 280,
        'Số lượng': 8,
        'Vị trí': 'Kệ C3-12',
        'Trạng thái': 'AVAILABLE',
        'Meta Title': 'Văn học Việt Nam hiện đại - Tổng quan toàn diện',
        'Meta Description': 'Khám phá văn học Việt Nam hiện đại qua các tác phẩm tiêu biểu'
      },
      {
        'Tên sách (*)': '',
        'Tác giả (*)': '',
        'Mã sách (*)': '',
        'Mô tả': '',
        'Thể loại': '',
        'ISBN': '',
        'Nhà xuất bản': '',
        'Năm xuất bản': '',
        'Số trang': '',
        'Số lượng': '',
        'Vị trí': '',
        'Trạng thái': '',
        'Meta Title': '',
        'Meta Description': ''
      }
    ];

    // Tạo worksheet từ dữ liệu
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Thiết lập độ rộng cột
    const columnWidths = [
      { wch: 30 }, // Tên sách
      { wch: 20 }, // Tác giả
      { wch: 15 }, // Mã sách
      { wch: 50 }, // Mô tả
      { wch: 20 }, // Thể loại
      { wch: 18 }, // ISBN
      { wch: 25 }, // Nhà xuất bản
      { wch: 12 }, // Năm xuất bản
      { wch: 10 }, // Số trang
      { wch: 10 }, // Số lượng
      { wch: 15 }, // Vị trí
      { wch: 12 }, // Trạng thái
      { wch: 40 }, // Meta Title
      { wch: 50 }  // Meta Description
    ];
    worksheet['!cols'] = columnWidths;

    // Tạo workbook và thêm worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Sách');

    // Thêm sheet hướng dẫn
    const instructionData = [
      { 'STT': 1, 'Cột': 'Tên sách (*)', 'Bắt buộc': 'CÓ', 'Kiểu dữ liệu': 'Văn bản', 'Mô tả': 'Tên đầy đủ của cuốn sách', 'Ví dụ': 'Lập trình JavaScript cơ bản', 'Ghi chú': 'Không được để trống' },
      { 'STT': 2, 'Cột': 'Tác giả (*)', 'Bắt buộc': 'CÓ', 'Kiểu dữ liệu': 'Văn bản', 'Mô tả': 'Tên tác giả hoặc nhóm tác giả', 'Ví dụ': 'Nguyễn Văn A', 'Ghi chú': 'Có thể có nhiều tác giả, cách nhau bằng dấu phẩy' },
      { 'STT': 3, 'Cột': 'Mã sách (*)', 'Bắt buộc': 'CÓ', 'Kiểu dữ liệu': 'Văn bản', 'Mô tả': 'Mã định danh duy nhất của sách trong thư viện', 'Ví dụ': 'JS001', 'Ghi chú': 'Phải là duy nhất, không được trùng lặp' },
      { 'STT': 4, 'Cột': 'Mô tả', 'Bắt buộc': 'KHÔNG', 'Kiểu dữ liệu': 'Văn bản dài', 'Mô tả': 'Mô tả chi tiết về nội dung, chủ đề của sách', 'Ví dụ': 'Cuốn sách hướng dẫn lập trình JavaScript từ cơ bản đến nâng cao...', 'Ghi chú': 'Nên viết mô tả rõ ràng để độc giả hiểu về sách' },
      { 'STT': 5, 'Cột': 'Thể loại', 'Bắt buộc': 'KHÔNG', 'Kiểu dữ liệu': 'Văn bản', 'Mô tả': 'Thể loại hoặc danh mục của sách', 'Ví dụ': 'Công nghệ thông tin, Văn học, Khoa học', 'Ghi chú': 'Giúp phân loại và tìm kiếm sách' },
      { 'STT': 6, 'Cột': 'ISBN', 'Bắt buộc': 'KHÔNG', 'Kiểu dữ liệu': 'Văn bản', 'Mô tả': 'Mã ISBN quốc tế của sách', 'Ví dụ': '978-604-777-123-4', 'Ghi chú': 'Phải là duy nhất nếu có, định dạng chuẩn ISBN' },
      { 'STT': 7, 'Cột': 'Nhà xuất bản', 'Bắt buộc': 'KHÔNG', 'Kiểu dữ liệu': 'Văn bản', 'Mô tả': 'Tên nhà xuất bản', 'Ví dụ': 'NXB Giáo dục Việt Nam', 'Ghi chú': 'Thông tin về đơn vị xuất bản sách' },
      { 'STT': 8, 'Cột': 'Năm xuất bản', 'Bắt buộc': 'KHÔNG', 'Kiểu dữ liệu': 'Số nguyên', 'Mô tả': 'Năm xuất bản của sách', 'Ví dụ': '2023', 'Ghi chú': 'Chỉ nhập số năm, từ 1900 đến năm hiện tại' },
      { 'STT': 9, 'Cột': 'Số trang', 'Bắt buộc': 'KHÔNG', 'Kiểu dữ liệu': 'Số nguyên', 'Mô tả': 'Tổng số trang của sách', 'Ví dụ': '350', 'Ghi chú': 'Chỉ nhập số, phải lớn hơn 0' },
      { 'STT': 10, 'Cột': 'Số lượng', 'Bắt buộc': 'KHÔNG', 'Kiểu dữ liệu': 'Số nguyên', 'Mô tả': 'Số lượng sách có trong thư viện', 'Ví dụ': '5', 'Ghi chú': 'Mặc định là 1 nếu không nhập' },
      { 'STT': 11, 'Cột': 'Vị trí', 'Bắt buộc': 'KHÔNG', 'Kiểu dữ liệu': 'Văn bản', 'Mô tả': 'Vị trí đặt sách trong thư viện', 'Ví dụ': 'Kệ A1-01, Tầng 2 - Khu A', 'Ghi chú': 'Giúp nhân viên và độc giả tìm sách dễ dàng' },
      { 'STT': 12, 'Cột': 'Trạng thái', 'Bắt buộc': 'KHÔNG', 'Kiểu dữ liệu': 'Văn bản', 'Mô tả': 'Trạng thái hiện tại của sách', 'Ví dụ': 'AVAILABLE', 'Ghi chú': 'Chỉ nhập: AVAILABLE, UNAVAILABLE, MAINTENANCE, LOST, DAMAGED' },
      { 'STT': 13, 'Cột': 'Meta Title', 'Bắt buộc': 'KHÔNG', 'Kiểu dữ liệu': 'Văn bản', 'Mô tả': 'Tiêu đề SEO cho trang web', 'Ví dụ': 'Lập trình JavaScript - Sách hay về lập trình', 'Ghi chú': 'Tối ưu cho công cụ tìm kiếm, nên dưới 60 ký tự' },
      { 'STT': 14, 'Cột': 'Meta Description', 'Bắt buộc': 'KHÔNG', 'Kiểu dữ liệu': 'Văn bản', 'Mô tả': 'Mô tả SEO cho trang web', 'Ví dụ': 'Tìm hiểu lập trình JavaScript từ cơ bản đến nâng cao...', 'Ghi chú': 'Tối ưu cho công cụ tìm kiếm, nên dưới 160 ký tự' }
    ];

    // Thêm sheet lưu ý quan trọng
    const notesData = [
      { 'Loại': 'LƯU Ý QUAN TRỌNG', 'Nội dung': '', 'Chi tiết': '' },
      { 'Loại': 'Trường bắt buộc', 'Nội dung': 'Các cột có dấu (*) phải được điền đầy đủ', 'Chi tiết': 'Tên sách, Tác giả, Mã sách là bắt buộc' },
      { 'Loại': 'Mã sách', 'Nội dung': 'Mã sách phải là duy nhất trong hệ thống', 'Chi tiết': 'Không được trùng với mã sách đã có' },
      { 'Loại': 'ISBN', 'Nội dung': 'ISBN phải là duy nhất nếu có', 'Chi tiết': 'Định dạng chuẩn: 978-xxx-xxx-xxx-x' },
      { 'Loại': 'Trạng thái', 'Nội dung': 'Chỉ nhập các giá trị được phép', 'Chi tiết': 'AVAILABLE, UNAVAILABLE, MAINTENANCE, LOST, DAMAGED' },
      { 'Loại': 'Số liệu', 'Nội dung': 'Năm xuất bản, Số trang, Số lượng phải là số', 'Chi tiết': 'Không nhập chữ hoặc ký tự đặc biệt' },
      { 'Loại': 'Định dạng file', 'Nội dung': 'Chỉ hỗ trợ file .xlsx và .xls', 'Chi tiết': 'Lưu file ở định dạng Excel trước khi import' },
      { 'Loại': 'Kích thước file', 'Nội dung': 'File không được vượt quá 10MB', 'Chi tiết': 'Nếu file quá lớn, chia nhỏ thành nhiều file' },
      { 'Loại': 'Số lượng bản ghi', 'Nội dung': 'Tối đa 1000 sách mỗi lần import', 'Chi tiết': 'Để đảm bảo hiệu suất xử lý' },
      { 'Loại': 'Xử lý lỗi', 'Nội dung': 'Hệ thống sẽ báo lỗi chi tiết nếu có', 'Chi tiết': 'Kiểm tra và sửa lỗi trước khi import lại' }
    ];

    const instructionSheet = XLSX.utils.json_to_sheet(instructionData);
    instructionSheet['!cols'] = [
      { wch: 5 },  // STT
      { wch: 18 }, // Cột
      { wch: 10 }, // Bắt buộc
      { wch: 15 }, // Kiểu dữ liệu
      { wch: 40 }, // Mô tả
      { wch: 35 }, // Ví dụ
      { wch: 45 }  // Ghi chú
    ];
    XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Hướng dẫn');

    // Thêm sheet lưu ý
    const notesSheet = XLSX.utils.json_to_sheet(notesData);
    notesSheet['!cols'] = [
      { wch: 20 }, // Loại
      { wch: 50 }, // Nội dung
      { wch: 40 }  // Chi tiết
    ];
    XLSX.utils.book_append_sheet(workbook, notesSheet, 'Lưu ý quan trọng');

    // Tạo buffer từ workbook
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Tạo response với file Excel
    const response = new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="template-sach-${new Date().toISOString().split('T')[0]}.xlsx"`,
        'Content-Length': buffer.length.toString(),
      },
    });

    console.log('🔥 GET /api/admin/books/template - Template created successfully');
    return response;

  } catch (error) {
    console.error('🔥 GET /api/admin/books/template - Error creating template:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});