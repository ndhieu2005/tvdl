/**
 * Content Image Optimizer
 * Tối ưu hóa hình ảnh trong nội dung HTML từ CMS
 */

/**
 * Xử lý HTML content để tối ưu hóa hình ảnh
 * Thêm loading="lazy", sizes, và các thuộc tính tối ưu khác
 */
export function optimizeContentImages(htmlContent: string): string {
  if (!htmlContent) return htmlContent;

  // Regex để tìm tất cả thẻ img
  const imgRegex = /<img([^>]*?)>/gi;
  
  return htmlContent.replace(imgRegex, (match, attributes) => {
    // Kiểm tra xem đã có loading attribute chưa
    if (!attributes.includes('loading=')) {
      attributes += ' loading="lazy"';
    }
    
    // Thêm sizes attribute nếu chưa có
    if (!attributes.includes('sizes=')) {
      // Tự động thêm sizes responsive cho ảnh trong content
      attributes += ' sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px"';
    }
    
    // Thêm class responsive nếu chưa có
    if (!attributes.includes('class=')) {
      attributes += ' class="max-w-full h-auto"';
    } else {
      // Thêm responsive classes vào class hiện có
      const classMatch = attributes.match(/class=["']([^"']*?)["']/);
      if (classMatch && !classMatch[1].includes('max-w-full')) {
        const newClass = `${classMatch[1]} max-w-full h-auto`.trim();
        attributes = attributes.replace(classMatch[0], `class="${newClass}"`);
      }
    }
    
    // Thêm style responsive nếu cần
    if (!attributes.includes('style=')) {
      attributes += ' style="width: 100%; height: auto;"';
    }
    
    return `<img${attributes}>`;
  });
}

/**
 * Preload critical images từ HTML content
 */
export function preloadCriticalImages(htmlContent: string, limit: number = 3): void {
  if (typeof window === 'undefined') return;
  
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const matches = [];
  let match;
  
  while ((match = imgRegex.exec(htmlContent)) !== null && matches.length < limit) {
    const src = match[1];
    if (src && !src.startsWith('data:')) {
      matches.push(src);
    }
  }
  
  matches.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

/**
 * Tạo blur data URL cho placeholder
 */
export function createBlurDataURL(width: number = 10, height: number = 10): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Hook để sử dụng optimized content
 */
export function useOptimizedContent(content: string, preload: boolean = false): string {
  if (typeof window !== 'undefined' && preload) {
    // Chỉ preload khi component mount
    setTimeout(() => preloadCriticalImages(content), 0);
  }
  
  return optimizeContentImages(content);
}