// Utility functions for image handling and mobile compatibility

export const checkWebPSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    const dataURL = canvas.toDataURL('image/webp');
    return dataURL.indexOf('data:image/webp') === 0;
  }
  
  return false;
};

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const getImageFallback = (src: string): string => {
  // Convert WebP to fallback formats for better mobile compatibility
  if (src.endsWith('.webp')) {
    return src.replace('.webp', '.jpg');
  }
  
  if (src.endsWith('.avif')) {
    return src.replace('.avif', '.jpg');
  }
  
  return src;
};

export const getOptimizedImageSrc = (src: string): string => {
  // Modern mobile devices (iOS 14+, Android 5+) support WebP
  // Only fallback for very old devices if needed
  
  // Check if we should force fallback (only for very old iOS)
  if (typeof window !== 'undefined' && isIOSDevice()) {
    const userAgent = navigator.userAgent;
    const iOSVersion = userAgent.match(/OS (\d+)_/);
    
    // Only fallback for iOS < 14
    if (iOSVersion && parseInt(iOSVersion[1]) < 14 && src.endsWith('.webp')) {
      return src.replace('.webp', '.jpg');
    }
  }
  
  return src;
};

export const generateImageSources = (src: string): string[] => {
  const sources = [src];
  
  if (src.endsWith('.webp')) {
    sources.push(src.replace('.webp', '.jpg'));
    sources.push(src.replace('.webp', '.png'));
  } else if (src.endsWith('.avif')) {
    sources.push(src.replace('.avif', '.webp'));
    sources.push(src.replace('.avif', '.jpg'));
  }
  
  return sources;
};

export const getMobileOptimizedSizes = (originalSizes?: string): string => {
  if (originalSizes) return originalSizes;
  
  // Default mobile-optimized sizes
  return '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';
};

export const shouldUseWebP = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if it's iOS Safari - WebP support is limited
  if (isIOSDevice()) {
    // iOS 14+ has limited WebP support
    const isNewerIOS = /OS 1[4-9]_/.test(navigator.userAgent);
    return isNewerIOS && checkWebPSupport();
  }
  
  return checkWebPSupport();
};

export const getImageQuality = (isMobile: boolean = false): number => {
  // Use lower quality for mobile to improve loading speed
  return isMobile ? 75 : 85;
};

export const getMobileImageProps = (src: string) => {
  const isMobile = isMobileDevice();
  const isIOS = isIOSDevice();
  
  return {
    src: getOptimizedImageSrc(src),
    quality: getImageQuality(isMobile),
    sizes: getMobileOptimizedSizes(),
    priority: false,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
    // Force no optimization for iOS to prevent WebP issues
    ...(isIOS && { unoptimized: true }),
  };
};

export const debugImageIssues = (src: string, error?: Error) => {
  console.log('🖼️ Image Debug Info:', {
    src,
    isWebP: src.endsWith('.webp'),
    isMobile: isMobileDevice(),
    isIOS: isIOSDevice(),
    webPSupported: checkWebPSupport(),
    fallbackSrc: getImageFallback(src),
    error: error?.message,
  });
};