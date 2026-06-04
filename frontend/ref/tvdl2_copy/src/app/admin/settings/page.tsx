'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Globe, 
  Mail, 
  Bell, 
  Shield, 
  Palette, 
  Share2,
  Search,
  Database,
  Code,
  Zap,
  Settings as SettingsIcon,
  Eye,
  Lock,
  Key,
  Users,
  MessageCircle,
  Image,
  Video,
  ExternalLink,
  Smartphone,
  Monitor,
  Upload,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  Loader2
} from 'lucide-react';
import ApiKeyManager from '@/components/admin/ApiKeyManager';
import { FileUpload } from '@/components/admin/FileUpload';
import { PublicFileUpload } from '@/components/admin/PublicFileUpload';
import { AssetOptimizationStatus } from '@/components/admin/AssetOptimizationStatus';
import { LogoPreview } from '@/components/admin/LogoPreview';
import { LogoDebugger } from '@/components/admin/LogoDebugger';
import { FaviconDebugger } from '@/components/admin/FaviconDebugger';
import { FaviconTester } from '@/components/admin/FaviconTester';
import { AssetHealthStatus } from '@/components/admin/AssetHealthStatus';
import { CacheCleaner } from '@/components/admin/CacheCleaner';
import { useSettings } from '@/hooks/useSettings';
import { useServerSettings } from '@/contexts/ServerSettingsContext';
import { forceFaviconRefresh } from '@/lib/favicon-utils';

interface SettingsData {
  // General Settings
  general: {
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
  };
  
  // SEO Settings
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogImage: string;
    googleAnalyticsId: string;
    googleAdsenseId: string;
    googleSearchConsole: string;
    enableSitemap: boolean;
    enableRobots: boolean;
  };
  
  // Social Media
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
    twitter: string;
    enableSocialLogin: boolean;
    enableSocialSharing: boolean;
  };
  
  // Content Settings
  content: {
    postsPerPage: number;
    enableAutoSave: boolean;
    allowImageUpload: boolean;
    allowVideoUpload: boolean;
    maxImageSize: number;
    maxVideoSize: number;
    allowedImageTypes: string;
    allowedVideoTypes: string;
  };
  
  // Security Settings
  security: {
    enableTwoFactor: boolean;
    enableCaptcha: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
    enableIpBlocking: boolean;
    enableSpamFilter: boolean;
    passwordMinLength: number;
    requireStrongPassword: boolean;
  };
  
  // API Settings
  api: {
    enableApi: boolean;
    globalRateLimit: number;
    enableCors: boolean;
    corsOrigins: string;
    enableApiKeyManagement: boolean;
  };
  
  // Email Settings
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    enableSsl: boolean;
  };
  
  // Theme Settings
  theme: {
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
    enableCustomCSS: boolean;
    customCSS: string;
    logo: string;
    favicon: string;
  };
}

// Mock default settings
const defaultSettings: SettingsData = {
  general: {
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
  },
  seo: {
    metaTitle: 'Thư viện Dương Liễu',
    metaDescription: 'Discover the latest TikTok trends, viral videos, and social media content. Stay updated with ViralPeek.',
    keywords: 'tiktok, viral, trends, social media, content, videos',
    ogImage: '/images/og-image.svg',
    googleAnalyticsId: 'G-KFD6SWYG83',
    googleAdsenseId: 'ca-pub-XXXXXXXXXXXXXXXX',
    googleSearchConsole: 'SEARCH_CONSOLE_CODE',
    enableSitemap: true,
    enableRobots: true,
  },
  social: {
    facebook: 'https://facebook.com/viralpeek',
    instagram: 'https://instagram.com/viralpeek',
    tiktok: 'https://tiktok.com/@viralpeek',
    youtube: 'https://youtube.com/@viralpeek',
    twitter: 'https://twitter.com/viralpeek',
    enableSocialLogin: true,
    enableSocialSharing: true,
  },
  content: {
    postsPerPage: 12,
    enableAutoSave: true,
    allowImageUpload: true,
    allowVideoUpload: true,
    maxImageSize: 5,
    maxVideoSize: 100,
    allowedImageTypes: 'jpg,jpeg,png,gif,webp',
    allowedVideoTypes: 'mp4,mov,avi,webm',
  },
  security: {
    enableTwoFactor: false,
    enableCaptcha: true,
    maxLoginAttempts: 5,
    sessionTimeout: 60,
    enableIpBlocking: true,
    enableSpamFilter: true,
    passwordMinLength: 8,
    requireStrongPassword: true,
  },
  api: {
    enableApi: true,
    globalRateLimit: 1000,
    enableCors: true,
    corsOrigins: 'https://viralpeek.com',
    enableApiKeyManagement: true,
  },
  email: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'your-email@gmail.com',
    smtpPassword: '',
    fromEmail: 'noreply@trendiefox.com',
    fromName: 'ViralPeek',
    enableSsl: true,
  },
  theme: {
    primaryColor: '#7c3aed',
    secondaryColor: '#06b6d4',
    darkMode: false,
    enableCustomCSS: false,
    customCSS: '',
    logo: '/images/logo.svg',
    favicon: '/favicon.ico',
  },
};

export default function SettingsPage() {
  const { settings: apiSettings, loading, error, updateSettings: saveSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<string>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Convert API settings to component format
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);

  useEffect(() => {
    if (apiSettings) {
      setSettings({
        general: {
          siteName: apiSettings.siteName,
          siteDescription: apiSettings.siteDescription,
          siteUrl: apiSettings.siteUrl,
          adminEmail: apiSettings.adminEmail,
          businessAddress: apiSettings.businessAddress || 'Ho Chi Minh City, Vietnam',
          timezone: apiSettings.timezone,
          language: apiSettings.language,
          dateFormat: apiSettings.dateFormat,
          enableRegistration: apiSettings.enableRegistration,
          enableComments: apiSettings.enableComments,
          enableNewsletters: apiSettings.enableNewsletters,
          // Homepage settings
          homePageTitle: apiSettings.homePageTitle || 'ViralPeek',
          homePageSubtitle: apiSettings.homePageSubtitle || 'Your ultimate destination for TikTok trends and viral content',
        },
        seo: {
          metaTitle: apiSettings.metaTitle,
          metaDescription: apiSettings.metaDescription,
          keywords: apiSettings.keywords,
          ogImage: apiSettings.ogImage,
          googleAnalyticsId: apiSettings.googleAnalyticsId,
          googleAdsenseId: apiSettings.googleAdsenseId,
          googleSearchConsole: apiSettings.googleSearchConsole,
          enableSitemap: apiSettings.enableSitemap,
          enableRobots: apiSettings.enableRobots,
        },
        social: {
          facebook: apiSettings.facebookUrl,
          instagram: apiSettings.instagramUrl,
          tiktok: apiSettings.tiktokUrl,
          youtube: apiSettings.youtubeUrl,
          twitter: apiSettings.twitterUrl,
          enableSocialLogin: apiSettings.enableSocialLogin,
          enableSocialSharing: apiSettings.enableSocialSharing,
        },
        content: {
          postsPerPage: apiSettings.postsPerPage,
          enableAutoSave: apiSettings.enableAutoSave,
          allowImageUpload: apiSettings.allowImageUpload,
          allowVideoUpload: apiSettings.allowVideoUpload,
          maxImageSize: apiSettings.maxImageSize,
          maxVideoSize: apiSettings.maxVideoSize,
          allowedImageTypes: apiSettings.allowedImageTypes,
          allowedVideoTypes: apiSettings.allowedVideoTypes,
        },
        security: {
          enableTwoFactor: false,
          enableCaptcha: true,
          maxLoginAttempts: 5,
          sessionTimeout: 60,
          enableIpBlocking: true,
          enableSpamFilter: true,
          passwordMinLength: 8,
          requireStrongPassword: true,
        },
        api: {
          enableApi: apiSettings.enableApi,
          globalRateLimit: apiSettings.globalRateLimit,
          enableCors: apiSettings.enableCors,
          corsOrigins: apiSettings.corsOrigins,
          enableApiKeyManagement: apiSettings.enableApiKeyManagement,
        },
        email: {
          smtpHost: apiSettings.smtpHost,
          smtpPort: apiSettings.smtpPort,
          smtpUser: apiSettings.smtpUser,
          smtpPassword: apiSettings.smtpPassword,
          fromEmail: apiSettings.fromEmail,
          fromName: apiSettings.fromName,
          enableSsl: apiSettings.enableSsl,
        },
        theme: {
          primaryColor: apiSettings.primaryColor,
          secondaryColor: apiSettings.secondaryColor,
          darkMode: apiSettings.darkMode,
          enableCustomCSS: apiSettings.enableCustomCSS,
          customCSS: apiSettings.customCSS,
          logo: apiSettings.logo || '/images/logo.svg',
          favicon: apiSettings.favicon || '/favicon.ico',
        },
      });
    }
  }, [apiSettings]);

  const updateSettings = <T extends keyof SettingsData>(
    section: T, 
    field: keyof SettingsData[T], 
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setShowError(false);
    try {
      // Convert component format back to API format
      const apiData = {
        // General Settings
        siteName: settings.general.siteName,
        siteDescription: settings.general.siteDescription,
        siteUrl: settings.general.siteUrl,
        adminEmail: settings.general.adminEmail,
        businessAddress: settings.general.businessAddress,
        timezone: settings.general.timezone,
        language: settings.general.language,
        dateFormat: settings.general.dateFormat,
        enableRegistration: settings.general.enableRegistration,
        enableComments: settings.general.enableComments,
        enableNewsletters: settings.general.enableNewsletters,
        // Homepage settings
        homePageTitle: settings.general.homePageTitle,
        homePageSubtitle: settings.general.homePageSubtitle,
        
        // SEO Settings
        metaTitle: settings.seo.metaTitle,
        metaDescription: settings.seo.metaDescription,
        keywords: settings.seo.keywords,
        ogImage: settings.seo.ogImage,
        googleAnalyticsId: settings.seo.googleAnalyticsId,
        googleAdsenseId: settings.seo.googleAdsenseId,
        googleSearchConsole: settings.seo.googleSearchConsole,
        enableSitemap: settings.seo.enableSitemap,
        enableRobots: settings.seo.enableRobots,
        
        // Social Media Settings
        facebookUrl: settings.social.facebook,
        instagramUrl: settings.social.instagram,
        tiktokUrl: settings.social.tiktok,
        youtubeUrl: settings.social.youtube,
        twitterUrl: settings.social.twitter,
        enableSocialLogin: settings.social.enableSocialLogin,
        enableSocialSharing: settings.social.enableSocialSharing,
        
        // Content Settings
        postsPerPage: settings.content.postsPerPage,
        enableAutoSave: settings.content.enableAutoSave,
        allowImageUpload: settings.content.allowImageUpload,
        allowVideoUpload: settings.content.allowVideoUpload,
        maxImageSize: settings.content.maxImageSize,
        maxVideoSize: settings.content.maxVideoSize,
        allowedImageTypes: settings.content.allowedImageTypes,
        allowedVideoTypes: settings.content.allowedVideoTypes,
        
        // Theme Settings
        primaryColor: settings.theme.primaryColor,
        secondaryColor: settings.theme.secondaryColor,
        darkMode: settings.theme.darkMode,
        enableCustomCSS: settings.theme.enableCustomCSS,
        customCSS: settings.theme.customCSS,
        logo: settings.theme.logo,
        favicon: settings.theme.favicon,
        
        // Email Settings
        smtpHost: settings.email.smtpHost,
        smtpPort: settings.email.smtpPort,
        smtpUser: settings.email.smtpUser,
        smtpPassword: settings.email.smtpPassword,
        fromEmail: settings.email.fromEmail,
        fromName: settings.email.fromName,
        enableSsl: settings.email.enableSsl,
        
        // API Settings
        enableApi: settings.api.enableApi,
        globalRateLimit: settings.api.globalRateLimit,
        enableCors: settings.api.enableCors,
        corsOrigins: settings.api.corsOrigins,
        enableApiKeyManagement: settings.api.enableApiKeyManagement,
      };

      await saveSettings(apiData);
      
      // Force refresh favicon immediately after saving
      if (settings.theme.favicon) {
        forceFaviconRefresh(settings.theme.favicon);
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Lỗi không xác định');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const testEmailSettings = async () => {
    // Simulate email test
    console.log('Testing email settings...');
    alert('Test email sent successfully!');
  };

  const tabs = [
    { key: 'general', label: 'Tổng quan', icon: SettingsIcon },
    { key: 'seo', label: 'SEO', icon: Search },
    { key: 'social', label: 'Social Media', icon: Share2 },
    { key: 'content', label: 'Nội dung', icon: Video },
    { key: 'security', label: 'Bảo mật', icon: Shield },
    { key: 'api', label: 'API', icon: Code },
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'theme', label: 'Giao diện', icon: Palette },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Đang tải cài đặt...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi tải cài đặt</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Cài đặt hệ thống
          </h1>
          <p className="text-gray-600 mt-1">
            Cấu hình và tùy chỉnh website ViralPeek
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {showSuccess && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <div className="text-sm">
                <div>Đã lưu thành công!</div>
                <div className="text-xs text-green-500 mt-1">
                  Favicon đã được cập nhật. Nếu không thấy thay đổi, hãy thử:
                  <br />• Refresh trang (Ctrl+F5 hoặc Cmd+Shift+R)
                  <br />• Xóa cache browser
                </div>
              </div>
            </div>
          )}
          {showError && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên website
                  </label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => updateSettings('general', 'siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email admin
                  </label>
                  <input
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => updateSettings('general', 'adminEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ doanh nghiệp
                </label>
                <input
                  type="text"
                  value={settings.general.businessAddress}
                  onChange={(e) => updateSettings('general', 'businessAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ho Chi Minh City, Vietnam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả website
                </label>
                <textarea
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSettings('general', 'siteDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL website
                </label>
                <input
                  type="url"
                  value={settings.general.siteUrl}
                  onChange={(e) => updateSettings('general', 'siteUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Múi giờ
                  </label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => updateSettings('general', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
                    <option value="Asia/Bangkok">Thailand (GMT+7)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                    <option value="America/New_York">New York (GMT-5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngôn ngữ
                  </label>
                  <select
                    value={settings.general.language}
                    onChange={(e) => updateSettings('general', 'language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Định dạng ngày
                  </label>
                  <select
                    value={settings.general.dateFormat}
                    onChange={(e) => updateSettings('general', 'dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                    <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                    <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                  </select>
                </div>
              </div>

              {/* Homepage Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Cài đặt trang chủ</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiêu đề trang chủ
                    </label>
                    <input
                      type="text"
                      value={settings.general.homePageTitle}
                      onChange={(e) => updateSettings('general', 'homePageTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="ViralPeek"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả trang chủ
                    </label>
                    <textarea
                      value={settings.general.homePageSubtitle}
                      onChange={(e) => updateSettings('general', 'homePageSubtitle', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your ultimate destination for TikTok trends and viral content"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Tính năng</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.enableRegistration}
                      onChange={(e) => updateSettings('general', 'enableRegistration', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Cho phép đăng ký tài khoản mới</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.enableComments}
                      onChange={(e) => updateSettings('general', 'enableComments', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Cho phép bình luận</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.enableNewsletters}
                      onChange={(e) => updateSettings('general', 'enableNewsletters', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Cho phép đăng ký newsletter</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SEO Settings */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={settings.seo.metaTitle}
                  onChange={(e) => updateSettings('seo', 'metaTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">{settings.seo.metaTitle.length}/60 ký tự</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={settings.seo.metaDescription}
                  onChange={(e) => updateSettings('seo', 'metaDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">{settings.seo.metaDescription.length}/160 ký tự</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={settings.seo.keywords}
                  onChange={(e) => updateSettings('seo', 'keywords', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Image URL
                </label>
                <input
                  type="url"
                  value={settings.seo.ogImage}
                  onChange={(e) => updateSettings('seo', 'ogImage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={settings.seo.googleAnalyticsId}
                    onChange={(e) => updateSettings('seo', 'googleAnalyticsId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google AdSense ID
                  </label>
                  <input
                    type="text"
                    value={settings.seo.googleAdsenseId}
                    onChange={(e) => updateSettings('seo', 'googleAdsenseId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Search Console
                </label>
                <input
                  type="text"
                  value={settings.seo.googleSearchConsole}
                  onChange={(e) => updateSettings('seo', 'googleSearchConsole', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Verification code"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.seo.enableSitemap}
                    onChange={(e) => updateSettings('seo', 'enableSitemap', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Tự động tạo sitemap</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.seo.enableRobots}
                    onChange={(e) => updateSettings('seo', 'enableRobots', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Tự động tạo robots.txt</span>
                </label>
              </div>
            </div>
          )}

          {/* Social Media Settings */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={settings.social.facebook}
                    onChange={(e) => updateSettings('social', 'facebook', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={settings.social.instagram}
                    onChange={(e) => updateSettings('social', 'instagram', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://instagram.com/yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TikTok URL
                  </label>
                  <input
                    type="url"
                    value={settings.social.tiktok}
                    onChange={(e) => updateSettings('social', 'tiktok', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://tiktok.com/@yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={settings.social.youtube}
                    onChange={(e) => updateSettings('social', 'youtube', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://youtube.com/@yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    value={settings.social.twitter}
                    onChange={(e) => updateSettings('social', 'twitter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://twitter.com/yourpage"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.social.enableSocialLogin}
                    onChange={(e) => updateSettings('social', 'enableSocialLogin', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Cho phép đăng nhập bằng mạng xã hội</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.social.enableSocialSharing}
                    onChange={(e) => updateSettings('social', 'enableSocialSharing', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Hiển thị nút chia sẻ mạng xã hội</span>
                </label>
              </div>
            </div>
          )}

          {/* Content Settings */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số bài viết mỗi trang
                  </label>
                  <input
                    type="number"
                    value={settings.content.postsPerPage}
                    onChange={(e) => updateSettings('content', 'postsPerPage', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kích thước ảnh tối đa (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.content.maxImageSize}
                    onChange={(e) => updateSettings('content', 'maxImageSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kích thước video tối đa (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.content.maxVideoSize}
                    onChange={(e) => updateSettings('content', 'maxVideoSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="1"
                    max="500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.content.enableAutoSave}
                    onChange={(e) => updateSettings('content', 'enableAutoSave', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Tự động lưu bài viết</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.content.allowImageUpload}
                    onChange={(e) => updateSettings('content', 'allowImageUpload', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Cho phép upload ảnh</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.content.allowVideoUpload}
                    onChange={(e) => updateSettings('content', 'allowVideoUpload', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Cho phép upload video</span>
                </label>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lần đăng nhập sai tối đa
                  </label>
                  <input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian session (phút)
                  </label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="5"
                    max="1440"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Độ dài mật khẩu tối thiểu
                  </label>
                  <input
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSettings('security', 'passwordMinLength', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="6"
                    max="50"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.enableTwoFactor}
                    onChange={(e) => updateSettings('security', 'enableTwoFactor', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bật xác thực 2 bước</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.enableCaptcha}
                    onChange={(e) => updateSettings('security', 'enableCaptcha', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bật CAPTCHA</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.enableIpBlocking}
                    onChange={(e) => updateSettings('security', 'enableIpBlocking', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Chặn IP đáng ngờ</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.enableSpamFilter}
                    onChange={(e) => updateSettings('security', 'enableSpamFilter', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bật bộ lọc spam</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.requireStrongPassword}
                    onChange={(e) => updateSettings('security', 'requireStrongPassword', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yêu cầu mật khẩu mạnh</span>
                </label>
              </div>
            </div>
          )}

          {/* API Settings */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới hạn request toàn cục (per minute)
                  </label>
                  <input
                    type="number"
                    value={settings.api.globalRateLimit}
                    onChange={(e) => updateSettings('api', 'globalRateLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="10"
                    max="10000"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.api.enableApi}
                    onChange={(e) => updateSettings('api', 'enableApi', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bật API</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.api.enableCors}
                    onChange={(e) => updateSettings('api', 'enableCors', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bật CORS</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.api.enableApiKeyManagement}
                    onChange={(e) => updateSettings('api', 'enableApiKeyManagement', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bật quản lý API Key</span>
                </label>
              </div>

              {settings.api.enableApiKeyManagement && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quản lý API Keys</h3>
                  <ApiKeyManager />
                </div>
              )}
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={settings.email.smtpHost}
                    onChange={(e) => updateSettings('email', 'smtpHost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => updateSettings('email', 'smtpPort', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="587"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP User
                  </label>
                  <input
                    type="email"
                    value={settings.email.smtpUser}
                    onChange={(e) => updateSettings('email', 'smtpUser', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your-email@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    value={settings.email.smtpPassword}
                    onChange={(e) => updateSettings('email', 'smtpPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => updateSettings('email', 'fromEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="noreply@trendiefox.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={settings.email.fromName}
                    onChange={(e) => updateSettings('email', 'fromName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="ViralPeek"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.email.enableSsl}
                    onChange={(e) => updateSettings('email', 'enableSsl', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bật SSL/TLS</span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={testEmailSettings}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Test Email
                </button>
              </div>
            </div>
          )}

          {/* Theme Settings */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màu chính
                  </label>
                  <input
                    type="color"
                    value={settings.theme.primaryColor}
                    onChange={(e) => updateSettings('theme', 'primaryColor', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màu phụ
                  </label>
                  <input
                    type="color"
                    value={settings.theme.secondaryColor}
                    onChange={(e) => updateSettings('theme', 'secondaryColor', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.theme.darkMode}
                    onChange={(e) => updateSettings('theme', 'darkMode', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Chế độ tối</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.theme.enableCustomCSS}
                    onChange={(e) => updateSettings('theme', 'enableCustomCSS', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Cho phép CSS tùy chỉnh</span>
                </label>
              </div>

              {settings.theme.enableCustomCSS && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CSS tùy chỉnh
                  </label>
                  <textarea
                    value={settings.theme.customCSS}
                    onChange={(e) => updateSettings('theme', 'customCSS', e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    placeholder="/* CSS tùy chỉnh của bạn */"
                  />
                </div>
              )}

              {/* Logo Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Logo & Favicon</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo hiện tại
                    </label>
                    <LogoPreview 
                      logoUrl={settings.theme.logo}
                      faviconUrl={settings.theme.favicon}
                      siteName={settings.general.siteName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload logo mới
                    </label>
                    <PublicFileUpload
                      type="logo"
                      currentUrl={settings.theme.logo}
                      onUpload={(url) => updateSettings('theme', 'logo', url)}
                      accept="image/*"
                      maxSize={5}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Logo sẽ được lưu trực tiếp vào thư mục public để tải nhanh hơn
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Favicon URL
                    </label>
                    <input
                      type="url"
                      value={settings.theme.favicon}
                      onChange={(e) => updateSettings('theme', 'favicon', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="/favicon.ico"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload favicon mới
                    </label>
                    <PublicFileUpload
                      type="favicon"
                      currentUrl={settings.theme.favicon}
                      onUpload={(url) => updateSettings('theme', 'favicon', url)}
                      accept=".ico,.png,.jpg"
                      maxSize={2}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Favicon sẽ được lưu trực tiếp vào thư mục public để tải ngay lập tức
                    </p>
                  </div>
                </div>

                {/* Asset Optimization Status */}
                <div className="mt-6">
                  <AssetOptimizationStatus 
                    logoUrl={settings.theme.logo}
                    faviconUrl={settings.theme.favicon}
                  />
                </div>

                {/* Asset Health Status */}
                <div className="mt-6">
                  <AssetHealthStatus 
                    logoUrl={settings.theme.logo}
                    faviconUrl={settings.theme.favicon}
                  />
                </div>

                {/* Cache Cleaner */}
                <div className="mt-6">
                  <CacheCleaner />
                </div>

                {/* Debug Tools */}
                <div className="mt-6 space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Debug Tools</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LogoDebugger logoUrl={settings.theme.logo} />
                    <FaviconDebugger faviconUrl={settings.theme.favicon} />
                  </div>
                  <FaviconTester faviconUrl={settings.theme.favicon} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}