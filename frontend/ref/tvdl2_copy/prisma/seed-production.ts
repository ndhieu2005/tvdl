import { PrismaClient, Role, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding production database (safe mode)...');

  // ⚠️ KHÔNG XÓA DỮ LIỆU PRODUCTION
  // Chỉ tạo/cập nhật categories và settings

  // Seed categories (sử dụng upsert để không mất dữ liệu)
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
    }
  ];

  console.log('\n🏷️ Seeding categories (safe mode)...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    console.log(`✅ Created/Updated category: ${category.name}`);
  }

  // Seed settings (sử dụng upsert để không mất dữ liệu)
  console.log('\n⚙️ Seeding settings (safe mode)...');
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
    homePageTitle: 'TrendieFox',
    homePageSubtitle: 'Your ultimate destination for TikTok trends and viral content',
    logo: '/images/logo.svg',
    favicon: '/favicon.ico',
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

  // Kiểm tra xem có admin user nào chưa
  const adminExists = await prisma.user.findFirst({
    where: { role: Role.ADMIN }
  });

  if (!adminExists) {
    console.log('\n🔑 No admin user found, creating default admin...');
    const defaultPassword = await bcrypt.hash('123456', 10);
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'System Admin',
        email: 'admin@thuvienduonglieu.com',
        password: defaultPassword,
        role: Role.ADMIN,
        status: Status.ACTIVE,
        location: 'System',
        bio: 'System Administrator',
        emailVerified: true,
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=7c3aed&color=fff'
      }
    });
    console.log(`✅ Created admin user: ${adminUser.email}`);
    console.log('🔑 Default admin password: 123456');
  } else {
    console.log(`✅ Admin user exists: ${adminExists.email}`);
  }

  // Thống kê cuối cùng
  const userCount = await prisma.user.count();
  const categoryCount = await prisma.category.count();
  const postCount = await prisma.post.count();
  
  console.log('\n📊 Database statistics:');
  console.log(`👥 Users: ${userCount}`);
  console.log(`🏷️ Categories: ${categoryCount}`);
  console.log(`📝 Posts: ${postCount}`);
  
  console.log('\n🎉 Production seed completed successfully (safe mode)!');
  console.log('✅ No existing data was deleted');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding production database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });