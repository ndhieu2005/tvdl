'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { extractTikTokVideoId, extractTikTokUsername, generateTikTokEmbedHtml, normalizeTikTokUrl } from '@/lib/tiktok';
import { Eye, Heart, MessageCircle, Share2 } from 'lucide-react';

interface TikTokEmbedSimpleProps {
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

const TikTokEmbedSimple: React.FC<TikTokEmbedSimpleProps> = ({ 
  videoUrl, 
  className = '', 
  compact = false,
  metadata,
  showStats = false
}) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [embedReady, setEmbedReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoId = extractTikTokVideoId(videoUrl);
  const username = extractTikTokUsername(videoUrl);

  if (!videoId || !username) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
        <p className="text-gray-500 text-sm">URL TikTok không hợp lệ</p>
        <p className="text-gray-400 text-xs mt-1">URL: {videoUrl}</p>
      </div>
    );
  }

  const embedHtml = generateTikTokEmbedHtml(videoUrl, { compact });

  useEffect(() => {
    if (scriptLoaded && containerRef.current) {
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (window.tiktokEmbed) {
          window.tiktokEmbed.lib.render();
          setEmbedReady(true);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [scriptLoaded, videoUrl]);

  const handleScriptLoad = () => {
    setScriptLoaded(true);
    if (window.tiktokEmbed) {
      window.tiktokEmbed.lib.render();
      setEmbedReady(true);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className={`tiktok-embed-wrapper ${className}`}>
      {/* Loading State */}
      {!embedReady && (
        <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
          <div className="w-full h-64 bg-gray-200 rounded-lg mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      )}
      
      {/* TikTok Embed */}
      <div 
        ref={containerRef}
        className={`tiktok-embed-container ${embedReady ? 'opacity-100' : 'opacity-0'}`}
        dangerouslySetInnerHTML={{ __html: embedHtml }}
      />
      
      {/* Stats Section */}
      {showStats && metadata && (metadata.views || metadata.likes || metadata.comments || metadata.shares) && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              {metadata.views && (
                <div className="flex items-center space-x-1 text-gray-600">
                  <Eye className="h-4 w-4" />
                  <span>{formatNumber(metadata.views)}</span>
                </div>
              )}
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
              {metadata.shares && (
                <div className="flex items-center space-x-1 text-gray-600">
                  <Share2 className="h-4 w-4" />
                  <span>{formatNumber(metadata.shares)}</span>
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
      
      <Script 
        src="https://www.tiktok.com/embed.js" 
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />
    </div>
  );
};

export default TikTokEmbedSimple;