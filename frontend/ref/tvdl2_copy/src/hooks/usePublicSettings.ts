import { useState, useEffect } from 'react';
import { getCachedData, setCacheData, isCacheValid, CACHE_KEYS, CACHE_DURATIONS } from '@/lib/cache';

interface PublicSettings {
  // General Settings
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
  
  // SEO Settings
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  googleAnalyticsId: string;
  enableSitemap: boolean;
  enableRobots: boolean;
  
  // Social Media Settings
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
  enableSocialLogin: boolean;
  enableSocialSharing: boolean;
  
  // Theme Settings
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;
  
  // Content Settings
  postsPerPage: number;
  
  // Logo Settings
  logo: string;
  favicon: string;
  
  // Timestamps
  updatedAt?: string;
  createdAt?: string;
}

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      // Only set loading to true if we don't have cached data
      if (!settings) {
        setLoading(true);
      }
      setError(null);

      const response = await fetch('/api/public/general-settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi khi tải settings');
      }

      const result = await response.json();
      if (result.success) {
        // Cache the settings
        setCacheData(
          CACHE_KEYS.PUBLIC_SETTINGS,
          CACHE_KEYS.PUBLIC_SETTINGS_EXPIRY,
          result.data,
          CACHE_DURATIONS.PUBLIC_SETTINGS
        );
        
        setSettings(result.data);
      } else {
        throw new Error(result.error || 'Lỗi không xác định');
      }
    } catch (err) {
      console.error('Error fetching public settings:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Mark as hydrated and check for cached data
    setIsHydrated(true);
    
    // Check for cached data after hydration
    if (typeof window !== 'undefined') {
      const cachedSettings = getCachedData<PublicSettings>(
        CACHE_KEYS.PUBLIC_SETTINGS,
        CACHE_KEYS.PUBLIC_SETTINGS_EXPIRY
      );
      
      if (cachedSettings && isCacheValid(CACHE_KEYS.PUBLIC_SETTINGS_EXPIRY)) {
        setSettings(cachedSettings);
        setLoading(false);
        return;
      }
    }

    // Fetch fresh data if no valid cache
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    isHydrated,
  };
}