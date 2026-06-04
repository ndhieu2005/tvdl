import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

// Default settings
const defaultSettings = {
  homePageTitle: 'ViralPeek',
  homePageSubtitle: 'Your ultimate destination for TikTok trends and viral content',
  siteName: 'ViralPeek',
  siteDescription: 'Your ultimate destination for TikTok trends and viral content',
  siteUrl: 'https://viralpeek.com',
  adminEmail: 'admin@trendiefox.com',
  timezone: 'Asia/Ho_Chi_Minh',
  language: 'vi',
  dateFormat: 'dd/MM/yyyy',
  enableRegistration: true,
  enableComments: true,
  enableNewsletters: true,
  
  // SEO Settings
  metaTitle: 'Thư viện Dương Liễu',
  metaDescription: 'Discover the latest TikTok trends, viral videos, and social media content. Stay updated with ViralPeek.',
  keywords: 'tiktok, viral, trends, social media, content, videos',
  ogImage: '/images/og-image.svg',
  googleAnalyticsId: 'GA_MEASUREMENT_ID',
  googleSearchConsole: 'SEARCH_CONSOLE_CODE',
  enableSitemap: true,
  enableRobots: true,
  
  // Social Media Settings
  facebookUrl: 'https://facebook.com/viralpeek',
  instagramUrl: 'https://instagram.com/viralpeek',
  tiktokUrl: 'https://tiktok.com/@viralpeek',
  youtubeUrl: 'https://youtube.com/@viralpeek',
  twitterUrl: 'https://twitter.com/viralpeek',
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
  logo: '/images/logo.svg',
  favicon: '/favicon.ico',
  
  // Email Settings
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: 'your-email@gmail.com',
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

export async function GET() {
  try {
    console.log('⚙️ Settings API - Getting settings');
    
    // Test database connection first
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Get settings from database
    const settings = await prisma.settings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        success: true,
        data: defaultSettings,
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('⚙️ Settings API - Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      meta: (error as any)?.meta
    });
    
    // Return default settings as fallback instead of error
    console.log('⚙️ Settings API - Returning default settings as fallback');
    return NextResponse.json({
      success: true,
      data: defaultSettings,
      fallback: true
    });
  }
}