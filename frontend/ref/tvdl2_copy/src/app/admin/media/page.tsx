'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Image as ImageIcon, 
  Video, 
  File, 
  Music,
  Download,
  Trash2,
  Copy,
  Eye,
  MoreHorizontal,
  Calendar,
  HardDrive,
  FolderOpen,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import VideoThumbnail from '@/components/admin/VideoThumbnail';
import VideoThumbnailSimple from '@/components/admin/VideoThumbnailSimple';

interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  objectName: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  mimeType: string;
  url: string;
  size: number;
  dimensions?: { width: number; height: number };
  createdAt: string;
  updatedAt: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

interface MediaStats {
  totalFiles: number;
  totalSize: number;
  typeBreakdown: {
    IMAGE: { count: number; size: number };
    VIDEO: { count: number; size: number };
    AUDIO: { count: number; size: number };
    DOCUMENT: { count: number; size: number };
  };
  recentUploads: MediaFile[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function MediaLibraryPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API calls
  const fetchMediaFiles = async (page: number = 1, search?: string, type?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(type && { type })
      });

      const response = await apiClient.fetch(`/api/admin/media?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMediaFiles(data.files);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching media files:', error);
      setError('Failed to fetch media files');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.fetch('/api/admin/media/stats');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const uploadFileToAPI = async (file: File, customName?: string) => {
    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      if (customName) {
        formData.append('name', customName);
      }

      const response = await apiClient.fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const newFile = await response.json();
      setMediaFiles(prev => [newFile, ...prev]);
      setNotification({ type: 'success', message: 'File uploaded successfully' });
      
      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const deleteFileFromAPI = async (fileId: string) => {
    try {
      const response = await apiClient.fetch(`/api/admin/media/${fileId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setMediaFiles(prev => prev.filter(file => file.id !== fileId));
      setNotification({ type: 'success', message: 'File deleted successfully' });
      
      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Error deleting file:', error);
      setNotification({ type: 'error', message: 'Failed to delete file' });
    }
  };

  const bulkDelete = async (fileIds: string[]) => {
    try {
      const response = await apiClient.fetch('/api/admin/media/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          fileIds
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setMediaFiles(prev => prev.filter(file => !fileIds.includes(file.id)));
      setSelectedFiles([]);
      setNotification({ 
        type: 'success', 
        message: `${result.processed} files deleted successfully` 
      });
      
      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Error bulk deleting files:', error);
      setNotification({ type: 'error', message: 'Failed to delete files' });
    }
  };

  // Effects
  useEffect(() => {
    fetchMediaFiles();
    fetchStats();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== '') {
        fetchMediaFiles(1, searchTerm, typeFilter);
      } else {
        fetchMediaFiles(1, '', typeFilter);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, typeFilter]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Helper functions
  const filteredFiles = mediaFiles;

  // Get file icon
  const getFileIcon = (type: string, size: number = 24) => {
    const className = `h-${size/4} w-${size/4}`;
    switch (type) {
      case 'IMAGE':
        return <ImageIcon className={className} />;
      case 'VIDEO':
        return <Video className={className} />;
      case 'AUDIO':
        return <Music className={className} />;
      default:
        return <File className={className} />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      await uploadFileToAPI(file);
    }
    
    setShowUploadModal(false);
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (fileId: string) => {
    const url = `${window.location.origin}/api/media/${fileId}`;
    navigator.clipboard.writeText(url);
    setNotification({ type: 'success', message: 'URL copied to clipboard' });
  };

  // Delete file
  const deleteFile = async (fileId: string) => {
    await deleteFileFromAPI(fileId);
  };

  // Toggle file selection
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  // Statistics
  const totalFiles = stats?.totalFiles || 0;
  const totalSize = stats?.totalSize || 0;
  const imageCount = stats?.typeBreakdown?.IMAGE?.count || 0;
  const videoCount = stats?.typeBreakdown?.VIDEO?.count || 0;

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Thư viện Media
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý hình ảnh, video và tệp tin cho website
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          disabled={uploading}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{totalFiles}</h3>
              <p className="text-sm text-gray-500">Tổng tệp tin</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ImageIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{imageCount}</h3>
              <p className="text-sm text-gray-500">Hình ảnh</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Video className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{videoCount}</h3>
              <p className="text-sm text-gray-500">Video</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HardDrive className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{formatFileSize(totalSize)}</h3>
              <p className="text-sm text-gray-500">Dung lượng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tệp tin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
              />
            </div>
            
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Tất cả loại</option>
              <option value="IMAGE">Hình ảnh</option>
              <option value="VIDEO">Video</option>
              <option value="AUDIO">Audio</option>
              <option value="DOCUMENT">Tài liệu</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedFiles.length > 0 && (
              <>
                <span className="text-sm text-gray-500 mr-4">
                  Đã chọn {selectedFiles.length} tệp
                </span>
                <button
                  onClick={() => bulkDelete(selectedFiles)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa đã chọn</span>
                </button>
              </>
            )}
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-6 text-center">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không có tệp tin nào</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map((file) => (
                <div 
                  key={file.id}
                  className={`relative group border-2 rounded-lg p-3 cursor-pointer transition-all ${
                    selectedFiles.includes(file.id) 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleFileSelection(file.id)}
                >
                  {/* File Preview */}
                  <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    {file.type === 'IMAGE' ? (
                      <img 
                        src={`/api/media/${file.id}/preview`} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const nextElement = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                    ) : file.type === 'VIDEO' ? (
                      <VideoThumbnailSimple
                        src={`/api/media/${file.id}/preview`}
                        alt={file.name}
                        className="w-full h-full"
                        width={200}
                        height={200}
                      />
                    ) : (
                      <img 
                        src={`/api/media/${file.id}/preview`} 
                        alt={file.name}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  
                  {/* File Info */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-900 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    {file.dimensions && (
                      <p className="text-xs text-gray-500">
                        {file.dimensions.width}×{file.dimensions.height}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(file.id);
                        }}
                        className="p-1 bg-white rounded shadow hover:bg-gray-50"
                        title="Copy URL"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(file.id);
                        }}
                        className="p-1 bg-white rounded shadow hover:bg-red-50 text-red-600"
                        title="Xóa"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedFiles.includes(file.id) && (
                    <div className="absolute top-2 left-2">
                      <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(filteredFiles.map(f => f.id));
                        } else {
                          setSelectedFiles([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tệp tin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kích thước
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày upload
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người upload
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {file.type === 'IMAGE' ? (
                            <img 
                              src={`/api/media/${file.id}/preview`} 
                              alt={file.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : file.type === 'VIDEO' ? (
                            <VideoThumbnailSimple
                              src={`/api/media/${file.id}/preview`}
                              alt={file.name}
                              className="h-10 w-10 rounded"
                              width={40}
                              height={40}
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                              {getFileIcon(file.type, 20)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{file.name}</div>
                          {file.dimensions && (
                            <div className="text-sm text-gray-500">
                              {file.dimensions.width}×{file.dimensions.height}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {file.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(file.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.uploader.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(file.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Copy URL"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/api/media/${file.id}`, '_blank')}
                          className="text-green-600 hover:text-green-900"
                          title="Xem"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy tệp tin
            </h3>
            <p className="text-gray-500 mb-6">
              Hãy thử thay đổi bộ lọc hoặc upload tệp mới.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Upload tệp đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredFiles.length > 0 && pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong {pagination.total} tệp
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchMediaFiles(pagination.page - 1, searchTerm, typeFilter)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNumber = pagination.page <= 3 ? i + 1 : 
                  pagination.page >= pagination.pages - 2 ? pagination.pages - 4 + i :
                  pagination.page - 2 + i;
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => fetchMediaFiles(pageNumber, searchTerm, typeFilter)}
                    className={`px-3 py-1 text-sm border rounded ${
                      pagination.page === pageNumber 
                        ? 'bg-purple-600 text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                onClick={() => fetchMediaFiles(pagination.page + 1, searchTerm, typeFilter)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upload Media
            </h3>
            
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragActive 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Kéo thả tệp vào đây hoặc click để chọn
              </p>
              <p className="text-sm text-gray-500">
                Hỗ trợ: JPG, PNG, GIF, WEBP, MP4, WEBM, MP3, WAV, PDF, DOC (tối đa 100MB)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={(e) => {
                if (e.target.files) {
                  handleFileUpload(e.target.files);
                }
              }}
              className="hidden"
            />

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors"
              >
                Chọn tệp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}