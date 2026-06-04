import { NextRequest, NextResponse } from 'next/server';

export interface WebPHeadersOptions {
  forceInline?: boolean;
  maxAge?: number;
  enableCORS?: boolean;
  debug?: boolean;
}

export function addWebPHeaders(
  response: NextResponse,
  filePath: string,
  options: WebPHeadersOptions = {}
): NextResponse {
  const {
    forceInline = true,
    maxAge = 31536000, // 1 year
    enableCORS = false,
    debug = false
  } = options;

  // Get file extension
  const ext = filePath.split('.').pop()?.toLowerCase();
  
  // Content type mapping
  const contentTypeMap: Record<string, string> = {
    'webp': 'image/webp',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'avif': 'image/avif'
  };

  const contentType = contentTypeMap[ext || ''] || 'application/octet-stream';
  
  // Get filename for Content-Disposition
  const filename = filePath.split('/').pop() || 'image';
  
  // Build headers
  const headers = new Headers(response.headers);
  
  // Content-Type
  headers.set('Content-Type', contentType);
  
  // Content-Disposition - Force inline to prevent download
  if (forceInline) {
    headers.set('Content-Disposition', `inline; filename="${filename}"`);
  }
  
  // Security headers
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // Cache headers
  headers.set('Cache-Control', `public, max-age=${maxAge}, immutable`);
  
  // CORS headers (if enabled)
  if (enableCORS) {
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }
  
  // Debug headers
  if (debug) {
    headers.set('X-Debug-File-Extension', ext || 'unknown');
    headers.set('X-Debug-Content-Type', contentType);
    headers.set('X-Debug-Original-Path', filePath);
  }

  // Create new response with updated headers
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

export function isImageFile(filePath: string): boolean {
  const ext = filePath.split('.').pop()?.toLowerCase();
  return ['webp', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'ico', 'avif'].includes(ext || '');
}

export function isWebPFile(filePath: string): boolean {
  return filePath.toLowerCase().endsWith('.webp');
}

export function shouldForceInline(userAgent: string, filePath: string): boolean {
  // Always force inline for image files
  if (isImageFile(filePath)) {
    return true;
  }
  
  // Force inline for WebP on mobile devices
  if (isWebPFile(filePath)) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    return isMobile;
  }
  
  return false;
}

export function getWebPFallback(webpPath: string): string[] {
  // Generate fallback URLs for WebP images
  const fallbacks: string[] = [];
  
  if (webpPath.endsWith('.webp')) {
    // Try JPG first (best compatibility)
    fallbacks.push(webpPath.replace('.webp', '.jpg'));
    // Try PNG second (if JPG not available)
    fallbacks.push(webpPath.replace('.webp', '.png'));
  }
  
  return fallbacks;
}

export function analyzeHeaders(headers: Headers): {
  isCorrect: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  const contentType = headers.get('content-type');
  const contentDisposition = headers.get('content-disposition');
  
  // Check Content-Type
  if (!contentType) {
    issues.push('Missing Content-Type header');
    recommendations.push('Add proper Content-Type header');
  } else if (contentType === 'application/octet-stream') {
    issues.push('Generic Content-Type (application/octet-stream)');
    recommendations.push('Set specific image Content-Type (e.g., image/webp)');
  }
  
  // Check Content-Disposition
  if (contentDisposition?.includes('attachment')) {
    issues.push('Content-Disposition set to attachment (forces download)');
    recommendations.push('Change Content-Disposition to inline');
  }
  
  if (!contentDisposition?.includes('inline')) {
    issues.push('Missing inline Content-Disposition');
    recommendations.push('Add Content-Disposition: inline');
  }
  
  // Check security headers
  if (!headers.get('x-content-type-options')) {
    issues.push('Missing X-Content-Type-Options header');
    recommendations.push('Add X-Content-Type-Options: nosniff');
  }
  
  const isCorrect = issues.length === 0;
  
  return {
    isCorrect,
    issues,
    recommendations
  };
}