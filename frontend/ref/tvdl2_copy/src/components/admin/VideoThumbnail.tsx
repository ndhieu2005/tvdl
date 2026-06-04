'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, AlertCircle } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';

interface VideoThumbnailProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onThumbnailGenerated?: (thumbnail: string) => void;
}

export default function VideoThumbnail({ 
  src, 
  alt, 
  className = '', 
  width = 200, 
  height = 200,
  onThumbnailGenerated 
}: VideoThumbnailProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        console.log('🎥 VideoThumbnail: Starting to generate thumbnail for:', src);
        setLoading(true);
        setError(false);
        
        // Wait a bit for refs to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (!video || !canvas) {
          console.error('🎥 VideoThumbnail: Video or canvas ref not available');
          setError(true);
          setLoading(false);
          return;
        }
        
        // Set video properties for better compatibility
        video.preload = 'metadata';
        video.muted = true;
        // Don't set crossOrigin for now to avoid CORS issues
        
        console.log('🎥 VideoThumbnail: Setting video source...');
        
        // Wait for video to load metadata
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video load timeout'));
          }, 10000); // 10 second timeout
          
          video.onloadedmetadata = () => {
            clearTimeout(timeout);
            console.log('🎥 VideoThumbnail: Video metadata loaded:', {
              duration: video.duration,
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight
            });
            resolve(void 0);
          };
          
          video.onerror = (e) => {
            clearTimeout(timeout);
            console.error('🎥 VideoThumbnail: Video loading error:', e);
            reject(e);
          };
          
          video.src = src;
        });
        
        // Set video to first frame and wait for it to be ready
        video.currentTime = 0.1; // Set to 0.1 seconds instead of 0 for better frame capture
        
        // Wait for seeked event
        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('🎥 VideoThumbnail: Seeked event timeout, proceeding anyway');
            resolve(void 0);
          }, 5000);
          
          video.onseeked = () => {
            clearTimeout(timeout);
            console.log('🎥 VideoThumbnail: Video seeked to frame 0.1');
            resolve(void 0);
          };
        });
        
        // Small delay to ensure frame is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Draw video frame to canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('🎥 VideoThumbnail: Cannot get canvas context');
          return;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Calculate aspect ratio to maintain proportions
        const videoAspect = video.videoWidth / video.videoHeight;
        const canvasAspect = width / height;
        
        let drawWidth = width;
        let drawHeight = height;
        let offsetX = 0;
        let offsetY = 0;
        
        if (videoAspect > canvasAspect) {
          // Video is wider than canvas
          drawHeight = width / videoAspect;
          offsetY = (height - drawHeight) / 2;
        } else {
          // Video is taller than canvas
          drawWidth = height * videoAspect;
          offsetX = (width - drawWidth) / 2;
        }
        
        // Clear canvas with black background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        
        // Draw video frame
        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
        
        // Convert to data URL
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        console.log('🎥 VideoThumbnail: Thumbnail generated successfully');
        setThumbnail(thumbnailDataUrl);
        
        // Callback with thumbnail
        if (onThumbnailGenerated) {
          onThumbnailGenerated(thumbnailDataUrl);
        }
        
      } catch (err) {
        console.error('🎥 VideoThumbnail: Error generating video thumbnail:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    let isCancelled = false;
    
    if (src) {
      generateThumbnail().catch(err => {
        if (!isCancelled) {
          console.error('🎥 VideoThumbnail: Thumbnail generation failed:', err);
          setError(true);
          setLoading(false);
        }
      });
    }
    
    // Cleanup function
    return () => {
      isCancelled = true;
    };
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
      <div className={`relative ${className}`}>
        <img 
          src={placeholderImages.videoPlaceholder} 
          alt={alt}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white bg-opacity-90 rounded-full p-2">
            <Play className="h-6 w-6 text-gray-700 ml-1" />
          </div>
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
      
      {/* Hidden video and canvas for thumbnail generation */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        muted
        preload="metadata"
        playsInline
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
      
      {/* Fallback: Show actual video element if thumbnail fails */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            src={src}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Cpolygon points='70,60 70,140 130,100' fill='%236b7280'/%3E%3C/svg%3E"
          />
        </div>
      )}
    </div>
  );
}