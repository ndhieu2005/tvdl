// Static pages & feature sections catalog for site-wide search
export const STATIC_PAGES = [
  {
    id: 'page-home',
    type: 'page',
    typeLabel: 'Trang thông tin',
    title: 'Trang chủ Thư viện Dương Liễu',
    snippet: 'Cổng thông tin chính thức của Thư viện Dương Liễu - Đọc sách, sự kiện và hoạt động cộng đồng.',
    url: '/',
    keywords: ['trang chu', 'home', 'thu vien duong lieu', 'gioi thieu tong quan'],
  },
  {
    id: 'page-about',
    type: 'page',
    typeLabel: 'Trang thông tin',
    title: 'Về thư viện Dương Liễu',
    snippet: 'Lịch sử hình thành, sứ mệnh, ban quản trị, không gian và quy định chung của Thư viện.',
    url: '/about',
    keywords: ['ve thu vien', 'about', 'lich su', 'su menh', 'khong gian', 'noi quy', 'thanh vien', 'ban chu nhiem'],
  },
  {
    id: 'page-schedule',
    type: 'page',
    typeLabel: 'Trang thông tin',
    title: 'Lịch hoạt động & Sự kiện',
    snippet: 'Thời gian mở cửa các ca đọc, lịch trực ca, sự kiện đặc biệt và thông báo đóng cửa đột xuất.',
    url: '/schedule',
    keywords: ['lich hoat dong', 'schedule', 'gio mo cua', 'lich mo cua', 'ca doc', 'thoi gian', 'su kien', 'lich truc'],
  },
  {
    id: 'page-new-books',
    type: 'page',
    typeLabel: 'Trang thông tin',
    title: 'Sách mới bổ sung',
    snippet: 'Danh mục sách mới nhập, sách nổi bật theo tháng, phân loại theo độ tuổi và thể loại.',
    url: '/new-books',
    keywords: ['sach moi', 'new books', 'sach noi bat', 'sach thang', 'danh muc sach', 'doc sach'],
  },
  {
    id: 'page-services',
    type: 'page',
    typeLabel: 'Trang thông tin',
    title: 'Dịch vụ thư viện',
    snippet: 'Dịch vụ mượn trả sách, đọc tại chỗ, làm thẻ bạn đọc, không gian học tập và làm việc cộng đồng.',
    url: '/services',
    keywords: ['dich vu thu vien', 'services', 'muon tra sach', 'the ban doc', 'khong gian hoc tap', 'quy trinh muon sach'],
  },
  {
    id: 'page-suggest',
    type: 'page',
    typeLabel: 'Trang thông tin',
    title: 'Đề xuất bổ sung sách',
    snippet: 'Gửi yêu cầu hoặc gợi ý những đầu sách hay bạn muốn thư viện trang bị thêm.',
    url: '/suggest',
    keywords: ['de xuat sach', 'suggest', 'dong gop', 'yeu cau sach', 'goi y sach', 'xin sach'],
  },
  {
    id: 'page-news',
    type: 'page',
    typeLabel: 'Trang thông tin',
    title: 'Tin tức & Hoạt động',
    snippet: 'Tổng hợp các bài viết, tin tức sự kiện, phóng sự và câu chuyện đọc sách tại Dương Liễu.',
    url: '/news',
    keywords: ['tin tuc', 'news', 'bai viet', 'hoat dong', 'su kien', 'cau chuyen', 'thong bao'],
  },
  {
    id: 'page-contact',
    type: 'page',
    typeLabel: 'Trang thông tin',
    title: 'Liên hệ & Địa chỉ',
    snippet: 'Thông tin liên hệ, địa chỉ các cơ sở thư viện, hòm thư điện tử và mạng xã hội.',
    url: '/contact',
    keywords: ['lien he', 'contact', 'dia chi', 'so dien thoai', 'email', 'co so 1', 'co so 2', 'facebook', 'youtube'],
  },
];

// Simple helper to remove Vietnamese accents for fuzzy matching
export function removeVietnameseTones(str = '') {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

// Search static pages index
export function searchStaticPages(query = '') {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const normalizedQuery = removeVietnameseTones(trimmed);

  const matched = [];

  for (const page of STATIC_PAGES) {
    const normTitle = removeVietnameseTones(page.title);
    const normSnippet = removeVietnameseTones(page.snippet);
    const matchedKeyword = page.keywords.find((kw) =>
      removeVietnameseTones(kw).includes(normalizedQuery) || normalizedQuery.includes(removeVietnameseTones(kw))
    );

    let matchArea = null;
    if (normTitle.includes(normalizedQuery)) {
      matchArea = 'Tiêu đề trang';
    } else if (normSnippet.includes(normalizedQuery)) {
      matchArea = 'Mô tả trang';
    } else if (matchedKeyword) {
      matchArea = 'Từ khóa chuyên mục';
    }

    if (matchArea) {
      matched.push({
        ...page,
        matchArea,
      });
    }
  }

  return matched;
}
