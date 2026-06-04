'use client';

import React from 'react';
import { Play, ExternalLink, Eye, Heart, Clock, Youtube, Music } from 'lucide-react';
import Image from 'next/image';

interface VideoPreviewProps {
  videoUrl?: string;
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
}

export default function VideoPreview({
  videoUrl,
  thumbnail,
  title,
  description,
  platform,
  metadata = {},
  className = ''
}: VideoPreviewProps) {
  if (!videoUrl) {
    return (
      <div className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <Play className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <p className="text-gray-500 font-medium">Chưa có video</p>
            <p className="text-gray-400 text-sm">Thêm URL video để xem preview</p>
          </div>
        </div>
      </div>
    );
  }

  // Get platform info
  const getPlatformInfo = (url: string, platformHint?: string) => {
    if (platformHint) {
      return {
        name: platformHint.charAt(0).toUpperCase() + platformHint.slice(1),
        color: getPlatformColor(platformHint),
        icon: getPlatformIcon(platformHint)
      };
    }

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return { name: 'YouTube', color: 'bg-red-500', icon: Youtube };
    }
    if (url.includes('tiktok.com')) {
      return { name: 'TikTok', color: 'bg-black', icon: Music };
    }
    if (url.includes('vimeo.com')) {
      return { name: 'Vimeo', color: 'bg-blue-500', icon: Play };
    }
    return { name: 'Video', color: 'bg-gray-500', icon: Play };
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

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube': return Youtube;
      case 'tiktok': return Music;
      default: return Play;
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

  const handleOpenOriginal = () => {
    window.open(videoUrl, '_blank');
  };

  const platformInfo = getPlatformInfo(videoUrl, platform);
  const PlatformIcon = platformInfo.icon;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm ${className}`}>
      {/* Preview Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Play className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Video Preview</p>
              <p className="text-gray-500 text-xs">Xem trước video trong bài viết</p>
            </div>
          </div>
          <button
            onClick={handleOpenOriginal}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Mở gốc</span>
          </button>
        </div>
      </div>

      {/* Video Thumbnail */}
      <div className={`relative bg-gray-900 ${
        platform === 'tiktok' 
          ? 'aspect-[9/16] max-w-xs mx-auto' 
          : 'aspect-video'
      }`}>
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title || 'Video thumbnail'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={true}
            onError={(e) => {
              console.error('VideoPreview - Image load error:', e);
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <PlatformIcon className="h-16 w-16 text-white/30" />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-3 shadow-lg">
            <Play className="h-6 w-6 text-gray-900 ml-0.5" />
          </div>
        </div>

        {/* Platform Badge */}
        <div className="absolute top-3 left-3">
          <div className={`${platformInfo.color} text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1`}>
            <PlatformIcon className="h-3 w-3" />
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

      {/* Video Info */}
      <div className="p-4">
        {/* Title */}
        {title && (
          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h4>
        )}

        {/* Description */}
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Stats */}
        {(metadata.views || metadata.likes) && (
          <div className="flex items-center space-x-4 mb-3 text-sm text-gray-500">
            {metadata.views && (
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{formatNumber(metadata.views)} lượt xem</span>
              </div>
            )}
            {metadata.likes && (
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{formatNumber(metadata.likes)} lượt thích</span>
              </div>
            )}
          </div>
        )}

        {/* URL Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Video URL:</p>
          <p className="text-sm text-gray-700 font-mono break-all">
            {videoUrl}
          </p>
        </div>
      </div>
    </div>
  );
}