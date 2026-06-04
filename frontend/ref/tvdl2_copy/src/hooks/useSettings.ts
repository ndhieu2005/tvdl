import { useState, useEffect } from 'react';

// Helper functions to convert between string and array formats
export const stringToArray = (str: string): string[] => {
  return str ? str.split(',').map(item => item.trim()) : [];
};

export const arrayToString = (arr: string[]): string => {
  return arr.join(',');
};

interface SettingsData {
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
  // Homepage settings
  homePageTitle: string;
  homePageSubtitle: string;
  
  // SEO Settings
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  googleAnalyticsId: string;
  googleAdsenseId: string;
  googleSearchConsole: string;
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
  
  // Content Settings
  postsPerPage: number;
  enableAutoSave: boolean;
  allowImageUpload: boolean;
  allowVideoUpload: boolean;
  maxImageSize: number;
  maxVideoSize: number;
  allowedImageTypes: string;
  allowedVideoTypes: string;
  
  // Theme Settings
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;
  enableCustomCSS: boolean;
  customCSS: string;
  
  // Logo Settings
  logo: string;
  favicon: string;
  
  // Email Settings
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  enableSsl: boolean;
  
  // API Settings
  enableApi: boolean;
  globalRateLimit: number;
  enableCors: boolean;
  corsOrigins: string;
  enableApiKeyManagement: boolean;
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const response = await fetch('/api/admin/settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi khi tải settings');
      }

      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
      } else {
        throw new Error(result.error || 'Lỗi không xác định');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SettingsData>) => {
    try {
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Lỗi khi cập nhật settings');
      }

      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
        return result;
      } else {
        throw new Error(result.error || 'Lỗi không xác định');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
}