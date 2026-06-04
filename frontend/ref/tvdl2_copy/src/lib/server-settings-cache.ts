/**
 * Server-side settings cache for preventing hydration mismatch
 */

import { unstable_cache } from 'next/cache';

interface PublicSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  businessAddress: string;
  timezone: string;
  language: string;
  dateFormat: string;
  enableRegistration: boolean;
  enableComments: boolean;
  enableNewsletters: boolean;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  googleAnalyticsId: string;
  enableSitemap: boolean;
  enableRobots: boolean;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
  enableSocialLogin: boolean;
  enableSocialSharing: boolean;
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;
  postsPerPage: number;
  logo: string;
  favicon: string;
  updatedAt?: string;
  createdAt?: string;
}

// Default fallback settings to prevent hydration mismatch
const DEFAULT_SETTINGS: PublicSettings = {
  siteName: 'Thư viện Dương Liễu',
  siteDescription: 'Thư viện Dương Liễu - Nơi chia sẻ kiến thức',
  siteUrl: 'https://thuvienduonglieu.com',
  adminEmail: 'admin@thuvienduonglieu.com',
  businessAddress: '',
  timezone: 'Asia/Ho_Chi_Minh',
  language: 'vi',
  dateFormat: 'DD/MM/YYYY',
  enableRegistration: true,
  enableComments: true,
  enableNewsletters: false,
  metaTitle: 'Thư viện Dương Liễu',
  metaDescription: 'Thư viện Dương Liễu - Nơi chia sẻ kiến thức',
  keywords: 'thư viện, sách, kiến thức',
  ogImage: '',
  googleAnalyticsId: '',
  enableSitemap: true,
  enableRobots: true,
  facebookUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
  youtubeUrl: '',
  twitterUrl: '',
  enableSocialLogin: false,
  enableSocialSharing: true,
  primaryColor: '#7c3aed',
  secondaryColor: '#a855f7',
  darkMode: false,
  postsPerPage: 12,
  logo: '',
  favicon: '/favicon.ico',
};

// Cache settings for 5 minutes
const getCachedSettings = unstable_cache(
  async (): Promise<PublicSettings> => {
    try {
      // In production, this would fetch from database
      // For now, we'll use environment variables and defaults
      const settings: PublicSettings = {
        ...DEFAULT_SETTINGS,
        siteName: process.env.NEXT_PUBLIC_SITE_NAME || DEFAULT_SETTINGS.siteName,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SETTINGS.siteUrl,
        logo: process.env.NEXT_PUBLIC_LOGO_URL || DEFAULT_SETTINGS.logo,
        favicon: process.env.NEXT_PUBLIC_FAVICON_URL || DEFAULT_SETTINGS.favicon,
      };

      return settings;
    } catch (error) {
      console.error('Error fetching server settings:', error);
      return DEFAULT_SETTINGS;
    }
  },
  ['public-settings'],
  {
    revalidate: 300, // 5 minutes
    tags: ['settings'],
  }
);

/**
 * Get settings for server-side rendering
 */
export async function getServerSettings(): Promise<PublicSettings> {
  return getCachedSettings();
}

/**
 * Get default settings (synchronous, for immediate use)
 */
export function getDefaultSettings(): PublicSettings {
  return DEFAULT_SETTINGS;
}

/**
 * Serialize settings for client-side hydration
 */
export function serializeSettings(settings: PublicSettings): string {
  return JSON.stringify(settings);
}

/**
 * Parse serialized settings
 */
export function parseSettings(serialized: string): PublicSettings {
  try {
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Error parsing settings:', error);
    return DEFAULT_SETTINGS;
  }
}