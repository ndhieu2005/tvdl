'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Video, Loader2 } from 'lucide-react';

interface VideoThumbnailSimpleProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onError?: () => void;
  onLoad?: () => void;
}

export default function VideoThumbnailSimple({ 
  src, 
  alt, 
  className = '', 
  width = 200, 
  height = 200,
  onError,
  onLoad
}: VideoThumbnailSimpleProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        setError(true);
        setLoading(false);
        return;
      }

      canvas.width = width;
      canvas.height = height;
      
      // Set video to first frame
      video.currentTime = 0.1;
      
      const handleSeeked = () => {
        try {
          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, width, height);
          
          // Get data URL
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setThumbnail(dataUrl);
          setLoading(false);
          onLoad?.();
        } catch (err) {
          console.error('Error capturing video frame:', err);
          setError(true);
          setLoading(false);
          onError?.();
        }
      };

      video.addEventListener('seeked', handleSeeked, { once: true });
    };

    const handleError = () => {
      setError(true);
      setLoading(false);
      onError?.();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    video.addEventListener('error', handleError, { once: true });

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
    };
  }, [src, width, height]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error || !thumbnail) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <Video className="h-8 w-8 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500">VIDEO</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img 
        src={thumbnail} 
        alt={alt}
        className="w-full h-full object-cover rounded"
      />
      
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded">
        <div className="bg-white bg-opacity-90 rounded-full p-2">
          <Play className="h-4 w-4 text-gray-700 ml-0.5" />
        </div>
      </div>
      
      {/* Hidden video for thumbnail generation */}
      <video
        ref={videoRef}
        src={src}
        style={{ display: 'none' }}
        muted
        preload="metadata"
        playsInline
      />
    </div>
  );
}