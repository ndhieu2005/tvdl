'use client';

import React, { useEffect, useRef, useState } from 'react';
import { extractTikTokVideoId, extractTikTokUsername, normalizeTikTokUrl } from '@/lib/tiktok';
import { Heart, MessageCircle, Play, Pause } from 'lucide-react';

interface TikTokEmbedAdvancedProps {
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

declare global {
  interface Window {
    tiktokEmbed?: any;
  }
}

const TikTokEmbedAdvanced: React.FC<TikTokEmbedAdvancedProps> = ({ 
  videoUrl, 
  className = '', 
  compact = false,
  metadata,
  showStats = false
}) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [embedReady, setEmbedReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  
  const videoId = extractTikTokVideoId(videoUrl);
  const username = extractTikTokUsername(videoUrl);
  const normalizedUrl = normalizeTikTokUrl(videoUrl);

  useEffect(() => {
    let isMounted = true;
    
    const loadTikTokScript = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
      
      if (existingScript) {
        setScriptLoaded(true);
        renderEmbed();
        return;
      }

      // Create new script
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (isMounted) {
          setScriptLoaded(true);
          renderEmbed();
        }
      };
      
      script.onerror = () => {
        console.error('Failed to load TikTok embed script');
      };
      
      document.head.appendChild(script);
      scriptRef.current = script;
    };

    const renderEmbed = () => {
      if (!containerRef.current) return;
      
      const timer = setTimeout(() => {
        if (window.tiktokEmbed && window.tiktokEmbed.lib) {
          window.tiktokEmbed.lib.render();
          if (isMounted) {
            setEmbedReady(true);
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
    };

    loadTikTokScript();

    return () => {
      isMounted = false;
    };
  }, [videoUrl]);

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

  const embedHtml = `
    <blockquote 
      class="tiktok-embed" 
      cite="${normalizedUrl}" 
      data-video-id="${videoId}" 
      data-embed-from="embed_page"
      style="max-width: ${compact ? '325px' : '605px'}; min-width: 325px; margin: 0 auto;"
    >
      <section>
        <a 
          target="_blank" 
          title="@${username}" 
          href="https://www.tiktok.com/@${username}?refer=embed"
        >
          @${username}
        </a>
        <p>
          <a 
            target="_blank" 
            title="TikTok Video" 
            href="${normalizedUrl}?refer=embed"
          >
            Video TikTok
          </a>
        </p>
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

  return (
    <div className={`tiktok-embed-wrapper relative ${className}`}>
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
        className={`tiktok-embed-container transition-opacity duration-300 ${
          embedReady ? 'opacity-100' : 'opacity-0'
        }`}
        dangerouslySetInnerHTML={{ __html: embedHtml }}
      />
      
      {/* Custom Controls Overlay */}
      {embedReady && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-black bg-opacity-50 text-white rounded-full p-2 pointer-events-auto hover:bg-opacity-70 transition-all"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
          
          <div className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
            @{username}
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

export default TikTokEmbedAdvanced;