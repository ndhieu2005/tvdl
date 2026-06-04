'use client';

import React, { useState } from 'react';
import { extractTikTokVideoId, extractTikTokUsername, normalizeTikTokUrl } from '@/lib/tiktok';
import { Heart, MessageCircle, ExternalLink } from 'lucide-react';

interface TikTokEmbedIframeProps {
  videoUrl: string;
  className?: string;
  compact?: boolean;
  metadata?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    author?: string;
    duration?: string;
    [key: string]: any;
  };
  showStats?: boolean;
}

const TikTokEmbedIframe: React.FC<TikTokEmbedIframeProps> = ({ 
  videoUrl, 
  className = '', 
  compact = false,
  metadata,
  showStats = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const videoId = extractTikTokVideoId(videoUrl);
  const username = extractTikTokUsername(videoUrl);
  const normalizedUrl = normalizeTikTokUrl(videoUrl);

  if (!videoId || !username) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
        <p className="text-gray-500 text-sm">URL TikTok không hợp lệ</p>
        <p className="text-gray-400 text-xs mt-1">URL: {videoUrl}</p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Try different iframe URLs based on video ID pattern
  const iframeUrl = videoId?.match(/^\d+$/) 
    ? `https://www.tiktok.com/embed/v2/${videoId}?lang=vi-VN`
    : `https://www.tiktok.com/embed/${videoId}?lang=vi-VN`;

  return (
    <div className={`tiktok-embed-wrapper ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
          <div className="w-full h-64 bg-gray-200 rounded-lg mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      )}
      
      {/* Error State */}
      {hasError && (
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <div className="text-gray-500 mb-4">
            <ExternalLink className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Không thể tải video TikTok</p>
          </div>
          <a
            href={normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>Xem trên TikTok</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}
      
      {/* TikTok Iframe */}
      {!hasError && (
        <div className="relative">
          <iframe
            src={iframeUrl}
            width="100%"
            height={compact ? "400" : "600"}
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            className={`rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            title={`TikTok video by @${username}`}
          />
          
          {/* Video Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
            <div className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
              @{username}
            </div>
            
            <a
              href={normalizedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-all pointer-events-auto"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
      
      {/* Stats Section */}
      {showStats && metadata && (metadata.likes || metadata.comments) && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              {metadata.likes && (
                <div className="flex items-center space-x-1 text-red-500">
                  <Heart className="h-4 w-4 fill-current" />
                  <span>{formatNumber(metadata.likes)}</span>
                </div>
              )}
              {metadata.comments && (
                <div className="flex items-center space-x-1 text-gray-600">
                  <MessageCircle className="h-4 w-4" />
                  <span>{formatNumber(metadata.comments)}</span>
                </div>
              )}
            </div>
            {metadata.author && (
              <div className="text-xs text-gray-500">
                @{metadata.author}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TikTokEmbedIframe;