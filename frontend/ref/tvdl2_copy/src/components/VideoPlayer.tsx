'use client';

import React, { useState } from 'react';
import { Play, ExternalLink, Heart, Clock, Share2 } from 'lucide-react';
import Image from 'next/image';
import { cleanTikTokThumbnailUrl } from '@/lib/tiktok';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  platform?: string;
  metadata?: {
    views?: number;
    likes?: number;
    duration?: string;
    [key: string]: any;
  };
  className?: string;
  showStats?: boolean;
  autoPlay?: boolean;
  compact?: boolean;
}

export default function VideoPlayer({
  videoUrl,
  thumbnail,
  title,
  description,
  platform = 'unknown',
  metadata = {},
  className = '',
  showStats = true,
  autoPlay = false,
  compact = false
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showEmbed, setShowEmbed] = useState(autoPlay);
  const [imageError, setImageError] = useState(false);

  // Get platform info
  const getPlatformInfo = (url: string, platformHint?: string) => {
    if (platformHint) {
      return {
        name: platformHint.charAt(0).toUpperCase() + platformHint.slice(1),
        color: getPlatformColor(platformHint)
      };
    }

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return { name: 'YouTube', color: 'bg-red-500' };
    }
    if (url.includes('tiktok.com')) {
      return { name: 'TikTok', color: 'bg-black' };
    }
    if (url.includes('vimeo.com')) {
      return { name: 'Vimeo', color: 'bg-blue-500' };
    }
    return { name: 'Video', color: 'bg-gray-500' };
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube': return 'bg-red-500';
      case 'tiktok': return 'bg-black';
      case 'vimeo': return 'bg-blue-500';
      case 'dailymotion': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Get embed URL
  const getEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('watch?v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0`;
    }

    // TikTok - Use original URL for now (TikTok embed is complex)
    if (url.includes('tiktok.com')) {
      return url;
    }

    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop()?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=${autoPlay ? 1 : 0}`;
    }

    return url;
  };

  const platformInfo = getPlatformInfo(videoUrl, platform);
  const embedUrl = getEmbedUrl(videoUrl);
  const canEmbed = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com');
  
  // Clean thumbnail URL for TikTok
  const cleanThumbnail = thumbnail && platform === 'tiktok' ? cleanTikTokThumbnailUrl(thumbnail) : thumbnail;

  const handlePlay = () => {
    try {
      if (canEmbed) {
        setShowEmbed(true);
        setIsPlaying(true);
      } else {
        // Open in new tab for platforms that don't support embedding (including TikTok)
        window.open(videoUrl, '_blank');
      }
    } catch (error) {
      console.error('Error playing video:', error);
    }
  };

  const handleOpenOriginal = () => {
    try {
      window.open(videoUrl, '_blank');
    } catch (error) {
      console.error('Error opening original video:', error);
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
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Video Player Area */}
      <div className={`relative bg-gray-900 ${
        platform === 'tiktok' 
          ? compact ? 'aspect-[9/16] max-w-xs' : 'aspect-[9/16] max-w-sm mx-auto'
          : compact ? 'aspect-video' : 'aspect-video'
      }`}>
        {showEmbed && canEmbed ? (
          // Embedded video
          <iframe
            src={embedUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || 'Video Player'}
          />
        ) : (
          // Thumbnail with play button
          <div className="relative w-full h-full group cursor-pointer" onClick={handlePlay}>
            {cleanThumbnail && !imageError ? (
              <Image
                src={cleanThumbnail}
                alt={title || 'Video thumbnail'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={(e) => {
                  console.error('Video thumbnail failed to load:', cleanThumbnail);
                  setImageError(true);
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <Play className="h-16 w-16 text-white/50" />
              </div>
            )}
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className={`bg-white/90 hover:bg-white rounded-full ${compact ? 'p-2' : 'p-4'} transform group-hover:scale-110 transition-transform shadow-lg`}>
                <Play className={`${compact ? 'h-4 w-4' : 'h-8 w-8'} text-gray-900 ml-1`} />
              </div>
            </div>

            {/* Platform Badge */}
            <div className="absolute top-3 left-3">
              <div className={`${platformInfo.color} text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1`}>
                <Play className="h-3 w-3" />
                <span>{platformInfo.name}</span>
              </div>
            </div>

            {/* Duration Badge */}
            {metadata.duration && (
              <div className="absolute bottom-3 right-3">
                <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{metadata.duration}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className={compact ? "p-3" : "p-4"}>
        {/* Title */}
        {title && (
          <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${compact ? 'text-sm' : 'text-base'}`}>
            {title}
          </h3>
        )}

        {/* Description */}
        {description && !compact && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {description}
          </p>
        )}

        {/* Stats */}
        {showStats && metadata.likes && (
          <div className="flex items-center space-x-4 mb-3 text-sm text-gray-500">
            {metadata.likes && (
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{formatNumber(metadata.likes)} likes</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className={`flex items-center ${compact ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center ${compact ? 'space-x-1' : 'space-x-2'}`}>
            {!showEmbed && (
              <button
                onClick={handlePlay}
                className={`bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center transition-colors ${
                  compact ? 'px-2 py-1 text-xs space-x-1' : 'px-4 py-2 text-sm space-x-2'
                }`}
              >
                <Play className="h-3 w-3" />
                <span>{compact ? 'Xem' : 'Xem video'}</span>
              </button>
            )}
            
            <button
              onClick={handleOpenOriginal}
              className={`bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center transition-colors ${
                compact ? 'px-2 py-1 text-xs space-x-1' : 'px-4 py-2 text-sm space-x-2'
              }`}
            >
              <ExternalLink className="h-3 w-3" />
              <span>{compact ? 'Gốc' : 'Mở gốc'}</span>
            </button>
          </div>

          {!compact && (
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: title || 'Video',
                    url: videoUrl
                  });
                } else {
                  navigator.clipboard.writeText(videoUrl);
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Chia sẻ"
            >
              <Share2 className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}