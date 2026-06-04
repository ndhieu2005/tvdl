'use client';

import React from 'react';
import Image from 'next/image';
import { useState } from 'react';
import { generateSizes, getOptimalQuality, type PresetName, getImagePreset } from '@/lib/image-presets';

interface SmartImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  style?: React.CSSProperties;
  preset?: PresetName;
}

/**
 * Smart Image Component với sizes tối ưu cho từng kích thước
 * Tự động tính toán sizes attribute dựa trên width của ảnh
 */
const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority,
  quality,
  sizes,
  style,
  preset,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Get configuration from preset or props
  const config = preset ? getImagePreset(preset) : null;
  
  const finalWidth = width || config?.width || 800;
  const finalHeight = height || config?.height || 450;
  const finalSizes = sizes || config?.sizes || generateSizes(finalWidth);
  const finalQuality = quality || config?.quality || getOptimalQuality(finalWidth, finalHeight);
  const finalPriority = priority !== undefined ? priority : (config?.priority || false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <Image
      src={src}
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      sizes={finalSizes}
      quality={finalQuality}
      priority={finalPriority}
      loading={finalPriority ? 'eager' : 'lazy'}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      className={`${className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      style={{
        width: '100%',
        height: 'auto',
        ...style
      }}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

export default SmartImage;