#!/usr/bin/env node

/**
 * SCRIPT KHÔI PHỤC PRODUCTION AN TOÀN
 * 
 * Script này giúp khôi phục dữ liệu production bị mất
 * chỉ tạo lại admin user và settings cần thiết
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚨 KHÔI PHỤC PRODUCTION DATABASE');
  console.log('⚠️  Chỉ tạo lại admin user và settings cần thiết');
  console.log('✅ Không xóa dữ liệu hiện có');
  
  try {
    // Kiểm tra database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Kiểm tra có admin user nào không
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });
    
    console.log(`📊 Current admin users: ${adminCount}`);
    
    if (adminCount === 0) {
      console.log('🔑 No admin users found. Creating emergency admin...');
      
      const adminPassword = await bcrypt.hash('Admin123!@#', 10);
      
      const adminUser = await prisma.user.create({
        data: {
          name: 'Emergency Admin',
          email: 'admin@trendiefox.com',
          password: adminPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
          location: 'System Recovery',
          bio: 'Emergency admin created by recovery script',
          emailVerified: true,
          avatar: 'https://ui-avatars.com/api/?name=Emergency+Admin&background=dc2626&color=fff',
          posts: 0,
          likes: 0,
          comments: 0
        }
      });
      
      console.log('✅ Emergency admin created:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Password: Admin123!@#`);
      console.log('🔒 PLEASE CHANGE PASSWORD IMMEDIATELY!');
    } else {
      console.log('✅ Admin users exist, skipping admin creation');
    }
    
    // Kiểm tra settings
    const settings = await prisma.settings.findFirst();
    if (!settings) {
      console.log('⚙️ No settings found. Creating default settings...');
      
      await prisma.settings.create({
        data: {
          id: 'default',
          siteName: 'TrendieFox',
          siteDescription: 'Your ultimate destination for TikTok trends and viral content',
          siteUrl: 'https://trendiefox.com',
          adminEmail: 'admin@trendiefox.com',
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
          enableSitemap: true,
          enableRobots: true,
          enableSocialLogin: true,
          enableSocialSharing: true,
          postsPerPage: 12,
          enableAutoSave: true,
          allowImageUpload: true,
          allowVideoUpload: true,
          maxImageSize: 5,
          maxVideoSize: 100,
          allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          allowedVideoTypes: ['mp4', 'mov', 'avi', 'webm'],
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
          corsOrigins: ['https://trendiefox.com'],
          enableApiKeyManagement: true,
          updatedBy: 'recovery-script',
          updatedAt: new Date(),
        }
      });
      
      console.log('✅ Default settings created');
    } else {
      console.log('✅ Settings exist, skipping settings creation');
    }
    
    // Tạo categories cơ bản nếu chưa có
    const categoryCount = await prisma.category.count();
    console.log(`📊 Current categories: ${categoryCount}`);
    
    if (categoryCount === 0) {
      console.log('🏷️ Creating basic categories...');
      
      const categories = [
        { name: 'Trending Now', slug: 'trending-now', description: 'Xu hướng hot nhất', color: '#8B5CF6', featured: true, sortOrder: 1 },
        { name: 'Sounds', slug: 'sounds', description: 'Âm thanh trending', color: '#EF4444', featured: true, sortOrder: 2 },
        { name: 'Challenges', slug: 'challenges', description: 'Thử thách viral', color: '#F59E0B', featured: true, sortOrder: 3 },
        { name: 'Celebrities', slug: 'celebrities', description: 'Tin tức nghệ sĩ', color: '#10B981', featured: true, sortOrder: 4 },
      ];
      
      for (const category of categories) {
        await prisma.category.create({ data: category });
        console.log(`✅ Created category: ${category.name}`);
      }
    } else {
      console.log('✅ Categories exist, skipping category creation');
    }
    
    // Thống kê cuối cùng
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    const finalCategoryCount = await prisma.category.count();
    
    console.log('\n📊 RECOVERY COMPLETED - DATABASE STATUS:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`📝 Posts: ${postCount}`);
    console.log(`🏷️ Categories: ${finalCategoryCount}`);
    console.log(`⚙️ Settings: ${settings ? 'Exists' : 'Created'}`);
    
    console.log('\n🎉 Recovery completed successfully!');
    
    if (adminCount === 0) {
      console.log('\n🔐 IMPORTANT: New admin created with temporary password');
      console.log('   Email: admin@trendiefox.com');
      console.log('   Password: Admin123!@#');
      console.log('   🚨 CHANGE PASSWORD IMMEDIATELY!');
    }
    
  } catch (error) {
    console.error('❌ Recovery failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();