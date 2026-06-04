const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initSettings() {
  try {
    console.log('🔧 Initializing default settings...');

    // Check if settings already exist
    const existingSettings = await prisma.settings.findFirst();
    
    if (existingSettings) {
      console.log('⚠️ Settings already exist, skipping initialization');
      return;
    }

    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      console.log('🔍 Available users:');
      const allUsers = await prisma.user.findMany();
      console.log(allUsers);
      return;
    }

    // Create default settings
    const defaultSettings = await prisma.settings.create({
      data: {
        // General Settings
        siteName: 'ViralPeek',
        siteDescription: 'Your ultimate destination for TikTok trends and viral content',
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        adminEmail: adminUser.email,
        timezone: 'Asia/Ho_Chi_Minh',
        language: 'vi',
        dateFormat: 'dd/MM/yyyy',
        enableRegistration: true,
        enableComments: true,
        enableNewsletters: true,
        
        // SEO Settings
        metaTitle: 'ViralPeek - TikTok Trends & Viral Content',
        metaDescription: 'Discover the latest TikTok trends, viral videos, and social media content. Stay updated with ViralPeek.',
        keywords: 'tiktok, viral, trends, social media, content, videos',
        ogImage: '/images/og-image.svg',
        googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
        googleSearchConsole: '',
        enableSitemap: true,
        enableRobots: true,
        
        // Social Media Settings
        facebookUrl: '',
        instagramUrl: '',
        tiktokUrl: '',
        youtubeUrl: '',
        twitterUrl: '',
        enableSocialLogin: true,
        enableSocialSharing: true,
        
        // Content Settings
        postsPerPage: 12,
        enableAutoSave: true,
        allowImageUpload: true,
        allowVideoUpload: true,
        maxImageSize: 5,
        maxVideoSize: 100,
        allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        allowedVideoTypes: ['mp4', 'mov', 'avi', 'webm'],
        
        // Theme Settings
        primaryColor: '#7c3aed',
        secondaryColor: '#06b6d4',
        darkMode: false,
        enableCustomCSS: false,
        customCSS: '',
        
        // Email Settings
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        fromEmail: 'noreply@trendiefox.com',
        fromName: 'ViralPeek',
        enableSsl: true,
        
        // API Settings
        enableApi: true,
        globalRateLimit: 1000,
        enableCors: true,
        corsOrigins: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'],
        enableApiKeyManagement: true,
        
        updatedBy: adminUser.id
      }
    });

    console.log('✅ Default settings created successfully');
    console.log('📋 Settings ID:', defaultSettings.id);
    console.log('🌐 Site Name:', defaultSettings.siteName);
    console.log('📧 Admin Email:', defaultSettings.adminEmail);
    console.log('🔗 Site URL:', defaultSettings.siteUrl);

  } catch (error) {
    console.error('❌ Error initializing settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
initSettings();