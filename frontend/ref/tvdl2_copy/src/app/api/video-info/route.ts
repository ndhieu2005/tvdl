import { NextRequest, NextResponse } from 'next/server';

interface VideoInfo {
  title?: string;
  thumbnail?: string;
  platform?: string;
  description?: string;
  duration?: string;
  views?: number;
  author?: string;
  uploadDate?: string;
  likes?: number;
  comments?: number;
  shares?: number;
}

function extractVideoId(url: string): { platform: string; videoId: string } | null {
  // YouTube
  if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
    const videoId = url.includes('youtube.com/watch?v=') 
      ? url.split('watch?v=')[1].split('&')[0]
      : url.split('youtu.be/')[1].split('?')[0];
    return { platform: 'youtube', videoId };
  }
  
  // TikTok
  if (url.includes('tiktok.com') && url.includes('/video/')) {
    const match = url.match(/\/video\/(\d+)/);
    if (match) {
      return { platform: 'tiktok', videoId: match[1] };
    }
  }
  
  // Vimeo
  if (url.includes('vimeo.com/')) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) {
      return { platform: 'vimeo', videoId: match[1] };
    }
  }
  
  return null;
}

async function fetchYouTubeInfo(videoId: string): Promise<VideoInfo | null> {
  try {
    // Using YouTube oEmbed API (no API key required)
    const oembedResponse = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    
    if (!oembedResponse.ok) {
      return null;
    }
    
    const oembedData = await oembedResponse.json();
    
    return {
      title: oembedData.title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      platform: 'youtube',
      description: oembedData.title, // oEmbed doesn't provide description
      author: oembedData.author_name,
      views: 0, // oEmbed doesn't provide view count
      duration: '',
      uploadDate: ''
    };
  } catch (error) {
    console.error('Error fetching YouTube info:', error);
    return null;
  }
}

async function fetchTikTokInfo(videoId: string, originalUrl: string): Promise<VideoInfo | null> {
  try {
    // Try TikTok oEmbed API first
    const oembedResponse = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(originalUrl)}`
    );
    
    let oembedData = null;
    if (oembedResponse.ok) {
      oembedData = await oembedResponse.json();
    }
    
    // Try to scrape additional metadata from the page
    let metadata = {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0
    };
    
    try {
      const pageResponse = await fetch(originalUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (pageResponse.ok) {
        const html = await pageResponse.text();
        
        // Extract metadata from HTML
        const viewsMatch = html.match(/playCount[\"\']\s*:\s*(\d+)/);
        const likesMatch = html.match(/diggCount[\"\']\s*:\s*(\d+)/);
        const commentsMatch = html.match(/commentCount[\"\']\s*:\s*(\d+)/);
        const sharesMatch = html.match(/shareCount[\"\']\s*:\s*(\d+)/);
        
        if (viewsMatch) metadata.views = parseInt(viewsMatch[1]);
        if (likesMatch) metadata.likes = parseInt(likesMatch[1]);
        if (commentsMatch) metadata.comments = parseInt(commentsMatch[1]);
        if (sharesMatch) metadata.shares = parseInt(sharesMatch[1]);
      }
    } catch (scrapeError) {
      console.log('Could not scrape TikTok metadata:', scrapeError);
    }
    
    return {
      title: oembedData?.title || `TikTok Video ${videoId}`,
      thumbnail: oembedData?.thumbnail_url || '',
      platform: 'tiktok',
      description: oembedData?.title || '',
      author: oembedData?.author_name || '',
      views: metadata.views,
      duration: '',
      uploadDate: '',
      likes: metadata.likes,
      comments: metadata.comments,
      shares: metadata.shares
    };
  } catch (error) {
    console.error('Error fetching TikTok info:', error);
    return null;
  }
}

async function fetchVimeoInfo(videoId: string): Promise<VideoInfo | null> {
  try {
    // Vimeo oEmbed API
    const oembedResponse = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`
    );
    
    if (!oembedResponse.ok) {
      return null;
    }
    
    const oembedData = await oembedResponse.json();
    
    return {
      title: oembedData.title,
      thumbnail: oembedData.thumbnail_url,
      platform: 'vimeo',
      description: oembedData.description || oembedData.title,
      author: oembedData.author_name,
      views: 0,
      duration: '',
      uploadDate: ''
    };
  } catch (error) {
    console.error('Error fetching Vimeo info:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Extracting video info from URL:', url);
    
    const videoInfo = extractVideoId(url);
    if (!videoInfo) {
      return NextResponse.json(
        { success: false, error: 'Unsupported video platform or invalid URL' },
        { status: 400 }
      );
    }
    
    const { platform, videoId } = videoInfo;
    console.log('🔍 Detected platform:', platform, 'videoId:', videoId);
    
    let metadata: VideoInfo | null = null;
    
    switch (platform) {
      case 'youtube':
        metadata = await fetchYouTubeInfo(videoId);
        break;
      case 'tiktok':
        metadata = await fetchTikTokInfo(videoId, url);
        break;
      case 'vimeo':
        metadata = await fetchVimeoInfo(videoId);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Unsupported platform' },
          { status: 400 }
        );
    }
    
    if (!metadata) {
      // Fallback with basic info
      metadata = {
        title: `Video from ${platform}`,
        thumbnail: platform === 'youtube' ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '',
        platform: platform,
        description: '',
        author: '',
        views: 0,
        duration: '',
        uploadDate: ''
      };
    }
    
    console.log('🔍 Extracted metadata:', metadata);
    
    return NextResponse.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('🔍 Error extracting video info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to extract video information' },
      { status: 500 }
    );
  }
}