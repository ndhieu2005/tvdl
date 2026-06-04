/**
 * iOS Safari specific fixes for image handling
 */

export function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(userAgent) && /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
}

export function isOldIOSVersion(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  const match = userAgent.match(/OS (\d+)_/);
  if (match) {
    const version = parseInt(match[1], 10);
    return version < 14; // iOS < 14 has WebP issues
  }
  return false;
}

export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Quick check for iOS Safari
    if (isIOSSafari() && isOldIOSVersion()) {
      resolve(false);
      return;
    }

    const webP = new Image();
    webP.onload = webP.onerror = function () {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

export function getOptimalImageFormat(originalUrl: string): string {
  if (typeof window === 'undefined') return originalUrl;
  
  // For iOS Safari, always use JPEG for better compatibility
  if (isIOSSafari()) {
    console.log('🍎 iOS Safari detected, using JPEG fallback');
    
    // Convert WebP URLs to JPEG
    if (originalUrl.includes('.webp')) {
      return originalUrl.replace('.webp', '.jpg');
    }
    
    // Add format parameter for API endpoints
    if (originalUrl.includes('/api/media/')) {
      const separator = originalUrl.includes('?') ? '&' : '?';
      return `${originalUrl}${separator}format=jpeg&ios=true`;
    }
  }
  
  return originalUrl;
}

export function addIOSImageLoadHandlers(img: HTMLImageElement, onError?: () => void): void {
  if (!isIOSSafari()) return;
  
  // iOS Safari specific handling
  let retryCount = 0;
  const maxRetries = 2;
  
  const originalOnError = img.onerror;
  
  img.onerror = function(e) {
    console.log('🚨 iOS Safari image error, retry:', retryCount);
    
    if (retryCount < maxRetries) {
      retryCount++;
      const currentSrc = img.src;
      
      // Try different strategies
      if (retryCount === 1) {
        // First retry: add cache buster
        const separator = currentSrc.includes('?') ? '&' : '?';
        img.src = `${currentSrc}${separator}cb=${Date.now()}`;
      } else if (retryCount === 2) {
        // Second retry: force JPEG format
        if (currentSrc.includes('.webp')) {
          img.src = currentSrc.replace('.webp', '.jpg');
        } else if (currentSrc.includes('/api/media/')) {
          const separator = currentSrc.includes('?') ? '&' : '?';
          img.src = `${currentSrc}${separator}format=jpeg&force=true`;
        }
      }
    } else {
      // Final fallback
      console.error('🍎 iOS Safari: All image retries failed');
      onError?.();
      if (originalOnError) {
        originalOnError.call(img, e);
      }
    }
  };
}

export function createIOSOptimizedImageElement(src: string, alt: string = ''): HTMLImageElement {
  const img = new Image();
  
  // iOS specific attributes
  if (isIOSSafari()) {
    img.decoding = 'async';
    img.loading = 'lazy';
    
    // Prevent iOS from trying to optimize large images aggressively
    img.style.imageRendering = 'auto';
    img.style.webkitUserSelect = 'none';
    img.style.userSelect = 'none';
  }
  
  img.src = getOptimalImageFormat(src);
  img.alt = alt;
  
  return img;
}

export function addIOSViewportFix(): void {
  if (typeof window === 'undefined' || !isIOSSafari()) return;
  
  // Fix viewport issues on iOS Safari
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    viewport.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    );
  }
  
  // Prevent zoom on input focus (common iOS issue)
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }
    });
    
    input.addEventListener('blur', () => {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
        );
      }
    });
  });
}

// CSS fixes for iOS Safari
export const iosSafariCSS = `
  /* iOS Safari specific fixes */
  @supports (-webkit-touch-callout: none) {
    /* iOS Safari only */
    
    /* Fix image rendering issues */
    img {
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }
    
    /* Fix modal/popup issues */
    .modal-container {
      -webkit-overflow-scrolling: touch;
      overflow-scrolling: touch;
    }
    
    /* Prevent iOS zoom on input fields */
    input[type="text"],
    input[type="email"],
    input[type="password"],
    input[type="search"],
    input[type="url"],
    textarea,
    select {
      font-size: 16px !important;
    }
    
    /* Fix flex layout issues on iOS */
    .ios-flex-fix {
      -webkit-flex-shrink: 0;
      flex-shrink: 0;
    }
  }
`;