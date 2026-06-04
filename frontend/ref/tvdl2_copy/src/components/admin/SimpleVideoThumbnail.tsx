'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, AlertCircle } from 'lucide-react';

interface SimpleVideoThumbnailProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function SimpleVideoThumbnail({ 
  src, 
  alt, 
  className = '', 
  width = 200, 
  height = 200
}: SimpleVideoThumbnailProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const generateThumbnail = () => {
      const video = videoRef.current;
      if (!video) return;
      
      console.log('🎥 SimpleVideoThumbnail: Starting to generate thumbnail for:', src);
      
      setLoading(true);
      setError(false);
      
      // Create a canvas to draw the video frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('🎥 SimpleVideoThumbnail: Cannot get canvas context');
        setError(true);
        setLoading(false);
        return;
      }
      
      const handleLoadedData = () => {
        console.log('🎥 SimpleVideoThumbnail: Video loaded data');
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Draw video frame
        ctx.drawImage(video, 0, 0, width, height);
        
        // Convert to data URL
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        console.log('🎥 SimpleVideoThumbnail: Thumbnail generated');
        
        setThumbnail(dataURL);
        setLoading(false);
      };
      
      const handleError = (e: any) => {
        console.error('🎥 SimpleVideoThumbnail: Video error:', e);
        setError(true);
        setLoading(false);
      };
      
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('error', handleError);
      
      // Clean up
      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
      };
    };
    
    if (src) {
      generateThumbnail();
    }
  }, [src, width, height]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-xs text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !thumbnail) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <Play className="h-8 w-8 text-gray-400 mx-auto mb-2" />
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
        className="w-full h-full object-cover"
      />
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white bg-opacity-90 rounded-full p-2">
          <Play className="h-6 w-6 text-gray-700 ml-1" />
        </div>
      </div>
      
      {/* Hidden video element for thumbnail generation */}
      <video
        ref={videoRef}
        src={src}
        style={{ display: 'none' }}
        muted
        preload="metadata"
        crossOrigin="anonymous"
      />
    </div>
  );
}