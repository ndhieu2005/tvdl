// TikTok utility functions

/**
 * Check if a URL is a TikTok URL
 */
export function isTikTokUrl(url: string): boolean {
  if (!url) return false;
  
  const tiktokPatterns = [
    /tiktok\.com/,
    /vm\.tiktok\.com/,
    /vt\.tiktok\.com/,
    /m\.tiktok\.com/
  ];
  
  return tiktokPatterns.some(pattern => pattern.test(url));
}

/**
 * Extract video ID from TikTok URL
 */
export function extractTikTokVideoId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /\/video\/(\d+)/,
    /\/v\/(\d+)/,
    /tiktok\.com\/.*\/video\/(\d+)/,
    /vm\.tiktok\.com\/([A-Za-z0-9]+)/,
    /vt\.tiktok\.com\/([A-Za-z0-9]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Extract username from TikTok URL
 */
export function extractTikTokUsername(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /@([^/]+)/,
    /tiktok\.com\/([^/]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] !== 'www' && match[1] !== 'v' && match[1] !== 'vm' && match[1] !== 'vt') {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Normalize TikTok URL for embedding
 */
export function normalizeTikTokUrl(url: string): string {
  if (!url) return url;
  
  // Remove tracking parameters
  const cleanUrl = url.split('?')[0];
  
  // Ensure https
  if (cleanUrl.startsWith('http://')) {
    return cleanUrl.replace('http://', 'https://');
  }
  
  if (!cleanUrl.startsWith('https://')) {
    return `https://${cleanUrl}`;
  }
  
  return cleanUrl;
}

/**
 * Clean TikTok thumbnail URL
 */
export function cleanTikTokThumbnailUrl(url: string): string {
  if (!url) return url;
  
  try {
    // Decode URL encoded characters
    const decodedUrl = decodeURIComponent(url);
    
    // Remove some problematic parameters that might cause issues
    const cleanUrl = decodedUrl.replace(/&t=\w+/g, '').replace(/&ps=\w+/g, '');
    
    return cleanUrl;
  } catch (error) {
    console.error('Error cleaning TikTok thumbnail URL:', error);
    return url;
  }
}

/**
 * Generate TikTok embed HTML
 */
export function generateTikTokEmbedHtml(videoUrl: string, options: {
  compact?: boolean;
  maxWidth?: string;
  minWidth?: string;
} = {}): string {
  const { compact = false, maxWidth = '605px', minWidth = '325px' } = options;
  
  const videoId = extractTikTokVideoId(videoUrl);
  const username = extractTikTokUsername(videoUrl);
  
  if (!videoId || !username) {
    return `<div class="bg-gray-100 rounded-lg p-4"><p class="text-gray-500 text-sm">URL TikTok không hợp lệ</p></div>`;
  }
  
  const normalizedUrl = normalizeTikTokUrl(videoUrl);
  const embedMaxWidth = compact ? '325px' : maxWidth;
  
  return `
    <blockquote 
      class="tiktok-embed" 
      cite="${normalizedUrl}" 
      data-video-id="${videoId}" 
      style="max-width: ${embedMaxWidth}; min-width: ${minWidth}; margin: 0 auto;"
    >
      <section>
        <a 
          target="_blank" 
          title="@${username}" 
          href="https://www.tiktok.com/@${username}?refer=embed"
        >
          @${username}
        </a>
        <p></p>
        <a 
          target="_blank" 
          title="♬ original sound" 
          href="${normalizedUrl}?refer=embed"
        >
          ♬ original sound
        </a>
      </section>
    </blockquote>
  `;
}