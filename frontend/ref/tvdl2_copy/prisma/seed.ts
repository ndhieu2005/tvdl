import { PrismaClient, Role, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // ⚠️ CẢNH BÁO: File này chỉ dùng cho DEVELOPMENT
  // Kiểm tra môi trường trước khi xóa dữ liệu
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ KHÔNG THỂ CHẠY SEED NÀY TRONG PRODUCTION!');
    console.error('❌ Sử dụng: npx tsx prisma/seed-production.ts');
    process.exit(1);
  }

  console.log('🔄 Development mode: Xóa dữ liệu cũ...');
  // Xóa tất cả dữ liệu cũ (chỉ trong development)
  await prisma.user.deleteMany();

  // Hash password cho tất cả users
  const defaultPassword = await bcrypt.hash('123456', 10);

  // Tạo users mẫu
  const users = [
    {
      name: 'Nguyễn Văn Admin',
      email: 'admin@thuvienduonglieu.com',
      password: defaultPassword,
      role: Role.ADMIN,
      status: Status.ACTIVE,
      location: 'Hà Nội, Việt Nam',
      bio: 'Quản trị viên hệ thống ViralPeek',
      emailVerified: true,
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=7c3aed&color=fff',
      posts: 25,
      likes: 150,
      comments: 45
    },
    {
      name: 'Trần Thị Editor',
      email: 'editor@trendiefox.com',
      password: defaultPassword,
      role: Role.EDITOR,
      status: Status.ACTIVE,
      location: 'TP.HCM, Việt Nam',
      bio: 'Biên tập viên nội dung trending',
      emailVerified: true,
      avatar: 'https://ui-avatars.com/api/?name=Editor&background=2563eb&color=fff',
      posts: 18,
      likes: 92,
      comments: 28
    },
    {
      name: 'Lê Văn User',
      email: 'user@trendiefox.com',
      password: defaultPassword,
      role: Role.USER,
      status: Status.ACTIVE,
      location: 'Đà Nẵng, Việt Nam',
      bio: 'Người dùng thường xuyên theo dõi TikTok trends',
      emailVerified: false,
      avatar: 'https://ui-avatars.com/api/?name=User&background=6b7280&color=fff',
      posts: 5,
      likes: 23,
      comments: 12
    },
    {
      name: 'Hoàng Minh Content Creator',
      email: 'creator@trendiefox.com',
      password: defaultPassword,
      role: Role.EDITOR,
      status: Status.ACTIVE,
      location: 'Cần Thơ, Việt Nam',
      bio: 'Content creator chuyên về viral content',
      emailVerified: true,
      avatar: 'https://ui-avatars.com/api/?name=Creator&background=10b981&color=fff',
      posts: 32,
      likes: 245,
      comments: 67
    },
    {
      name: 'Phạm Thu Analyst',
      email: 'analyst@trendiefox.com',
      password: defaultPassword,
      role: Role.USER,
      status: Status.PENDING,
      location: 'Hải Phòng, Việt Nam',
      bio: 'Data analyst quan tâm đến social media trends',
      emailVerified: false,
      avatar: 'https://ui-avatars.com/api/?name=Analyst&background=f59e0b&color=fff',
      posts: 8,
      likes: 34,
      comments: 15
    }
  ];

  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData
    });
    console.log(`✅ Created user: ${user.name} (${user.email})`);
  }

  // Seed categories
  const categories = [
    {
      name: 'Trending Now',
      slug: 'trending-now',
      description: 'Những xu hướng hot nhất hiện tại trên TikTok',
      color: '#8B5CF6',
      metaTitle: 'Trending Now - Xu hướng TikTok mới nhất',
      metaDescription: 'Khám phá những xu hướng TikTok hot nhất, viral content và những điều đang được quan tâm nhất hiện tại.',
      featured: true,
      sortOrder: 1
    },
    {
      name: 'Sounds',
      slug: 'sounds',
      description: 'Âm thanh và nhạc nền trending',
      color: '#EF4444',
      metaTitle: 'Sounds - Âm thanh TikTok hot',
      metaDescription: 'Tổng hợp những âm thanh, nhạc nền TikTok đang trending và được yêu thích nhất.',
      featured: true,
      sortOrder: 2
    },
    {
      name: 'Challenges',
      slug: 'challenges',
      description: 'Các thử thách viral trên TikTok',
      color: '#F59E0B',
      metaTitle: 'Challenges - Thử thách TikTok',
      metaDescription: 'Các thử thách viral TikTok mới nhất, hướng dẫn tham gia và xu hướng challenge hot.',
      featured: true,
      sortOrder: 3
    },
    {
      name: 'Celebrities',
      slug: 'celebrities',
      description: 'Tin tức về các nghệ sĩ và người nổi tiếng',
      color: '#10B981',
      metaTitle: 'Celebrities - Tin tức nghệ sĩ',
      metaDescription: 'Cập nhật tin tức mới nhất về các nghệ sĩ, người nổi tiếng và những drama hot trên TikTok.',
      featured: true,
      sortOrder: 4
    },
    {
      name: 'Top Lists',
      slug: 'top-lists',
      description: 'Danh sách top trending',
      color: '#EC4899',
      metaTitle: 'Top Lists - Top trending TikTok',
      metaDescription: 'Danh sách top trending TikTok, những video viral nhất và các bảng xếp hạng hot.',
      featured: true,
      sortOrder: 5
    },
    {
      name: 'Filters',
      slug: 'filters',
      description: 'Filters và effects hot',
      color: '#3B82F6',
      metaTitle: 'Filters - Filter TikTok hot',
      metaDescription: 'Tổng hợp filter TikTok mới nhất, effects hot và hướng dẫn sử dụng.',
      featured: false,
      sortOrder: 6
    },
    {
      name: 'Social Media',
      slug: 'social-media',
      description: 'Tin tức về các nền tảng mạng xã hội',
      color: '#6366F1',
      metaTitle: 'Social Media - Tin tức mạng xã hội',
      metaDescription: 'Cập nhật tin tức mới nhất về các nền tảng mạng xã hội, tính năng mới và xu hướng.',
      featured: false,
      sortOrder: 7
    },
    {
      name: 'Guidelines',
      slug: 'guidelines',
      description: 'Hướng dẫn và tips',
      color: '#84CC16',
      metaTitle: 'Guidelines - Hướng dẫn TikTok',
      metaDescription: 'Hướng dẫn sử dụng TikTok, tips tạo content viral và các chiến lược phát triển tài khoản.',
      featured: false,
      sortOrder: 8
    },
    {
      name: 'Sport',
      slug: 'sport',
      description: 'Thể thao và hoạt động thể chất viral',
      color: '#F97316',
      metaTitle: 'Sport - Thể thao viral TikTok',
      metaDescription: 'Cập nhật những xu hướng thể thao, video thể chất viral và các thử thách thể thao hot trên TikTok.',
      featured: true,
      sortOrder: 9
    }
  ];

  console.log('\n🏷️ Seeding categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    console.log(`✅ Created/Updated category: ${category.name}`);
  }

  // Seed settings
  console.log('\n⚙️ Seeding settings...');
  const settingsData = {
    id: 'default',
    siteName: 'TrendieFox',
    siteDescription: 'Your ultimate destination for TikTok trends and viral content',
    siteUrl: 'https://trendiefox.com',
    adminEmail: 'admin@thuvienduonglieu.com',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    dateFormat: 'dd/MM/yyyy',
    enableRegistration: true,
    enableComments: true,
    enableNewsletters: true,
    metaTitle: 'TrendieFox - TikTok Trends & Viral Content',
    metaDescription: 'Discover the latest TikTok trends, viral videos, and social media content. Stay updated with TrendieFox.',
    keywords: 'tiktok, viral, trends, social media, content, videos, trendiefox',
    ogImage: '/images/og-image.svg',
    googleAnalyticsId: 'G-FZ2C5JF3HN',
    googleSearchConsole: '',
    enableSitemap: true,
    enableRobots: true,
    facebookUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    youtubeUrl: '',
    twitterUrl: '',
    enableSocialLogin: true,
    enableSocialSharing: true,
    postsPerPage: 12,
    enableAutoSave: true,
    allowImageUpload: true,
    allowVideoUpload: true,
    maxImageSize: 5,
    maxVideoSize: 100,
    allowedImageTypes: 'jpg,jpeg,png,gif,webp',
    allowedVideoTypes: 'mp4,mov,avi,webm',
    primaryColor: '#7c3aed',
    secondaryColor: '#06b6d4',
    darkMode: false,
    enableCustomCSS: false,
    customCSS: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@trendiefox.com',
    fromName: 'TrendieFox',
    enableSsl: true,
    enableApi: true,
    globalRateLimit: 1000,
    enableCors: true,
    corsOrigins: 'https://trendiefox.com',
    enableApiKeyManagement: true,
    updatedBy: 'system',
    updatedAt: new Date(),
  };

  await prisma.settings.upsert({
    where: { id: 'default' },
    update: settingsData,
    create: settingsData,
  });
  console.log('✅ Created/Updated settings');

  console.log('\n🔑 Default password for all users: 123456');
  console.log('\n📧 Available test accounts:');
  console.log('- admin@thuvienduonglieu.com (ADMIN)');
  console.log('- editor@trendiefox.com (EDITOR)');
  console.log('- creator@trendiefox.com (EDITOR)');
  console.log('- user@trendiefox.com (USER)');
  console.log('- analyst@trendiefox.com (USER)');
  
  console.log('\n🎉 Seeded database successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });