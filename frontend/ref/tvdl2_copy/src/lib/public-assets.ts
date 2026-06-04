/**
 * Client-safe utilities for asset optimization
 */

/**
 * Check if an asset is served from public directory (fast loading)
 */
export function isPublicAsset(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('/api/') && !url.startsWith('/uploads/');
}

/**
 * Get optimized asset URL (client-safe version)
 */
export function getOptimizedAssetUrl(currentUrl: string, type: 'logo' | 'favicon'): string {
  // If already a public URL, return as is
  if (currentUrl && currentUrl.startsWith('/') && !currentUrl.startsWith('/api/')) {
    return currentUrl;
  }

  // Fallback to current URL or default
  if (currentUrl) {
    return currentUrl;
  }

  return type === 'favicon' ? '/favicon.ico' : '/logo.svg';
}

/**
 * Get the best available asset URLs for both logo and favicon (client-safe)
 */
export function getOptimizedAssets(settings: any) {
  return {
    logo: getOptimizedAssetUrl(settings?.logo, 'logo'),
    favicon: getOptimizedAssetUrl(settings?.favicon, 'favicon')
  };
}