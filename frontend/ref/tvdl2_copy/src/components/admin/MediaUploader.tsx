'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Search, Grid, List, Loader2, RefreshCw, Video } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { mediaAPI, MediaFile, MediaResponse } from '@/lib/api/media';
import VideoThumbnail from './VideoThumbnail';
import VideoThumbnailSimple from './VideoThumbnailSimple';
import MobileImageLoader from './MobileImageLoader';
import { isIOSSafari, addIOSViewportFix } from '@/lib/ios-safari-fixes';

interface MediaUploaderProps {
  onClose: () => void;
  onSelect: (url: string) => void;
}



export default function MediaUploader({ onClose, onSelect }: MediaUploaderProps) {
  const { token } = useAuth();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'IMAGE' | 'VIDEO'>('all');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize iOS fixes
  useEffect(() => {
    const isIOS = isIOSSafari();
    setIsIOSDevice(isIOS);
    
    if (isIOS) {
      console.log('🍎 iOS Safari detected, applying fixes...');
      addIOSViewportFix();
    }
  }, []);

  // Load media files from API
  const loadMediaFiles = async (page = 1) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await mediaAPI.getMediaFiles({
        page,
        limit: pagination.limit,
        ...(filter !== 'all' && { type: filter }),
        ...(searchTerm && { search: searchTerm })
      }, token);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load media files');
      }

      setMediaFiles(response.data.files);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading media files:', error);
      setError('Không thể tải danh sách media');
    } finally {
      setLoading(false);
    }
  };

  // Load media files on component mount and when filters change
  useEffect(() => {
    loadMediaFiles();
  }, [token, filter]);

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadMediaFiles();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const filteredFiles = mediaFiles; // Files are already filtered by API

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !token) return;

    setUploading(true);
    setError(null);

    try {
      // Upload files one by one
      for (const file of Array.from(files)) {
        const response = await mediaAPI.uploadFile(file, undefined, token);
        
        if (!response.success) {
          throw new Error(response.error || `Failed to upload ${file.name}`);
        }
      }

      // Reload media files to show new uploads
      await loadMediaFiles();
      
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Lỗi khi upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.clear(); // Single selection for now
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAndClose = () => {
    const selectedFile = mediaFiles.find(file => selectedFiles.has(file.id));
    if (selectedFile) {
      // Generate URL for the selected file using API helper
      const fileUrl = mediaAPI.getFileUrl(selectedFile.id);
      onSelect(fileUrl);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Helper function to get display type for filter
  const getDisplayType = (type: string) => {
    switch(type) {
      case 'IMAGE': return 'image';
      case 'VIDEO': return 'video';
      default: return 'file';
    }
  };

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
        className={`relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden max-w-6xl w-full h-[90vh] my-auto mx-auto ${
          isIOSDevice ? 'ios-modal-fix' : ''
        }`}
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
          boxShadow: '0 32px 64px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.3)',
          ...(isIOSDevice && {
            WebkitOverflowScrolling: 'touch',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)',
          })
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
            <h2 className="text-xl font-semibold text-gray-900">Thư viện Media</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100/50 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="p-6 border-b border-gray-200/50 flex-shrink-0">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600/90 text-white rounded-lg hover:bg-purple-700/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm shadow-lg"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span>{uploading ? 'Đang tải...' : 'Tải lên'}</span>
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'IMAGE' | 'VIDEO')}
                  className="px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 bg-white/70 backdrop-blur-sm transition-all duration-200"
                >
                  <option value="all">Tất cả</option>
                  <option value="IMAGE">Hình ảnh</option>
                  <option value="VIDEO">Video</option>
                </select>

                <button
                  type="button"
                  onClick={() => loadMediaFiles(1)}
                  disabled={loading}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed bg-white/70 backdrop-blur-sm rounded-lg transition-all duration-200"
                  title="Làm mới"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm media..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 bg-white/70 backdrop-blur-sm transition-all duration-200"
                  />
                </div>

                <div className="flex rounded-lg border border-gray-300/50 overflow-hidden bg-white/70 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-all duration-200 ${viewMode === 'grid' ? 'bg-purple-100/70 text-purple-600' : 'text-gray-600 hover:bg-gray-50/70'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-all duration-200 ${viewMode === 'list' ? 'bg-purple-100/70 text-purple-600' : 'text-gray-600 hover:bg-gray-50/70'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content - scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Đang tải...</span>
              </div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có media nào được tìm thấy</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleFileSelect(file.id)}
                  className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                    selectedFiles.has(file.id)
                      ? 'border-purple-500 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-square overflow-hidden rounded-lg">
                    <MediaThumbnail 
                      file={file}
                      mediaAPI={mediaAPI}
                    />
                  </div>
                  {selectedFiles.has(file.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center">
                      ✓
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate">{file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleFileSelect(file.id)}
                  className={`flex items-center space-x-4 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedFiles.has(file.id)
                      ? 'bg-purple-50 border-purple-500'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded overflow-hidden">
                    <MediaThumbnail 
                      file={file}
                      mediaAPI={mediaAPI}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                    </p>
                  </div>
                  {selectedFiles.has(file.id) && (
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

          {/* Footer - cố định */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200/50 flex-shrink-0 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-500">
                {selectedFiles.size > 0 ? `${selectedFiles.size} tệp được chọn` : 'Chưa chọn tệp nào'}
              </p>
              {pagination.total > 0 && (
                <p className="text-sm text-gray-500">
                  Hiển thị {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} 
                  trên {pagination.total} tệp
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => loadMediaFiles(pagination.page - 1)}
                    disabled={pagination.page <= 1 || loading}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed bg-white/70 backdrop-blur-sm rounded-lg transition-all duration-200"
                  >
                    ←
                  </button>
                  <span className="text-sm text-gray-600">
                    {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    type="button"
                    onClick={() => loadMediaFiles(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages || loading}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed bg-white/70 backdrop-blur-sm rounded-lg transition-all duration-200"
                  >
                    →
                  </button>
                </div>
              )}
              
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100/70 hover:bg-gray-200/70 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSelectAndClose}
                disabled={selectedFiles.size === 0}
                className="px-4 py-2 bg-purple-600/90 text-white rounded-lg hover:bg-purple-700/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm shadow-lg"
              >
                Chọn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component riêng để handle Media Thumbnail với error handling tốt hơn cho mobile
interface MediaThumbnailProps {
  file: MediaFile;
  mediaAPI: typeof mediaAPI;
}

function MediaThumbnail({ file, mediaAPI }: MediaThumbnailProps) {
  const { token } = useAuth();
  const [imageData, setImageData] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch image data with authentication headers
  const fetchImageData = async (url: string) => {
    if (!token) {
      console.error('❌ MediaThumbnail: No token available');
      setHasError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setImageData(imageUrl);
      setIsLoading(false);
      setHasError(false);
      console.log('✅ MediaThumbnail: Image loaded successfully for', file.name);
    } catch (error) {
      console.error('🚨 MediaThumbnail: Error fetching image:', error);
      handleImageError();
    }
  };

  const handleImageError = () => {
    console.log('🚨 MediaThumbnail: Image failed to load for', file.name, 'retry count:', retryCount);
    
    if (retryCount < 2) {
      // Retry with different URLs
      setTimeout(() => {
        let retryUrl = '';
        if (retryCount === 0) {
          // First retry: try preview URL with small size
          retryUrl = `/api/admin/media/${file.id}/preview?size=small`;
        } else if (retryCount === 1) {
          // Second retry: try different preview size
          retryUrl = `/api/admin/media/${file.id}/preview?size=medium`;
        }
        setRetryCount(prev => prev + 1);
        setIsLoading(true);
        fetchImageData(retryUrl);
      }, 500);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  // Load image data when component mounts or file changes
  useEffect(() => {
    if (!token) return;

    // Use admin preview endpoint for authenticated requests
    const initialUrl = file.type === 'IMAGE' 
      ? `/api/admin/media/${file.id}/preview`
      : `/api/admin/media/${file.id}/preview`;
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);
    fetchImageData(initialUrl);

    // Cleanup blob URL when component unmounts
    return () => {
      if (imageData) {
        URL.revokeObjectURL(imageData);
      }
    };
  }, [file.id, file.type, token]);

  // Cleanup blob URL when imageData changes
  useEffect(() => {
    return () => {
      if (imageData) {
        URL.revokeObjectURL(imageData);
      }
    };
  }, [imageData]);

  if (file.type === 'IMAGE') {
    if (hasError) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center p-2">
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500 truncate">{file.name}</p>
            <p className="text-xs text-red-500 mt-1">Lỗi hiển thị</p>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center p-2">
            <Loader2 className="h-6 w-6 text-gray-400 mx-auto mb-1 animate-spin" />
            <p className="text-xs text-gray-500">Đang tải...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full">
        <img
          src={imageData || ''}
          alt={file.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>
    );
  } else if (file.type === 'VIDEO') {
    console.log('🎥 MediaThumbnail: Rendering video thumbnail for', file.name);
    
    if (hasError) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center p-2">
            <Video className="h-8 w-8 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500 truncate">{file.name}</p>
            <p className="text-xs text-red-500 mt-1">Lỗi hiển thị</p>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center p-2">
            <Loader2 className="h-6 w-6 text-gray-400 mx-auto mb-1 animate-spin" />
            <p className="text-xs text-gray-500">Đang tải...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full relative">
        <img
          src={imageData || ''}
          alt={file.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
          <div className="w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[6px] border-l-gray-700 border-y-[4px] border-y-transparent ml-1"></div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center p-2">
          <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500 uppercase truncate">{file.type}</p>
          <p className="text-xs text-gray-400 truncate">{file.name}</p>
        </div>
      </div>
    );
  }
}