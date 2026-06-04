import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Server-side utilities for asset optimization
 * Only use these in server components or API routes
 */

/**
 * Check if a file exists in the public directory and return the optimized URL
 * SERVER-SIDE ONLY
 */
export function getOptimizedAssetUrlServer(currentUrl: string, type: 'logo' | 'favicon'): string {
  // If already a public URL, return as is
  if (currentUrl && currentUrl.startsWith('/') && !currentUrl.startsWith('/api/')) {
    return currentUrl;
  }

  // Check for common file extensions in public directory
  const publicDir = join(process.cwd(), 'public');
  const extensions = type === 'favicon' ? ['ico', 'png', 'jpg'] : ['svg', 'png', 'jpg', 'webp'];
  
  // First check in public root directory
  for (const ext of extensions) {
    const filename = `${type}.${ext}`;
    const filePath = join(publicDir, filename);
    
    if (existsSync(filePath)) {
      return `/${filename}`;
    }
  }

  // Then check in logo directory for uploaded files
  const logoDir = join(publicDir, 'logo');
  if (existsSync(logoDir)) {
    const fs = require('fs');
    const files = fs.readdirSync(logoDir);
    
    // Find the most recent file of the correct type
    const typeFiles = files.filter((file: string) => {
      const isCorrectType = type === 'favicon' 
        ? file.toLowerCase().includes('favicon') || file.match(/\.(ico)$/i)
        : file.toLowerCase().includes('logo') || file.match(/\.(svg|png|jpg|jpeg|webp)$/i);
      return isCorrectType;
    }).sort((a: string, b: string) => {
      // Sort by timestamp in filename (newest first)
      const aTime = extractTimestamp(a);
      const bTime = extractTimestamp(b);
      return bTime - aTime;
    });
    
    if (typeFiles.length > 0) {
      return `/logo/${typeFiles[0]}`;
    }
  }

  // Fallback to current URL or default
  if (currentUrl) {
    return currentUrl;
  }

  return type === 'favicon' ? '/favicon.ico' : '/logo.svg';
}

/**
 * Extract timestamp from filename
 */
function extractTimestamp(filename: string): number {
  const match = filename.match(/(\d{13})/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Get the best available asset URLs for both logo and favicon
 * SERVER-SIDE ONLY
 */
export function getOptimizedAssetsServer(settings: any) {
  return {
    logo: getOptimizedAssetUrlServer(settings?.logo, 'logo'),
    favicon: getOptimizedAssetUrlServer(settings?.favicon, 'favicon')
  };
}

/**
 * Check if specific asset files exist in public directory
 * SERVER-SIDE ONLY
 */
export function checkPublicAssets() {
  const publicDir = join(process.cwd(), 'public');
  
  const assets = {
    favicon: {
      ico: existsSync(join(publicDir, 'favicon.ico')),
      png: existsSync(join(publicDir, 'favicon.png')),
      jpg: existsSync(join(publicDir, 'favicon.jpg'))
    },
    logo: {
      svg: existsSync(join(publicDir, 'logo.svg')),
      png: existsSync(join(publicDir, 'logo.png')),
      jpg: existsSync(join(publicDir, 'logo.jpg')),
      webp: existsSync(join(publicDir, 'logo.webp'))
    }
  };

  return assets;
}