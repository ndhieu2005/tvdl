/**
 * Favicon management utilities
 */

export interface FaviconOptions {
  href: string;
  rel?: string;
  type?: string;
  sizes?: string;
}

/**
 * Force refresh favicon with cache busting
 */
export const forceFaviconRefresh = (faviconUrl: string): void => {
  // Remove existing favicon links
  const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
  existingFavicons.forEach(link => link.remove());
  
  // Add cache-busting parameter
  const cacheBusterParam = `?v=${Date.now()}`;
  const refreshedFaviconUrl = faviconUrl + cacheBusterParam;
  
  // Create new favicon links with different formats and sizes
  const faviconVariants: FaviconOptions[] = [
    { href: refreshedFaviconUrl, rel: 'icon', type: 'image/x-icon' },
    { href: refreshedFaviconUrl, rel: 'shortcut icon', type: 'image/x-icon' },
    { href: refreshedFaviconUrl, rel: 'icon', type: 'image/png', sizes: '16x16' },
    { href: refreshedFaviconUrl, rel: 'icon', type: 'image/png', sizes: '32x32' },
    { href: refreshedFaviconUrl, rel: 'apple-touch-icon', sizes: '180x180' },
  ];
  
  faviconVariants.forEach(({ href, rel, type, sizes }) => {
    const link = document.createElement('link');
    link.rel = rel || 'icon';
    if (type) link.type = type;
    if (sizes) link.setAttribute('sizes', sizes);
    link.href = href;
    document.head.appendChild(link);
  });
};

/**
 * Update favicon with cache busting and fallback
 */
export const updateFaviconWithCacheBust = (faviconUrl: string): void => {
  if (!faviconUrl) return;
  
  // Check if favicon URL already has query params
  const separator = faviconUrl.includes('?') ? '&' : '?';
  const cacheBusterParam = `${separator}v=${Date.now()}`;
  const refreshedFaviconUrl = faviconUrl + cacheBusterParam;
  
  // Update existing favicon or create new one
  let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }
  
  favicon.href = refreshedFaviconUrl;
  
  // Also update shortcut icon if exists
  const shortcutIcon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement;
  if (shortcutIcon) {
    shortcutIcon.href = refreshedFaviconUrl;
  }
};

/**
 * Get current favicon URL
 */
export const getCurrentFaviconUrl = (): string | null => {
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  return favicon ? favicon.href : null;
};

/**
 * Check if favicon exists and is loadable
 */
export const checkFaviconExists = (faviconUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = faviconUrl;
  });
};

/**
 * Clear browser favicon cache using multiple methods
 */
export const clearFaviconCache = (): void => {
  // Method 1: Remove and re-add favicon
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (favicon) {
    const href = favicon.href;
    favicon.remove();
    
    setTimeout(() => {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = href + `?v=${Date.now()}`;
      document.head.appendChild(newFavicon);
    }, 100);
  }
};

/**
 * Complete favicon reset - removes all favicon links and forces fresh load
 */
export const completeFaviconReset = async (): Promise<void> => {
  // Remove all favicon-related links
  const allFaviconLinks = document.querySelectorAll('link[rel*="icon"]');
  allFaviconLinks.forEach(link => link.remove());
  
  // Get latest favicon from API
  try {
    const response = await fetch('/api/public/general-settings');
    if (response.ok) {
      const data = await response.json();
      const faviconUrl = data.favicon || '/favicon.ico';
      
      // Force refresh with new favicon
      forceFaviconRefresh(faviconUrl);
    }
  } catch (error) {
    console.error('Failed to fetch favicon from API:', error);
    // Fallback to default
    forceFaviconRefresh('/favicon.ico');
  }
};

/**
 * Debug favicon state
 */
export const debugFaviconState = (): void => {
  console.log('🔍 Favicon Debug State:');
  
  // Check all favicon links
  const allFaviconLinks = document.querySelectorAll('link[rel*="icon"]');
  console.log('Current favicon links:', allFaviconLinks.length);
  
  allFaviconLinks.forEach((link, index) => {
    console.log(`  ${index + 1}. rel: ${link.getAttribute('rel')}, href: ${(link as HTMLLinkElement).href}`);
  });
  
  // Check document.head innerHTML for favicon references
  const headContent = document.head.innerHTML;
  const faviconMatches = headContent.match(/favicon|icon/gi);
  console.log('Favicon references in head:', faviconMatches ? faviconMatches.length : 0);
};