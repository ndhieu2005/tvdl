import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { parseTagsToString } from '@/lib/tags-utils';

// Fetch settings for metadata generation directly from database
export async function getPublicSettings() {
  try {
    const settings = await prisma.settings.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (!settings) {
      // Return default settings if none exist
      return {
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
        
        // Logo Settings
        logo: '/images/logo.svg',
        favicon: '/favicon.ico',
      };
    }
    
    // Return public settings
    return {
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
      
      // Logo Settings
      logo: settings.logo || '/images/logo.svg',
      favicon: settings.favicon || '/favicon.ico',
      
      updatedAt: settings.updatedAt,
      createdAt: settings.createdAt
    };
  } catch (error) {
    console.error('Error fetching settings for metadata:', error);
    
    // Return fallback default settings on error
    return {
      siteName: 'ViralPeek',
      siteDescription: 'Your ultimate destination for TikTok trends and viral content',
      siteUrl: 'https://viralpeek.com',
      metaTitle: 'Thư viện Dương Liễu',
      metaDescription: 'Discover the latest TikTok trends, viral videos, and social media content. Stay updated with ViralPeek.',
      keywords: 'tiktok, viral, trends, social media, content, videos',
      ogImage: '/images/og-image.svg',
      logo: '/images/logo.svg',
      favicon: '/favicon.ico',
      primaryColor: '#7c3aed',
      secondaryColor: '#06b6d4',
      darkMode: false,
      postsPerPage: 12,
    };
  }
}

// Generate dynamic favicon icons from settings
export async function generateDynamicIcons() {
  const settings = await getPublicSettings();
  const favicon = settings?.favicon || '/favicon.ico';
  
  return {
    icon: [
      { url: favicon, sizes: '32x32', type: 'image/x-icon' },
      { url: favicon.replace(/\.(ico|png)$/, '-16x16.png'), sizes: '16x16', type: 'image/png' },
      { url: favicon.replace(/\.(ico|png)$/, '-32x32.png'), sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: favicon.replace(/\.(ico|png)$/, '-180x180.png'), sizes: '180x180', type: 'image/png' },
    ],
    shortcut: favicon,
  };
}

interface CategoryMetadataOptions {
  category: string;
  categoryTitle: string;
  categoryDescription: string;
  categoryKeywords: string;
  path: string;
}

// Generate dynamic metadata for category pages
export async function generateCategoryMetadata(options: CategoryMetadataOptions): Promise<Metadata> {
  const settings = await getPublicSettings();
  const dynamicIcons = await generateDynamicIcons();
  
  // Base SEO settings
  const baseTitle = settings?.siteName || 'ViralPeek';
  const baseKeywords = settings?.keywords || 'TikTok, viral, trending, entertainment, news, social media';
  const siteUrl = settings?.siteUrl || 'https://viralpeek.com';
  const ogImage = settings?.ogImage || '/images/og-image.svg';
  
  // Category-specific metadata
  const fullTitle = `${options.categoryTitle} - ${baseTitle}`;
  const fullKeywords = `${baseKeywords}, ${options.categoryKeywords}`;
  const fullUrl = `${siteUrl}${options.path}`;

  return {
    title: fullTitle,
    description: options.categoryDescription,
    keywords: fullKeywords,
    authors: [{ name: 'ViralPeek Team' }],
    
    // Dynamic Icons from settings
    icons: dynamicIcons,
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description: options.categoryDescription,
      url: fullUrl,
      siteName: baseTitle,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: options.categoryDescription,
      images: [ogImage],
    },
    
    // Additional meta tags
    other: {
      'og:locale': 'en_US',
      'article:section': options.category,
      'article:tag': options.categoryKeywords.replace(/,\s*/g, ', '),
    },
    
    // Canonical URL
    alternates: {
      canonical: fullUrl,
    },
  };
}

// Generate post metadata
export async function generatePostMetadata(post: any): Promise<Metadata> {
  const settings = await getPublicSettings();
  const dynamicIcons = await generateDynamicIcons();
  
  // Base SEO settings
  const baseTitle = settings?.siteName || 'ViralPeek';
  const siteUrl = settings?.siteUrl || 'https://viralpeek.com';
  const defaultOgImage = settings?.ogImage || '/images/og-image.svg';
  
  // Post-specific metadata
  const postTitle = `${post.title} - ${baseTitle}`;
  const postDescription = post.excerpt || post.content?.substring(0, 160) || 'Read the latest viral content on ViralPeek';
  const postUrl = `${siteUrl}/post/${post.slug}`;
  const postImage = post.featuredImage || defaultOgImage;
  const postKeywords = parseTagsToString(post.tags) || 'viral, trending, TikTok';

  return {
    title: postTitle,
    description: postDescription,
    keywords: postKeywords,
    authors: [{ name: post.author?.name || 'ViralPeek Team' }],
    
    // Dynamic Icons from settings
    icons: dynamicIcons,
    
    // Open Graph
    openGraph: {
      title: postTitle,
      description: postDescription,
      url: postUrl,
      siteName: baseTitle,
      type: 'article',
      images: [
        {
          url: postImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt || post.publishedAt || post.createdAt,
      authors: [post.author?.name || 'ViralPeek Team'],
      section: post.category || 'Entertainment',
      tags: post.tags || [],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: postTitle,
      description: postDescription,
      images: [postImage],
      creator: '@viralpeek',
    },
    
    // Additional meta tags
    other: {
      'og:locale': 'en_US',
      'article:section': post.category || 'Entertainment',
      'article:tag': postKeywords,
      'article:published_time': post.publishedAt || post.createdAt,
      'article:modified_time': post.updatedAt || post.publishedAt || post.createdAt,
      'article:author': post.author?.name || 'ViralPeek Team',
    },
    
    // Canonical URL
    alternates: {
      canonical: postUrl,
    },
  };
}