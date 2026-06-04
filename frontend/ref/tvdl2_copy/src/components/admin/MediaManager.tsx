'use client';

import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  Upload, 
  X, 
  Eye, 
  Trash2,
  Link,
  Plus,
  ExternalLink
} from 'lucide-react';
import MediaUploader from './MediaUploader';
import VideoEmbedModal from './VideoEmbedModal';

interface MediaManagerProps {
  featuredImage?: string;
  featuredVideo?: string;
  onImageChange: (url: string) => void;
  onVideoChange: (url: string) => void;
  className?: string;
}

export default function MediaManager({ 
  featuredImage = '', 
  featuredVideo = '', 
  onImageChange, 
  onVideoChange,
  className = "" 
}: MediaManagerProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoExtractedData, setVideoExtractedData] = useState<{
    title: string;
    description: string;
    thumbnailUrl: string;
    platform: string;
  } | null>(null);
  const [isVideoExtracting, setIsVideoExtracting] = useState(false);

  const handleImageUpload = (url: string) => {
    onImageChange(url);
    setShowMediaUploader(false);
  };

  const handleVideoSelect = (url: string) => {
    onVideoChange(url);
    setShowVideoModal(false);
  };

  const addImageFromUrl = () => {
    if (imageUrl.trim()) {
      onImageChange(imageUrl.trim());
      setImageUrl('');
    }
  };

  const addVideoFromUrl = () => {
    if (videoUrl.trim()) {
      onVideoChange(videoUrl.trim());
      setVideoUrl('');
    }
  };

  // Extract video info when URL changes
  React.useEffect(() => {
    const extractVideoInfo = async () => {
      if (!videoUrl.trim()) {
        setVideoExtractedData(null);
        return;
      }

      // Only extract for supported platforms
      const isSupported = videoUrl.includes('youtube.com') || 
                         videoUrl.includes('youtu.be') || 
                         videoUrl.includes('tiktok.com');

      if (!isSupported) {
        setVideoExtractedData(null);
        return;
      }

      setIsVideoExtracting(true);

      try {
        const response = await fetch('/api/extract-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: videoUrl }),
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setVideoExtractedData(result.data);
        } else {
          setVideoExtractedData(null);
        }
      } catch (error) {
        console.error('Error extracting video info:', error);
        setVideoExtractedData(null);
      } finally {
        setIsVideoExtracting(false);
      }
    };

    const timeoutId = setTimeout(extractVideoInfo, 1000); // Debounce
    return () => clearTimeout(timeoutId);
  }, [videoUrl]);

  const getVideoPreview = (url: string) => {
    if (!url) return null;
    
    // YouTube URL preview
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    
    // TikTok URL preview
    if (url.includes('tiktok.com')) {
      return null; // TikTok doesn't provide thumbnail URLs easily
    }
    
    return null;
  };

  const removeImage = () => {
    onImageChange('');
  };

  const removeVideo = () => {
    onVideoChange('');
  };

  const isVideoUrl = (url: string) => {
    return url.includes('youtube.com') || 
           url.includes('youtu.be') || 
           url.includes('tiktok.com') ||
           url.includes('vimeo.com') ||
           url.includes('.mp4') ||
           url.includes('.webm') ||
           url.includes('.mov') ||
           url.includes('.avi');
  };

  const tabs = [
    { id: 'image', name: 'Hình ảnh', icon: ImageIcon },
    { id: 'video', name: 'Video', icon: Video }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Media</h3>
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'image' | 'video')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 sm:flex-none justify-center ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Image Tab */}
        {activeTab === 'image' && (
          <div className="space-y-4 min-h-0">
            {featuredImage ? (
              <div className="relative">
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => window.open(featuredImage, '_blank')}
                    className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-2 bg-red-500 bg-opacity-80 text-white rounded-full hover:bg-opacity-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4 text-sm">Chưa có hình ảnh đại diện</p>
                <div className="flex flex-col sm:flex-row justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMediaUploader(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Tải lên</span>
                  </button>
                </div>
              </div>
            )}

            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hoặc nhập URL hình ảnh
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                
                {/* Preview cho image URL */}
                {imageUrl && imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="relative aspect-video bg-gray-100">
                      <img
                        src={imageUrl}
                        alt="Image preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={addImageFromUrl}
                  disabled={!imageUrl.trim()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Link className="h-4 w-4" />
                  <span>Thêm URL</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            {featuredImage && (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setShowMediaUploader(true)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Upload className="h-4 w-4" />
                  <span>Thay đổi</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Video Tab */}
        {activeTab === 'video' && (
          <div className="space-y-4 min-h-0">
            {featuredVideo ? (
              <div className="relative">
                {isVideoUrl(featuredVideo) ? (
                  <div className="relative">
                    {getVideoPreview(featuredVideo) ? (
                      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={getVideoPreview(featuredVideo) || ''}
                          alt="Video preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                            <Video className="h-8 w-8 text-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {featuredVideo.includes('youtube.com') || featuredVideo.includes('youtu.be') ? 'YouTube' :
                           featuredVideo.includes('tiktok.com') ? 'TikTok' :
                           featuredVideo.includes('vimeo.com') ? 'Vimeo' : 'Video'}
                        </div>
                      </div>
                    ) : featuredVideo.includes('tiktok.com') ? (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">TikTok Video</p>
                          <p className="text-gray-400 text-xs mt-1">Click để xem</p>
                        </div>
                      </div>
                    ) : featuredVideo.includes('vimeo.com') ? (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Vimeo Video</p>
                          <p className="text-gray-400 text-xs mt-1">Click để xem</p>
                        </div>
                      </div>
                    ) : (
                      <video
                        src={featuredVideo}
                        className="w-full aspect-video object-cover rounded-lg"
                        controls
                        preload="metadata"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        type="button"
                        onClick={() => window.open(featuredVideo, '_blank')}
                        className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="p-2 bg-red-500 bg-opacity-80 text-white rounded-full hover:bg-opacity-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Video URL:</p>
                    <p className="text-sm text-gray-900 break-all">{featuredVideo}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4 text-sm">Chưa có video đại diện</p>
                <div className="flex flex-col sm:flex-row justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Thêm Video</span>
                  </button>
                </div>
              </div>
            )}

            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hoặc nhập URL video
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... hoặc https://tiktok.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                
                {/* Preview cho video URL */}
                {videoUrl && isVideoUrl(videoUrl) && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {isVideoExtracting ? (
                      <div className="aspect-video bg-blue-50 flex items-center justify-center">
                        <div className="text-center">
                          <Video className="h-12 w-12 text-blue-500 mx-auto mb-2 animate-pulse" />
                          <p className="text-sm text-blue-600">Đang tải thông tin video...</p>
                        </div>
                      </div>
                    ) : videoExtractedData?.thumbnailUrl ? (
                      <div className="relative aspect-video bg-gray-100">
                        <img
                          src={videoExtractedData.thumbnailUrl}
                          alt="Video preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                            <Video className="h-6 w-6 text-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {videoExtractedData.platform}
                        </div>
                      </div>
                    ) : getVideoPreview(videoUrl) ? (
                      <div className="relative aspect-video bg-gray-100">
                        <img
                          src={getVideoPreview(videoUrl) || ''}
                          alt="Video preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                            <Video className="h-6 w-6 text-white ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            {videoUrl.includes('tiktok.com') ? 'TikTok Video' : 
                             videoUrl.includes('vimeo.com') ? 'Vimeo Video' : 
                             'Video Preview'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={addVideoFromUrl}
                  disabled={!videoUrl.trim()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Link className="h-4 w-4" />
                  <span>Thêm URL</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Hỗ trợ: YouTube, TikTok, Vimeo, MP4, WebM, MOV, AVI
              </p>
            </div>

            {/* Actions */}
            {featuredVideo && (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Thay đổi</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Uploader Modal */}
      {showMediaUploader && (
        <MediaUploader
          onClose={() => setShowMediaUploader(false)}
          onSelect={handleImageUpload}
        />
      )}

      {/* Video Embed Modal */}
      {showVideoModal && (
        <VideoEmbedModal
          onClose={() => setShowVideoModal(false)}
          onEmbed={handleVideoSelect}
        />
      )}
    </div>
  );
}