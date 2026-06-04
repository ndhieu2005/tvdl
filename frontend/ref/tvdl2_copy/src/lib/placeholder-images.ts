/**
 * Utility for generating placeholder images as data URIs
 */

export function generatePlaceholderImage(
  width: number = 400,
  height: number = 300,
  text: string = 'VIDEO',
  backgroundColor: string = '#f3f4f6',
  textColor: string = '#6b7280'
): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
      <text x="50%" y="40%" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${textColor}">
        ${text}
      </text>
      <polygon points="${width/2 - 20},${height/2} ${width/2 - 20},${height/2 + 20} ${width/2 + 10},${height/2 + 10}" fill="${textColor}" opacity="0.7"/>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Predefined placeholder images
export const placeholderImages = {
  videoPlaceholder: generatePlaceholderImage(400, 300, 'VIDEO'),
  tiktokDance: generatePlaceholderImage(400, 300, 'TIKTOK DANCE', '#ff0050', '#ffffff'),
  youtubeTrends: generatePlaceholderImage(400, 300, 'YOUTUBE TRENDS', '#ff0000', '#ffffff'),
  btsVideo: generatePlaceholderImage(400, 300, 'BTS VIDEO', '#8b5cf6', '#ffffff'),
  foodChallenge: generatePlaceholderImage(400, 300, 'FOOD CHALLENGE', '#f59e0b', '#ffffff'),
  beautyTransform: generatePlaceholderImage(400, 300, 'BEAUTY TRANSFORM', '#ec4899', '#ffffff'),
  ogImage: generatePlaceholderImage(1200, 630, 'VIRALPEEK', '#6366f1', '#ffffff'),
};

// Function to get placeholder based on category or type
export function getPlaceholderByCategory(category?: string): string {
  const categoryMap: Record<string, string> = {
    'dance': placeholderImages.tiktokDance,
    'trends': placeholderImages.youtubeTrends,
    'educational': placeholderImages.btsVideo,
    'food': placeholderImages.foodChallenge,
    'beauty': placeholderImages.beautyTransform,
  };
  
  const normalizedCategory = category?.toLowerCase() || '';
  return categoryMap[normalizedCategory] || placeholderImages.videoPlaceholder;
}