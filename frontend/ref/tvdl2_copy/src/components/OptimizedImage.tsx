'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getPlaceholderByCategory } from '@/lib/placeholder-images';

interface OptimizedImageProps {
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

const OptimizedImage: React.FC<OptimizedImageProps> = ({
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

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setIsLoading(false);
      
      // Enhanced fallback strategy for WebP images on mobile
      if (imgSrc.endsWith('.webp')) {
        // Try PNG fallback first for WebP
        const pngFallback = imgSrc.replace('.webp', '.png');
        setImgSrc(pngFallback);
        return;
      }
      
      if (imgSrc.endsWith('.png')) {
        // Try JPG fallback for PNG
        const jpgFallback = imgSrc.replace('.png', '.jpg');
        setImgSrc(jpgFallback);
        return;
      }
      
      // Final fallback strategy:
      // 1. Use provided fallbackSrc
      // 2. Use category-based placeholder
      // 3. Use default placeholder
      const fallback = fallbackSrc || getPlaceholderByCategory(category);
      setImgSrc(fallback);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // For staging environment, provide additional error handling
  const isStaging = process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging' || 
                    process.env.NEXT_PUBLIC_SITE_URL?.includes('stg.trendiefox.com');

  // Default responsive sizes if not provided
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  const imageProps = {
    src: imgSrc,
    alt,
    onError: handleError,
    onLoad: handleLoad,
    className: `${className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    sizes: defaultSizes,
    priority,
    // Add quality setting for better mobile performance
    quality: 85,
    // Add placeholder blur for better UX
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
        {hasError && imgSrc.endsWith('.webp') && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
            WebP→PNG
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
      {hasError && imgSrc.endsWith('.webp') && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
          WebP→PNG
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;