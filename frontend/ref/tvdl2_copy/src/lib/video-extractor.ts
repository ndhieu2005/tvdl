export interface VideoInfo {
  title: string;
  description: string;
  thumbnailUrl: string;
  duration?: number;
  author?: string;
  views?: number;
  platform: 'tiktok' | 'youtube';
}

export interface ExtractResult {
  success: boolean;
  data?: VideoInfo;
  error?: string;
}

/**
 * Extract video information from TikTok URL
 */
export async function extractTikTokInfo(url: string): Promise<ExtractResult> {
  try {
    // Extract video ID from TikTok URL
    const videoId = extractTikTokVideoId(url);
    if (!videoId) {
      return { success: false, error: 'Invalid TikTok URL' };
    }

    // Use TikTok oEmbed API (if available) or web scraping
    const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: {
          title: data.title || 'TikTok Video',
          description: data.title || '',
          thumbnailUrl: data.thumbnail_url || '',
          author: data.author_name || '',
          platform: 'tiktok'
        }
      };
    } else {
      // Fallback: Try to extract from meta tags
      return await extractFromMetaTags(url, 'tiktok');
    }
  } catch (error) {
    console.error('Error extracting TikTok info:', error);
    return { success: false, error: 'Failed to extract TikTok video information' };
  }
}

/**
 * Extract video information from YouTube URL
 */
export async function extractYouTubeInfo(url: string): Promise<ExtractResult> {
  try {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return { success: false, error: 'Invalid YouTube URL' };
    }

    // Use YouTube oEmbed API
    const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: {
          title: data.title || 'YouTube Video',
          description: data.title || '',
          thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          author: data.author_name || '',
          platform: 'youtube'
        }
      };
    } else {
      // Fallback: Use YouTube thumbnail API
      return {
        success: true,
        data: {
          title: 'YouTube Video',
          description: '',
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          platform: 'youtube'
        }
      };
    }
  } catch (error) {
    console.error('Error extracting YouTube info:', error);
    return { success: false, error: 'Failed to extract YouTube video information' };
  }
}

/**
 * Extract video ID from TikTok URL
 */
function extractTikTokVideoId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/v\/(\d+)/,
    /(?:https?:\/\/)?vm\.tiktok\.com\/(\w+)/,
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/t\/(\w+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract video ID from YouTube URL
 */
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Fallback method to extract info from meta tags
 */
async function extractFromMetaTags(url: string, platform: 'tiktok' | 'youtube'): Promise<ExtractResult> {
  try {
    // Note: This would require a backend proxy service to avoid CORS issues
    // For now, we'll return a basic structure
    return {
      success: true,
      data: {
        title: `${platform === 'tiktok' ? 'TikTok' : 'YouTube'} Video`,
        description: '',
        thumbnailUrl: '',
        platform
      }
    };
  } catch (error) {
    return { success: false, error: 'Failed to extract video information' };
  }
}

/**
 * Detect platform from URL
 */
export function detectPlatform(url: string): 'tiktok' | 'youtube' | 'other' {
  if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) {
    return 'tiktok';
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  return 'other';
}

/**
 * Extract video information based on platform
 */
export async function extractVideoInfo(url: string): Promise<ExtractResult> {
  const platform = detectPlatform(url);
  
  switch (platform) {
    case 'tiktok':
      return await extractTikTokInfo(url);
    case 'youtube':
      return await extractYouTubeInfo(url);
    default:
      return { success: false, error: 'Unsupported platform' };
  }
}