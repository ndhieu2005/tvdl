// Vietnamese content constants for library system
export const SITE_CONTENT = {
  navigation: {
    home: "Trang chủ",
    about: "Về thư viện",
    events: "Lịch hoạt động",
    services: "Dịch vụ thư viện",
    news: "Tin tức",
    contact: "Liên hệ",
    privacy: "Chính sách bảo mật",
    terms: "Điều khoản sử dụng",
    privacyPolicy: "Chính sách bảo mật",
    termsOfUse: "Điều khoản sử dụng"
  },
  home: {
    title: "Thư viện Dương Liễu",
    subtitle: "Hệ thống quản lý thư viện hiện đại với đầy đủ dịch vụ cho độc giả",
    latestPosts: "Tin tức mới nhất",
    newBooks: "Sách mới",
    featured: "Nổi bật"
  },
  post: {
    readMore: "Read More",
    share: "Share",
    relatedPosts: "Related Posts",
    publishedOn: "Published on",
    updatedOn: "Updated on",
    tags: "Tags",
    category: "Category"
  },
  search: {
    placeholder: "Tìm kiếm...",
    noResults: "Không tìm thấy kết quả",
    resultsFor: "Kết quả cho"
  },
  footer: {
    description: "Thư viện Dương Liễu - Nơi lưu giữ tri thức và phục vụ cộng đồng.",
    quickLinks: "Liên kết nhanh",
    services: "Dịch vụ",
    legal: "Chính sách"
  },
  common: {
    loading: "Loading...",
    error: "Error",
    notFound: "Not Found",
    backToHome: "Back to Home",
    libraryName: 'Thư viện Dương Liễu'
  },
  admin: {
    dashboard: "Dashboard",
    posts: "Posts",
    newPost: "New Post",
    editPost: "Edit Post",
    categories: "Categories",
    tags: "Tags",
    media: "Media",
    users: "Users",
    settings: "Settings",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    publish: "Publish",
    draft: "Draft",
    scheduled: "Scheduled",
    title: "Title",
    content: "Content",
    excerpt: "Excerpt",
    featuredImage: "Featured Image",
    videoEmbed: "Video Embed",
    seo: "SEO",
    metaTitle: "Meta Title",
    metaDescription: "Meta Description",
    keywords: "Keywords"
  }
};

// Library services configuration
export const LIBRARY_SERVICES = [
  { name: 'Đăng ký làm thẻ bạn đọc', href: '/services/card-registration', color: 'bg-blue-500' },
  { name: 'Đăng ký mượn phòng', href: '/services/room-booking', color: 'bg-green-500' },
  { name: 'Sách mới', href: '/services/new-books', color: 'bg-purple-500' }
];
export const LIBRARY_SERVICES_SUBMENU = [
  { text: 'Đăng ký làm thẻ bạn đọc', href: '/services/card-registration' },
  { text: 'Đăng ký mượn phòng', href: '/services/room-booking' },
  { text: 'Sách mới', href: '/services/new-books' },
  { text: 'Tra cứu tài liệu', href: '/services/search' },
];

// Navigation categories
export const CATEGORIES = [
  { name: 'Về thư viện', href: '/about', color: 'bg-blue-500' },  
  { name: 'Lịch hoạt động', href: '/events', color: 'bg-green-500' },
  { name: 'Dịch vụ thư viện', href: '/services', color: 'bg-purple-500' },
  { name: 'Tin tức', href: '/news', color: 'bg-red-500' },
  { name: 'Liên hệ', href: '/contact', color: 'bg-orange-500' }
];