'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCachedData, setCacheData, isCacheValid, CACHE_KEYS, CACHE_DURATIONS } from '@/lib/cache';

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

interface ServerSettingsContextType {
  settings: PublicSettings;
  loading: boolean;
  error: string | null;
  isHydrated: boolean;
  refetch: () => Promise<void>;
}

const ServerSettingsContext = createContext<ServerSettingsContextType | undefined>(undefined);

interface ServerSettingsProviderProps {
  children: ReactNode;
  initialSettings: PublicSettings;
}

export function ServerSettingsProvider({ children, initialSettings }: ServerSettingsProviderProps) {
  const [settings, setSettings] = useState<PublicSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
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
    // Mark as hydrated
    setIsHydrated(true);
    
    // Check for cached data after hydration
    if (typeof window !== 'undefined') {
      const cachedSettings = getCachedData<PublicSettings>(
        CACHE_KEYS.PUBLIC_SETTINGS,
        CACHE_KEYS.PUBLIC_SETTINGS_EXPIRY
      );
      
      if (cachedSettings && isCacheValid(CACHE_KEYS.PUBLIC_SETTINGS_EXPIRY)) {
        // Only update if cached settings are different from initial
        if (JSON.stringify(cachedSettings) !== JSON.stringify(initialSettings)) {
          setSettings(cachedSettings);
        }
        return;
      }
    }

    // Fetch fresh data if no valid cache and different from initial
    // Only fetch if we don't have recent data
    const shouldFetch = !initialSettings.updatedAt || 
      (Date.now() - new Date(initialSettings.updatedAt).getTime()) > CACHE_DURATIONS.PUBLIC_SETTINGS;
    
    if (shouldFetch) {
      fetchSettings();
    }
  }, []);

  return (
    <ServerSettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        isHydrated,
        refetch: fetchSettings,
      }}
    >
      {children}
    </ServerSettingsContext.Provider>
  );
}

export function useServerSettings() {
  const context = useContext(ServerSettingsContext);
  if (context === undefined) {
    throw new Error('useServerSettings must be used within a ServerSettingsProvider');
  }
  return context;
}