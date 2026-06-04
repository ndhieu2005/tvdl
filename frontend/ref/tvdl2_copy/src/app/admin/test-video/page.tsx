'use client';

import React, { useState } from 'react';
import VideoThumbnail from '@/components/admin/VideoThumbnail';
import { Upload } from 'lucide-react';

export default function TestVideoPage() {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Video Thumbnail</h1>
      
      <div className="space-y-6">
        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <label htmlFor="video-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload a video file to test thumbnail generation
                </span>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Video Info */}
        {videoFile && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Video Information:</h3>
            <p>Name: {videoFile.name}</p>
            <p>Type: {videoFile.type}</p>
            <p>Size: {(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <p>URL: {videoUrl}</p>
          </div>
        )}

        {/* Video Thumbnail Test */}
        {videoUrl && (
          <div className="space-y-4">
            <h3 className="font-medium">Generated Thumbnail:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Small (100x100)</h4>
                <VideoThumbnail
                  src={videoUrl}
                  alt="Test video thumbnail"
                  className="w-full max-w-[100px] h-[100px] border rounded"
                  width={100}
                  height={100}
                />
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Medium (200x200)</h4>
                <VideoThumbnail
                  src={videoUrl}
                  alt="Test video thumbnail"
                  className="w-full max-w-[200px] h-[200px] border rounded"
                  width={200}
                  height={200}
                />
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Large (300x300)</h4>
                <VideoThumbnail
                  src={videoUrl}
                  alt="Test video thumbnail"
                  className="w-full max-w-[300px] h-[300px] border rounded"
                  width={300}
                  height={300}
                />
              </div>
            </div>
          </div>
        )}

        {/* Raw Video Element for Comparison */}
        {videoUrl && (
          <div className="space-y-4">
            <h3 className="font-medium">Raw Video Element:</h3>
            <video
              src={videoUrl}
              controls
              className="w-full max-w-md h-auto border rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
}