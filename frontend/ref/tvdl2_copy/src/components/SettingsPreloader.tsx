'use client';

import { useEffect } from 'react';
import { getCachedData, setCacheData, CACHE_KEYS, CACHE_DURATIONS } from '@/lib/cache';

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

interface SettingsPreloaderProps {
  initialSettings: PublicSettings;
}

/**
 * Component to preload settings into cache immediately
 * This prevents hydration mismatch by ensuring settings are available instantly
 */
export function SettingsPreloader({ initialSettings }: SettingsPreloaderProps) {
  useEffect(() => {
    // Immediately cache the initial settings
    setCacheData(
      CACHE_KEYS.PUBLIC_SETTINGS,
      CACHE_KEYS.PUBLIC_SETTINGS_EXPIRY,
      initialSettings,
      CACHE_DURATIONS.PUBLIC_SETTINGS
    );

    // Preload settings in the background if needed
    const preloadSettings = async () => {
      try {
        // Check if we need fresh data
        const shouldRefresh = !initialSettings.updatedAt || 
          (Date.now() - new Date(initialSettings.updatedAt).getTime()) > CACHE_DURATIONS.PUBLIC_SETTINGS;

        if (shouldRefresh) {
          const response = await fetch('/api/public/general-settings', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              // Update cache with fresh data
              setCacheData(
                CACHE_KEYS.PUBLIC_SETTINGS,
                CACHE_KEYS.PUBLIC_SETTINGS_EXPIRY,
                result.data,
                CACHE_DURATIONS.PUBLIC_SETTINGS
              );
            }
          }
        }
      } catch (error) {
        console.warn('Failed to preload settings:', error);
      }
    };

    // Preload after a short delay to not block initial render
    const timeoutId = setTimeout(preloadSettings, 100);

    return () => clearTimeout(timeoutId);
  }, [initialSettings]);

  return null; // This component doesn't render anything
}