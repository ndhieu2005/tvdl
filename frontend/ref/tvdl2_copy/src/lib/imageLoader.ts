/**
 * Custom image loader for handling different environments
 */

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export const customImageLoader = ({ src, width, quality }: ImageLoaderProps): string => {
  const isStaging = process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging';
  const isProduction = process.env.NODE_ENV === 'production';

  // If it's already a data URL or absolute URL, return as-is
  if (src.startsWith('data:') || src.startsWith('http')) {
    return src;
  }

  // For staging environment, we might want to use a different approach
  if (isStaging) {
    // For picsum.photos, we can add width parameter
    if (src.includes('picsum.photos')) {
      const url = new URL(src);
      // If it's a seed-based URL, preserve the structure
      if (url.pathname.includes('/seed/')) {
        const pathParts = url.pathname.split('/');
        const seedIndex = pathParts.findIndex(part => part === 'seed');
        if (seedIndex !== -1 && pathParts.length > seedIndex + 3) {
          // Replace width in the URL
          pathParts[seedIndex + 3] = width.toString();
          return `${url.origin}${pathParts.join('/')}`;
        }
      }
      // For random URLs, add width parameter
      return `${src}?w=${width}${quality ? `&q=${quality}` : ''}`;
    }

    // For other external URLs, return as-is
    return src;
  }

  // For development and production, use default Next.js optimization
  if (isProduction) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
  }

  // Fallback to original src
  return src;
};

export default customImageLoader;