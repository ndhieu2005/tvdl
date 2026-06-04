import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Detect platform
    const platform = url.includes('tiktok.com') || url.includes('vm.tiktok.com') 
      ? 'tiktok' 
      : url.includes('youtube.com') || url.includes('youtu.be') 
        ? 'youtube' 
        : 'other';

    if (platform === 'youtube') {
      return await extractYouTubeInfo(url);
    } else if (platform === 'tiktok') {
      return await extractTikTokInfo(url);
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported platform' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error extracting video info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to extract video information' },
      { status: 500 }
    );
  }
}

async function extractYouTubeInfo(url: string) {
  try {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Try YouTube oEmbed API first
    const oembedResponse = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    
    if (oembedResponse.ok) {
      const data = await oembedResponse.json();
      return NextResponse.json({
        success: true,
        data: {
          title: data.title || 'YouTube Video',
          description: data.title || '',
          thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          author: data.author_name || '',
          platform: 'youtube'
        }
      });
    } else {
      // Fallback to thumbnail URL
      return NextResponse.json({
        success: true,
        data: {
          title: 'YouTube Video',
          description: '',
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          platform: 'youtube'
        }
      });
    }
  } catch (error) {
    console.error('YouTube extraction error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to extract YouTube video information' },
      { status: 500 }
    );
  }
}

async function extractTikTokInfo(url: string) {
  try {
    // Try TikTok oEmbed API
    const oembedResponse = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
    
    if (oembedResponse.ok) {
      const data = await oembedResponse.json();
      return NextResponse.json({
        success: true,
        data: {
          title: data.title || 'TikTok Video',
          description: data.title || '',
          thumbnailUrl: data.thumbnail_url || '',
          author: data.author_name || '',
          platform: 'tiktok'
        }
      });
    } else {
      // Fallback - basic info
      return NextResponse.json({
        success: true,
        data: {
          title: 'TikTok Video',
          description: '',
          thumbnailUrl: '',
          platform: 'tiktok'
        }
      });
    }
  } catch (error) {
    console.error('TikTok extraction error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to extract TikTok video information' },
      { status: 500 }
    );
  }
}

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