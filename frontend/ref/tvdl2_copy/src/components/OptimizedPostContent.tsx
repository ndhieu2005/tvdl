'use client';

import React, { useEffect, useState } from 'react';
import { useOptimizedContent } from '@/lib/content-image-optimizer';

interface OptimizedPostContentProps {
  content: string;
  className?: string;
  preloadImages?: boolean;
}

/**
 * Optimized Post Content Component
 * Tự động tối ưu hóa hình ảnh trong HTML content
 */
const OptimizedPostContent: React.FC<OptimizedPostContentProps> = ({
  content,
  className = 'post-content prose max-w-none',
  preloadImages = false,
}) => {
  const [isClient, setIsClient] = useState(false);
  
  // Sử dụng optimized content
  const optimizedContent = useOptimizedContent(content, preloadImages);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Server-side: render content gốc
  if (!isClient) {
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Client-side: render optimized content
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: optimizedContent }}
    />
  );
};

export default OptimizedPostContent;