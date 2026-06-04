import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

// GET: Lấy tất cả settings
export const GET = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    console.log('⚙️ Admin API - Getting all settings');
    
    const user = req.user;
    console.log('⚙️ Admin API - User from request:', user);

    // Get settings from database
    const settings = await prisma.settings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        // General Settings
        siteName: 'ViralPeek',
        siteDescription: 'Your ultimate destination for TikTok trends and viral content',
        siteUrl: 'https://viralpeek.com',
        adminEmail: 'admin@trendiefox.com',
        businessAddress: 'Ho Chi Minh City, Vietnam',
        timezone: 'Asia/Ho_Chi_Minh',
        language: 'vi',
        dateFormat: 'dd/MM/yyyy',
        enableRegistration: true,
        enableComments: true,
        enableNewsletters: true,
        // Homepage settings
        homePageTitle: 'ViralPeek',
        homePageSubtitle: 'Your ultimate destination for TikTok trends and viral content',
        
        // SEO Settings
        metaTitle: 'Thư viện Dương Liễu',
        metaDescription: 'Discover the latest TikTok trends, viral videos, and social media content. Stay updated with ViralPeek.',
        keywords: 'tiktok, viral, trends, social media, content, videos',
        ogImage: '/images/og-image.svg',
        googleAnalyticsId: '',
        googleAdsenseId: '',
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
        allowedImageTypes: 'jpg,jpeg,png,gif,webp',
        allowedVideoTypes: 'mp4,mov,avi,webm',
        
        // Theme Settings
        primaryColor: '#7c3aed',
        secondaryColor: '#06b6d4',
        darkMode: false,
        enableCustomCSS: false,
        customCSS: '',
        
        // Logo Settings
        logo: '/images/logo.svg',
        favicon: '/favicon.ico',
        
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
        corsOrigins: 'https://viralpeek.com',
        enableApiKeyManagement: true,
      };

      return NextResponse.json({
        success: true,
        data: defaultSettings,
        message: 'Sử dụng cài đặt mặc định'
      });
    }

    console.log('⚙️ Admin API - Settings found');
    
    return NextResponse.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('⚙️ Admin API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy settings' },
      { status: 500 }
    );
  }
});

// PUT: Cập nhật settings
export const PUT = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    console.log('⚙️ Admin API - Updating settings');
    
    const user = req.user;
    console.log('⚙️ Admin API - User from request:', user);

    const body = await req.json();
    console.log('⚙️ Admin API - Updating settings with data:', body);

    // Get current settings
    const currentSettings = await prisma.settings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const settingsData = {
      // General Settings
      siteName: body.siteName || 'ViralPeek',
      siteDescription: body.siteDescription || 'Your ultimate destination for TikTok trends and viral content',
      siteUrl: body.siteUrl || 'https://viralpeek.com',
      adminEmail: body.adminEmail || 'admin@trendiefox.com',
      businessAddress: body.businessAddress || 'Ho Chi Minh City, Vietnam',
      timezone: body.timezone || 'Asia/Ho_Chi_Minh',
      language: body.language || 'vi',
      dateFormat: body.dateFormat || 'dd/MM/yyyy',
      enableRegistration: body.enableRegistration !== undefined ? body.enableRegistration : true,
      enableComments: body.enableComments !== undefined ? body.enableComments : true,
      enableNewsletters: body.enableNewsletters !== undefined ? body.enableNewsletters : true,
      // Homepage settings
      homePageTitle: body.homePageTitle || 'ViralPeek',
      homePageSubtitle: body.homePageSubtitle || 'Your ultimate destination for TikTok trends and viral content',
      
      // SEO Settings
      metaTitle: body.metaTitle || 'Thư viện Dương Liễu',
      metaDescription: body.metaDescription || 'Discover the latest TikTok trends, viral videos, and social media content. Stay updated with ViralPeek.',
      keywords: body.keywords || 'tiktok, viral, trends, social media, content, videos',
      ogImage: body.ogImage || '/images/og-image.svg',
      googleAnalyticsId: body.googleAnalyticsId || '',
      googleSearchConsole: body.googleSearchConsole || '',
      enableSitemap: body.enableSitemap !== undefined ? body.enableSitemap : true,
      enableRobots: body.enableRobots !== undefined ? body.enableRobots : true,
      
      // Social Media Settings
      facebookUrl: body.facebookUrl || '',
      instagramUrl: body.instagramUrl || '',
      tiktokUrl: body.tiktokUrl || '',
      youtubeUrl: body.youtubeUrl || '',
      twitterUrl: body.twitterUrl || '',
      enableSocialLogin: body.enableSocialLogin !== undefined ? body.enableSocialLogin : true,
      enableSocialSharing: body.enableSocialSharing !== undefined ? body.enableSocialSharing : true,
      
      // Content Settings
      postsPerPage: body.postsPerPage || 12,
      enableAutoSave: body.enableAutoSave !== undefined ? body.enableAutoSave : true,
      allowImageUpload: body.allowImageUpload !== undefined ? body.allowImageUpload : true,
      allowVideoUpload: body.allowVideoUpload !== undefined ? body.allowVideoUpload : true,
      maxImageSize: body.maxImageSize || 5,
      maxVideoSize: body.maxVideoSize || 100,
      allowedImageTypes: Array.isArray(body.allowedImageTypes) 
        ? body.allowedImageTypes.join(',') 
        : body.allowedImageTypes || 'jpg,jpeg,png,gif,webp',
      allowedVideoTypes: Array.isArray(body.allowedVideoTypes) 
        ? body.allowedVideoTypes.join(',') 
        : body.allowedVideoTypes || 'mp4,mov,avi,webm',
      
      // Theme Settings
      primaryColor: body.primaryColor || '#7c3aed',
      secondaryColor: body.secondaryColor || '#06b6d4',
      darkMode: body.darkMode !== undefined ? body.darkMode : false,
      enableCustomCSS: body.enableCustomCSS !== undefined ? body.enableCustomCSS : false,
      customCSS: body.customCSS || '',
      
      // Logo Settings
      logo: body.logo || '/images/logo.svg',
      favicon: body.favicon || '/favicon.ico',
      
      // Email Settings
      smtpHost: body.smtpHost || 'smtp.gmail.com',
      smtpPort: body.smtpPort || 587,
      smtpUser: body.smtpUser || '',
      smtpPassword: body.smtpPassword || '',
      fromEmail: body.fromEmail || 'noreply@trendiefox.com',
      fromName: body.fromName || 'ViralPeek',
      enableSsl: body.enableSsl !== undefined ? body.enableSsl : true,
      
      // API Settings
      enableApi: body.enableApi !== undefined ? body.enableApi : true,
      globalRateLimit: body.globalRateLimit || 1000,
      enableCors: body.enableCors !== undefined ? body.enableCors : true,
      corsOrigins: Array.isArray(body.corsOrigins) 
        ? body.corsOrigins.join(',') 
        : body.corsOrigins || 'https://viralpeek.com',
      enableApiKeyManagement: body.enableApiKeyManagement !== undefined ? body.enableApiKeyManagement : true,
      
      updatedBy: user!.userId
    };

    let updatedSettings;
    
    if (currentSettings) {
      // Update existing settings
      updatedSettings = await prisma.settings.update({
        where: { id: currentSettings.id },
        data: settingsData
      });
    } else {
      // Create new settings
      updatedSettings = await prisma.settings.create({
        data: settingsData
      });
    }
    
    console.log('⚙️ Admin API - Settings updated successfully');
    
    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Cài đặt đã được lưu thành công'
    });

  } catch (error) {
    console.error('⚙️ Admin API - Update Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật settings' },
      { status: 500 }
    );
  }
});