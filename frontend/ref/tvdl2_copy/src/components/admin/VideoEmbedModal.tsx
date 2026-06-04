'use client';

import React, { useState } from 'react';
import { X, Play, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';

interface VideoEmbedModalProps {
  onClose: () => void;
  onEmbed: (url: string) => void;
}

export default function VideoEmbedModal({ onClose, onEmbed }: VideoEmbedModalProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [embedType, setEmbedType] = useState<'url' | 'embed'>('url');
  const [embedCode, setEmbedCode] = useState('');
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    title: string;
    description: string;
    thumbnailUrl: string;
    platform: string;
  } | null>(null);
  
  // Extract video info when URL changes
  React.useEffect(() => {
    const extractVideoInfo = async () => {
      if (!videoUrl.trim()) {
        setExtractedData(null);
        return;
      }

      // Only extract for supported platforms
      const isSupported = videoUrl.includes('youtube.com') || 
                         videoUrl.includes('youtu.be') || 
                         videoUrl.includes('tiktok.com');

      if (!isSupported) {
        setExtractedData(null);
        return;
      }

      setIsExtracting(true);
      setThumbnailError(false);

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
          setExtractedData(result.data);
        } else {
          setExtractedData(null);
        }
      } catch (error) {
        console.error('Error extracting video info:', error);
        setExtractedData(null);
      } finally {
        setIsExtracting(false);
      }
    };

    const timeoutId = setTimeout(extractVideoInfo, 1000); // Debounce
    return () => clearTimeout(timeoutId);
  }, [videoUrl]);

  const handleEmbed = () => {
    if (embedType === 'url' && videoUrl.trim()) {
      onEmbed(videoUrl.trim());
    } else if (embedType === 'embed' && embedCode.trim()) {
      onEmbed(embedCode.trim());
    }
  };

  const getVideoPreview = (url: string) => {
    if (!url) return null;
    
    // YouTube thumbnail
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }
      if (videoId) {
        // Try maxresdefault first
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    
    // Vimeo thumbnail (basic implementation)
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop()?.split('?')[0];
      if (videoId) {
        // We'll use a placeholder for Vimeo for now
        return null;
      }
    }
    
    return null;
  };

  const getFallbackThumbnail = (url: string) => {
    if (!url) return null;
    
    // YouTube fallback thumbnail
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }
      if (videoId) {
        // Fallback to hqdefault
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }
    
    return null;
  };

  const getVideoInfo = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }
      return {
        platform: 'YouTube',
        id: videoId,
        url: url,
        thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
      };
    }
    
    if (url.includes('tiktok.com')) {
      return {
        platform: 'TikTok',
        id: url.split('/').pop()?.split('?')[0] || '',
        url: url,
        thumbnail: null
      };
    }
    
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop()?.split('?')[0] || '';
      return {
        platform: 'Vimeo',
        id: videoId,
        url: url,
        thumbnail: null
      };
    }
    
    return {
      platform: 'Video',
      id: '',
      url: url,
      thumbnail: null
    };
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

  const previewImage = extractedData?.thumbnailUrl || (videoUrl ? getVideoPreview(videoUrl) : null);
  const videoInfo = extractedData || (videoUrl ? getVideoInfo(videoUrl) : null);
  
  // Debug info
  console.log('VideoEmbedModal Debug:', {
    videoUrl,
    previewImage,
    videoInfo,
    extractedData,
    thumbnailError,
    isExtracting
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Background overlay với hiệu ứng blur */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/40 to-indigo-900/50"
        style={{
          backdropFilter: 'blur(16px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.8)',
        }}
      />
      
      {/* Modal container với hiệu ứng glass morphism */}
      <div 
        className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden max-w-2xl w-full h-[90vh] my-auto mx-auto"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
          boxShadow: '0 32px 64px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}
      >
        {/* Highlight ánh sáng */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3), transparent 50%)',
          }}
        />
        
        {/* Content với nền trắng mờ - flex column để layout cố định */}
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-900">Nhúng Video</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100/50 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Content - scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100/70 backdrop-blur-sm p-1 rounded-lg border border-gray-200/50">
                <button
                  type="button"
                  onClick={() => setEmbedType('url')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    embedType === 'url'
                      ? 'bg-white/90 text-gray-900 shadow-sm backdrop-blur-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/30'
                  }`}
                >
                  <LinkIcon className="h-4 w-4 inline mr-2" />
                  URL Video
                </button>
                <button
                  type="button"
                  onClick={() => setEmbedType('embed')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    embedType === 'embed'
                      ? 'bg-white/90 text-gray-900 shadow-sm backdrop-blur-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/30'
                  }`}
                >
                  <Play className="h-4 w-4 inline mr-2" />
                  Mã Embed
                </button>
              </div>

              {embedType === 'url' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Video
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... hoặc https://www.tiktok.com/@username/video/..."
                      className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 bg-white/70 backdrop-blur-sm transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Hỗ trợ: YouTube, TikTok, Vimeo, Dailymotion
                    </p>
                  </div>

              {/* Preview */}
              {videoUrl && isVideoUrl(videoUrl) && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Xem trước
                  </label>
                  
                  {/* Video Info */}
                  {isExtracting && (
                    <div className="bg-blue-50/70 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500 animate-pulse">
                          <Play className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-900 text-sm">Đang trích xuất thông tin...</p>
                          <p className="text-xs text-blue-600">Vui lòng chờ...</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isExtracting && videoInfo && (
                    <div className="bg-gray-50/70 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            videoInfo.platform === 'youtube' ? 'bg-red-500' :
                            videoInfo.platform === 'tiktok' ? 'bg-black' :
                            videoInfo.platform === 'YouTube' ? 'bg-red-500' :
                            videoInfo.platform === 'TikTok' ? 'bg-black' :
                            videoInfo.platform === 'Vimeo' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}>
                            <Play className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {extractedData?.title || videoInfo.platform}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">
                              {'url' in videoInfo ? videoInfo.url : videoUrl}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {videoInfo.platform === 'youtube' && 'id' in videoInfo && videoInfo.id && `ID: ${videoInfo.id.slice(0, 8)}...`}
                          {videoInfo.platform === 'tiktok' && 'Video embed'}
                          {videoInfo.platform === 'YouTube' && 'id' in videoInfo && videoInfo.id && `ID: ${videoInfo.id.slice(0, 8)}...`}
                          {videoInfo.platform === 'TikTok' && 'Video embed'}
                          {videoInfo.platform === 'Vimeo' && 'id' in videoInfo && videoInfo.id && `ID: ${videoInfo.id}`}
                        </div>
                      </div>
                      {/* Debug info */}
                      {previewImage && (
                        <div className="mt-2 text-xs text-gray-400">
                          <p>Thumbnail: {previewImage}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Preview Image */}
                  <div className="relative w-full aspect-video bg-gray-100/70 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-200/50 shadow-lg">
                    {isExtracting ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-3 mx-auto animate-pulse">
                            <Play className="h-8 w-8 text-white ml-1" />
                          </div>
                          <p className="text-blue-600 text-sm font-medium">Đang tải...</p>
                          <p className="text-blue-400 text-xs mt-1">Trích xuất thông tin video</p>
                        </div>
                      </div>
                    ) : previewImage && !thumbnailError ? (
                      <>
                        <img
                          src={previewImage}
                          alt="Video preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('Primary thumbnail load error:', previewImage);
                            const fallbackUrl = getFallbackThumbnail(videoUrl);
                            if (fallbackUrl && previewImage !== fallbackUrl) {
                              console.log('Trying fallback thumbnail:', fallbackUrl);
                              (e.target as HTMLImageElement).src = fallbackUrl;
                            } else {
                              console.log('No fallback available, showing placeholder');
                              setThumbnailError(true);
                            }
                          }}
                          onLoad={() => {
                            console.log('Thumbnail loaded successfully:', previewImage);
                            setThumbnailError(false);
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                            <Play className="h-8 w-8 text-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                          {extractedData?.platform || videoInfo?.platform}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 mx-auto ${
                            videoInfo?.platform === 'youtube' ? 'bg-red-500' :
                            videoInfo?.platform === 'tiktok' ? 'bg-black' :
                            videoInfo?.platform === 'YouTube' ? 'bg-red-500' :
                            videoInfo?.platform === 'TikTok' ? 'bg-black' :
                            videoInfo?.platform === 'Vimeo' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}>
                            <Play className="h-8 w-8 text-white ml-1" />
                          </div>
                          <p className="text-gray-600 text-sm font-medium">
                            {extractedData?.platform || videoInfo?.platform || 'Video'}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">Preview not available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã Embed HTML
                </label>
                <textarea
                  value={embedCode}
                  onChange={(e) => setEmbedCode(e.target.value)}
                  rows={6}
                  placeholder='<iframe src="..." width="560" height="315" frameborder="0" allowfullscreen></iframe>'
                  className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 bg-white/70 backdrop-blur-sm transition-all duration-200 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dán mã embed HTML từ nền tảng video
                </p>
              </div>
              
              {/* Preview for embed code */}
              {embedCode && embedCode.includes('iframe') && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Xem trước Embed
                  </label>
                  <div className="bg-gray-50/70 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Play className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">HTML Embed</p>
                          <p className="text-xs text-gray-500">Mã embed tùy chỉnh</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {embedCode.length} chars
                      </div>
                    </div>
                  </div>
                  <div className="relative w-full aspect-video bg-gray-100/70 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-200/50 shadow-lg">
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-3 mx-auto">
                          <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                        <p className="text-gray-600 text-sm font-medium">HTML Embed Code</p>
                        <p className="text-gray-400 text-xs mt-1">Sẽ được nhúng vào bài viết</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

            {/* Popular Platforms */}
            <div className="bg-gray-50/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Nền tảng được hỗ trợ:</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">YouTube</p>
                    <p className="text-xs text-gray-500">Sao chép URL từ thanh địa chỉ hoặc nút Share</p>
                    <p className="text-xs text-gray-400 mt-1">Ví dụ: youtube.com/watch?v=dQw4w9WgXcQ</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">TikTok</p>
                    <p className="text-xs text-gray-500">Sao chép link từ nút Share</p>
                    <p className="text-xs text-gray-400 mt-1">Ví dụ: tiktok.com/@username/video/123456789</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Vimeo</p>
                    <p className="text-xs text-gray-500">URL video hoặc mã embed</p>
                    <p className="text-xs text-gray-400 mt-1">Ví dụ: vimeo.com/123456789</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gray-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">File Video</p>
                    <p className="text-xs text-gray-500">Link trực tiếp tới file video</p>
                    <p className="text-xs text-gray-400 mt-1">Định dạng: MP4, WebM, MOV, AVI</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - cố định */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200/50 flex-shrink-0 bg-white/90 backdrop-blur-sm">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100/70 hover:bg-gray-200/70 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleEmbed}
              disabled={
                (embedType === 'url' && !videoUrl.trim()) ||
                (embedType === 'embed' && !embedCode.trim())
              }
              className="px-4 py-2 bg-purple-600/90 text-white rounded-lg hover:bg-purple-700/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm shadow-lg"
            >
              Nhúng Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}