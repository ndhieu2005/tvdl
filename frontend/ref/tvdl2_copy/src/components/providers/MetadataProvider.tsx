'use client';

import { usePublicSettings } from '@/hooks/usePublicSettings';
import { useEffect } from 'react';
import { forceFaviconRefresh } from '@/lib/favicon-utils';

interface MetadataProviderProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  pageKeywords?: string;
  pageImage?: string;
  pageUrl?: string;
  pageType?: 'website' | 'article' | 'profile';
}

export function MetadataProvider({ 
  children, 
  pageTitle,
  pageDescription,
  pageKeywords,
  pageImage,
  pageUrl,
  pageType = 'website'
}: MetadataProviderProps) {
  const { settings } = usePublicSettings();

  useEffect(() => {
    if (!settings) return;

    // Set document title
    const title = pageTitle ? `${pageTitle} - ${settings.siteName}` : settings.metaTitle;
    document.title = title;

    // Set or update meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) || 
                 document.querySelector(`meta[property="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Set description
    const description = pageDescription || settings.metaDescription;
    updateMetaTag('description', description);

    // Set keywords
    const keywords = pageKeywords || settings.keywords;
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:type', pageType);
    updateMetaTag('og:url', pageUrl || settings.siteUrl);
    updateMetaTag('og:site_name', settings.siteName);
    updateMetaTag('og:image', pageImage || settings.ogImage);
    updateMetaTag('og:locale', settings.language === 'vi' ? 'vi_VN' : 'en_US');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', pageImage || settings.ogImage);
    if (settings.twitterUrl) {
      updateMetaTag('twitter:site', settings.twitterUrl);
    }

    // Update favicon with cache busting
    if (settings.favicon) {
      forceFaviconRefresh(settings.favicon);
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = pageUrl || settings.siteUrl;

    // Update theme color
    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColor);
    }
    themeColor.setAttribute('content', settings.primaryColor);

    // Update CSS custom properties for theme
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
    
    // Apply dark mode class
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

  }, [settings, pageTitle, pageDescription, pageKeywords, pageImage, pageUrl, pageType]);

  return <>{children}</>;
}