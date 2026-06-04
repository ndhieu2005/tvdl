/**
 * Image Presets for common use cases
 * Định nghĩa các preset cho các loại hình ảnh khác nhau
 */

export interface ImagePreset {
  width: number;
  height: number;
  sizes: string;
  quality: number;
  priority: boolean;
}

export const IMAGE_PRESETS = {
  // Hero images - ảnh chính trang chủ
  hero: {
    width: 1920,
    height: 1080,
    sizes: '100vw',
    quality: 90,
    priority: true,
  },
  
  // Featured images - ảnh nổi bật
  featured: {
    width: 800,
    height: 450,
    sizes: '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    quality: 85,
    priority: false,
  },
  
  // Card images - ảnh trong card
  card: {
    width: 400,
    height: 225,
    sizes: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
    quality: 80,
    priority: false,
  },
  
  // Thumbnail images - ảnh thumbnail
  thumbnail: {
    width: 150,
    height: 150,
    sizes: '(max-width: 640px) 25vw, 150px',
    quality: 75,
    priority: false,
  },
  
  // Content images - ảnh trong nội dung
  content: {
    width: 800,
    height: 450,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px',
    quality: 85,
    priority: false,
  },
  
  // Avatar images
  avatar: {
    width: 80,
    height: 80,
    sizes: '(max-width: 640px) 20vw, 80px',
    quality: 75,
    priority: false,
  },
  
  // Logo images
  logo: {
    width: 200,
    height: 60,
    sizes: '(max-width: 640px) 40vw, 200px',
    quality: 90,
    priority: true,
  },
} as const;

export type PresetName = keyof typeof IMAGE_PRESETS;

/**
 * Get image preset by name
 */
export function getImagePreset(presetName: PresetName): ImagePreset {
  return IMAGE_PRESETS[presetName];
}

/**
 * Generate sizes attribute based on image width
 */
export function generateSizes(width: number): string {
  if (width <= 150) {
    return '(max-width: 640px) 25vw, 150px';
  }
  
  if (width <= 300) {
    return '(max-width: 640px) 50vw, 300px';
  }
  
  if (width <= 600) {
    return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 600px';
  }
  
  if (width <= 800) {
    return '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px';
  }
  
  return '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
}

/**
 * Get optimal quality based on image size and usage
 */
export function getOptimalQuality(width: number, height: number, isHero: boolean = false): number {
  const totalPixels = width * height;
  
  if (isHero) return 90;
  if (totalPixels > 1000000) return 80; // Large images
  if (totalPixels > 500000) return 85;  // Medium images
  return 90; // Small images can have higher quality
}