'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCachedData, setCacheData, isCacheValid, CACHE_KEYS, CACHE_DURATIONS } from '@/lib/cache';

interface SettingsContextType {
  homePageTitle: string;
  homePageSubtitle: string;
  siteName: string;
  siteDescription: string;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Default settings
const DEFAULT_SETTINGS = {
  homePageTitle: 'ViralPeek',
  homePageSubtitle: 'Your ultimate destination for TikTok trends and viral content',
  siteName: 'ViralPeek',
  siteDescription: 'Your ultimate destination for TikTok trends and viral content',
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Initialize with cached data if available, otherwise use defaults
  const [settings, setSettings] = useState<SettingsContextType>(() => {
    if (typeof window === 'undefined') {
      return {
        ...DEFAULT_SETTINGS,
        loading: true,
        error: null,
        refetch: () => {},
      };
    }

    const cachedSettings = getCachedData<typeof DEFAULT_SETTINGS>(
      CACHE_KEYS.SITE_SETTINGS, 
      CACHE_KEYS.SITE_SETTINGS_EXPIRY
    );
    
    if (cachedSettings) {
      return {
        ...cachedSettings,
        loading: false, // We have cached data, so not loading
        error: null,
        refetch: () => {},
      };
    }

    return {
      ...DEFAULT_SETTINGS,
      loading: true,
      error: null,
      refetch: () => {},
    };
  });

  const fetchSettings = async () => {
    try {
      // Set loading only if we don't have cached data
      if (settings.loading) {
        setSettings(prev => ({ ...prev, loading: true, error: null }));
      }

      const response = await fetch('/api/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const result = await response.json();
      if (result.success) {
        const newSettings = {
          homePageTitle: result.data.homePageTitle || DEFAULT_SETTINGS.homePageTitle,
          homePageSubtitle: result.data.homePageSubtitle || DEFAULT_SETTINGS.homePageSubtitle,
          siteName: result.data.siteName || DEFAULT_SETTINGS.siteName,
          siteDescription: result.data.siteDescription || DEFAULT_SETTINGS.siteDescription,
        };

        // Cache the settings
        setCacheData(
          CACHE_KEYS.SITE_SETTINGS,
          CACHE_KEYS.SITE_SETTINGS_EXPIRY,
          newSettings,
          CACHE_DURATIONS.SETTINGS
        );

        setSettings(prev => ({
          ...prev,
          ...newSettings,
          loading: false,
          error: null,
        }));
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setSettings(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  };

  useEffect(() => {
    // Only fetch if we don't have valid cached data or if currently loading
    const shouldFetch = settings.loading || !isCacheValid(CACHE_KEYS.SITE_SETTINGS_EXPIRY);

    if (shouldFetch) {
      fetchSettings();
    }
  }, []);

  const contextValue: SettingsContextType = {
    ...settings,
    refetch: fetchSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
}