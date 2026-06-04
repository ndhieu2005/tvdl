import React from 'react';
import { Music2, Youtube, ExternalLink } from 'lucide-react';

interface VideoEmbedProps {
  url: string;
  platform: 'tiktok' | 'youtube' | 'upload' | 'other';
  className?: string;
}

export function VideoEmbed({ url, platform, className = '' }: VideoEmbedProps) {
  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId[1]}`;
    }
    return url;
  };

  const getTikTokEmbedUrl = (url: string): string => {
    // TikTok doesn't support iframe embedding directly
    // We'll show a placeholder with link to open in new tab
    return url;
  };

  if (platform === 'youtube') {
    return (
      <div className={`relative aspect-video bg-gray-100 rounded-lg overflow-hidden ${className}`}>
        <iframe
          src={getYouTubeEmbedUrl(url)}
          className="w-full h-full"
          allowFullScreen
          title="YouTube video preview"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  if (platform === 'tiktok') {
    return (
      <div className={`relative aspect-video bg-gray-100 rounded-lg overflow-hidden ${className}`}>
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="text-center">
            <Music2 className="h-12 w-12 text-pink-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              TikTok Video
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Nhấn để xem video trên TikTok
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Xem trên TikTok</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'upload') {
    return (
      <div className={`relative aspect-video bg-gray-100 rounded-lg overflow-hidden ${className}`}>
        <video
          src={url}
          className="w-full h-full object-cover"
          controls
          preload="metadata"
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-video bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center">
          <Youtube className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Video Preview
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Nhấn để xem video
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Xem video</span>
          </a>
        </div>
      </div>
    </div>
  );
}