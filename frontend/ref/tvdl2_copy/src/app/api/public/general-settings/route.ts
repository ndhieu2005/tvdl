import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOptimizedAssetsServer } from '@/lib/server-assets';

// GET: Lấy public general settings (không cần auth)
export async function GET(req: NextRequest) {
  try {
    console.log('⚙️ Public API - Getting general settings');

    // Test database connection first
    await prisma.$connect();
    console.log('✅ Database connection successful');

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
        
        // SEO Settings
        metaTitle: 'Thư viện Dương Liễu',
        metaDescription: 'Discover the latest TikTok trends, viral videos, and social media content. Stay updated with ViralPeek.',
        keywords: 'tiktok, viral, trends, social media, content, videos',
        ogImage: '/images/og-image.svg',
        googleAnalyticsId: 'G-KFD6SWYG83',
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
        
        // Theme Settings
        primaryColor: '#7c3aed',
        secondaryColor: '#06b6d4',
        darkMode: false,
        
        // Content Settings
        postsPerPage: 12,
        
        // Optimized assets (prioritize public directory)
        ...getOptimizedAssetsServer(null),
      };
      
      return NextResponse.json({
        success: true,
        data: defaultSettings
      });
    }
    
    // Remove sensitive fields and return public settings
    const publicSettings = {
      // General Settings
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      siteUrl: settings.siteUrl,
      adminEmail: settings.adminEmail,
      businessAddress: settings.businessAddress || 'Ho Chi Minh City, Vietnam',
      timezone: settings.timezone,
      language: settings.language,
      dateFormat: settings.dateFormat,
      enableRegistration: settings.enableRegistration,
      enableComments: settings.enableComments,
      enableNewsletters: settings.enableNewsletters,
      
      // SEO Settings
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
      keywords: settings.keywords,
      ogImage: settings.ogImage,
      googleAnalyticsId: settings.googleAnalyticsId,
      enableSitemap: settings.enableSitemap,
      enableRobots: settings.enableRobots,
      
      // Social Media Settings
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      tiktokUrl: settings.tiktokUrl,
      youtubeUrl: settings.youtubeUrl,
      twitterUrl: settings.twitterUrl,
      enableSocialLogin: settings.enableSocialLogin,
      enableSocialSharing: settings.enableSocialSharing,
      
      // Theme Settings
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      darkMode: settings.darkMode,
      
      // Content Settings
      postsPerPage: settings.postsPerPage,
      
      // Optimized assets (prioritize public directory)
      ...getOptimizedAssetsServer(settings),
      
      updatedAt: settings.updatedAt,
      createdAt: settings.createdAt
    };
    
    console.log('⚙️ Public API - General settings found');
    
    return NextResponse.json({
      success: true,
      data: publicSettings
    });

  } catch (error) {
    console.error('⚙️ Public API - Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      meta: (error as any)?.meta
    });
    
    // Return default settings as fallback instead of error
    const fallbackSettings = {
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
      metaTitle: 'Thư viện Dương Liễu',
      metaDescription: 'Discover the latest TikTok trends, viral videos, and social media content. Stay updated with ViralPeek.',
      keywords: 'tiktok, viral, trends, social media, content, videos',
      ogImage: '/images/og-image.svg',
      googleAnalyticsId: 'G-KFD6SWYG83',
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
      primaryColor: '#7c3aed',
      secondaryColor: '#06b6d4',
      darkMode: false,
      postsPerPage: 12,
      // Optimized assets (prioritize public directory)
      ...getOptimizedAssetsServer(null),
    };
    
    return NextResponse.json({
      success: true,
      data: fallbackSettings,
      fallback: true
    });
  }
}