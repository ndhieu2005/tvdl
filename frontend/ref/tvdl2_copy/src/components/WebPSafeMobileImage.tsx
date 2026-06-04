'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getPlaceholderByCategory } from '@/lib/placeholder-images';

interface WebPSafeMobileImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  category?: string;
  fallbackSrc?: string;
}

const WebPSafeMobileImage: React.FC<WebPSafeMobileImageProps> = ({
  src,
  alt,
  width,
  height,
  fill,
  className,
  sizes,
  priority,
  category,
  fallbackSrc,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [supportsWebP, setSupportsWebP] = useState(true);

  // Check WebP support on client side
  useEffect(() => {
    const checkWebPSupport = () => {
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

    setSupportsWebP(checkWebPSupport());
  }, []);

  // Convert WebP to fallback format if not supported
  const getOptimizedSrc = (originalSrc: string): string => {
    if (!supportsWebP && originalSrc.endsWith('.webp')) {
      // Try to convert webp to jpg/png
      return originalSrc.replace('.webp', '.jpg');
    }
    return originalSrc;
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setIsLoading(false);
      
      // Fallback strategy for WebP images on mobile
      if (imgSrc.endsWith('.webp')) {
        // Try PNG fallback first
        const pngFallback = imgSrc.replace('.webp', '.png');
        setImgSrc(pngFallback);
        return;
      }
      
      if (imgSrc.endsWith('.png')) {
        // Try JPG fallback
        const jpgFallback = imgSrc.replace('.png', '.jpg');
        setImgSrc(jpgFallback);
        return;
      }
      
      // Use final fallback
      const finalFallback = fallbackSrc || getPlaceholderByCategory(category);
      setImgSrc(finalFallback);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Default responsive sizes optimized for mobile
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';

  const imageProps = {
    src: getOptimizedSrc(imgSrc),
    alt,
    onError: handleError,
    onLoad: handleLoad,
    className: `${className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    sizes: defaultSizes,
    priority,
    quality: 85,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
    ...props,
  };

  if (fill) {
    return (
      <div className="relative w-full h-full">
        <Image
          {...imageProps}
          fill
          style={{ objectFit: 'cover' }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
          </div>
        )}
        {hasError && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            WebP
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      <Image
        {...imageProps}
        width={width}
        height={height}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      )}
      {hasError && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          WebP
        </div>
      )}
    </div>
  );
};

export default WebPSafeMobileImage;