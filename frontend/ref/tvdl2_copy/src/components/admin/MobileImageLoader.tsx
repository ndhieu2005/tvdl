'use client';

import React, { useState, useEffect, useRef } from 'react';
import { isIOSSafari, getOptimalImageFormat, addIOSImageLoadHandlers } from '@/lib/ios-safari-fixes';

interface MobileImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export default function MobileImageLoader({
  src,
  alt,
  className = '',
  onLoad,
  onError,
  fallbackSrc
}: MobileImageLoaderProps) {
  const [currentSrc, setCurrentSrc] = useState(() => getOptimalImageFormat(src));
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Detect iOS device
  useEffect(() => {
    setIsIOSDevice(isIOSSafari());
  }, []);

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(getOptimalImageFormat(src));
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [src]);
  
  // Add iOS specific handlers
  useEffect(() => {
    const img = imgRef.current;
    if (img && isIOSDevice) {
      addIOSImageLoadHandlers(img, () => {
        setHasError(true);
        setIsLoading(false);
        onError?.();
      });
    }
  }, [isIOSDevice, onError]);

  const handleLoad = () => {
    console.log('🖼️ MobileImageLoader: Image loaded successfully:', currentSrc);
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    console.log('🚨 MobileImageLoader: Image failed to load:', currentSrc, 'retry:', retryCount, 'iOS:', isIOSDevice);
    
    if (retryCount < 3) {
      // Enhanced retry logic for iOS
      setTimeout(() => {
        if (retryCount === 0 && fallbackSrc) {
          setCurrentSrc(getOptimalImageFormat(fallbackSrc));
        } else if (retryCount === 1) {
          // For iOS: try JPEG format
          if (isIOSDevice && currentSrc.includes('.webp')) {
            setCurrentSrc(currentSrc.replace('.webp', '.jpg'));
          } else {
            // Add cache-busting parameter
            const separator = currentSrc.includes('?') ? '&' : '?';
            setCurrentSrc(`${currentSrc}${separator}t=${Date.now()}`);
          }
        } else if (retryCount === 2) {
          // Force JPEG format via API for iOS
          if (isIOSDevice && currentSrc.includes('/api/media/')) {
            const separator = currentSrc.includes('?') ? '&' : '?';
            setCurrentSrc(`${currentSrc}${separator}format=jpeg&ios=true`);
          } else {
            // Add cache-busting parameter
            const separator = currentSrc.includes('?') ? '&' : '?';
            setCurrentSrc(`${currentSrc}${separator}cb=${Date.now()}&retry=3`);
          }
        }
        setRetryCount(prev => prev + 1);
        setIsLoading(true);
      }, 500 * (retryCount + 1)); // Progressive delay
    } else {
      setHasError(true);
      setIsLoading(false);
      onError?.();
    }
  };

  if (hasError) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center p-2">
          <svg className="h-8 w-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs text-gray-500">Lỗi tải ảnh</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover ${isIOSDevice ? 'ios-optimized' : ''}`}
        onLoad={handleLoad}
        onError={isIOSDevice ? undefined : handleError} // Let iOS handler take precedence
        style={{ 
          display: isLoading ? 'none' : 'block',
          ...(isIOSDevice && {
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            WebkitTransform: 'translate3d(0, 0, 0)',
            transform: 'translate3d(0, 0, 0)',
            imageRendering: 'auto'
          })
        }}
        loading="lazy"
        decoding="async"
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
            <p className="text-xs text-gray-500">Đang tải...</p>
          </div>
        </div>
      )}
      
      {retryCount > 0 && !hasError && (
        <div className="absolute top-1 left-1 bg-orange-500/80 text-white text-xs px-1 py-0.5 rounded">
          Retry {retryCount}
        </div>
      )}
    </div>
  );
}