'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Video, 
  Play,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  TrendingUp,
  Download,
  Share2,
  MoreHorizontal,
  Youtube,
  Music2,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { placeholderImages, getPlaceholderByCategory } from '@/lib/placeholder-images';
import { useAuth } from '@/contexts/AuthContext';

interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  platform: 'tiktok' | 'youtube' | 'upload' | 'other';
  status: 'active' | 'inactive' | 'processing';
  duration: number; // seconds
  views: number;
  likes: number;
  shares: number;
  tags: string[];
  category: string;
  uploadedAt: string;
  updatedAt: string;
  uploadedBy: string;
  size?: number; // for uploaded videos
  resolution?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Mock data
const mockVideos: VideoData[] = [
  {
    id: '1',
    title: 'Dance Challenge Viral TikTok 2024',
    description: 'Thử thách nhảy mới nhất đang viral trên TikTok với hơn 10M views',
    thumbnail: placeholderImages.tiktokDance,
    videoUrl: 'https://www.tiktok.com/@user/video/1234567890',
    platform: 'tiktok',
    status: 'active',
    duration: 15,
    views: 125000,
    likes: 8500,
    shares: 2100,
    tags: ['dance', 'viral', 'tiktok', 'challenge'],
    category: 'Dance',
    uploadedAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    uploadedBy: 'Admin'
  },
  {
    id: '2',
    title: 'Top 10 TikTok Trends This Week',
    description: 'Compilation video showcasing the hottest TikTok trends',
    thumbnail: placeholderImages.youtubeTrends,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    platform: 'youtube',
    status: 'active',
    duration: 600, // 10 minutes
    views: 89000,
    likes: 4200,
    shares: 890,
    tags: ['trends', 'compilation', 'youtube'],
    category: 'Trends',
    uploadedAt: '2024-01-19T14:15:00Z',
    updatedAt: '2024-01-19T14:15:00Z',
    uploadedBy: 'Editor'
  },
  {
    id: '3',
    title: 'Behind The Scenes - Viral Video Creation',
    description: 'Quá trình tạo ra một video viral từ ý tưởng đến thành phẩm',
    thumbnail: placeholderImages.btsVideo,
    videoUrl: '/videos/bts-viral-creation.mp4',
    platform: 'upload',
    status: 'processing',
    duration: 180,
    views: 15400,
    likes: 890,
    shares: 234,
    tags: ['bts', 'tutorial', 'creation'],
    category: 'Educational',
    uploadedAt: '2024-01-18T09:45:00Z',
    updatedAt: '2024-01-18T09:45:00Z',
    uploadedBy: 'Content Creator',
    size: 45600000, // ~45MB
    resolution: '1920x1080'
  },
  {
    id: '4',
    title: 'Food Trend Challenge 2024',
    description: 'Thử thách ẩm thực mới đang hot trên TikTok',
    thumbnail: placeholderImages.foodChallenge,
    videoUrl: 'https://www.tiktok.com/@foodie/video/9876543210',
    platform: 'tiktok',
    status: 'active',
    duration: 30,
    views: 67000,
    likes: 3400,
    shares: 890,
    tags: ['food', 'challenge', 'cooking'],
    category: 'Food',
    uploadedAt: '2024-01-17T16:20:00Z',
    updatedAt: '2024-01-17T16:20:00Z',
    uploadedBy: 'Food Editor'
  },
  {
    id: '5',
    title: 'Beauty Transformation Tutorial',
    description: 'Hướng dẫn makeup transformation viral trên social media',
    thumbnail: placeholderImages.beautyTransform,
    videoUrl: '/videos/beauty-transformation.mp4',
    platform: 'upload',
    status: 'inactive',
    duration: 240,
    views: 34000,
    likes: 1200,
    shares: 345,
    tags: ['beauty', 'makeup', 'transformation'],
    category: 'Beauty',
    uploadedAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z',
    uploadedBy: 'Beauty Editor',
    size: 78900000, // ~79MB
    resolution: '1080x1920'
  }
];

function VideosManagementPageContent() {
  const { token } = useAuth();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // Fetch videos from API
  const fetchVideos = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (platformFilter) params.append('platform', platformFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/videos?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setVideos(result.data || []);
        setPagination(result.pagination);
      } else {
        setError(result.error || 'Failed to fetch videos');
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  // Load videos on component mount and when filters change
  useEffect(() => {
    if (token) {
      fetchVideos(1);
    }
  }, [platformFilter, statusFilter, searchTerm, token]);

  // Load videos when page changes (but not on initial load)
  useEffect(() => {
    if (token && pagination.page > 1) {
      fetchVideos(pagination.page);
    }
  }, [pagination.page]);

  // Filtered videos are now handled by API - with defensive check
  const filteredVideos = Array.isArray(videos) ? videos : [];

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '-';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tiktok':
        return <Music2 className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'upload':
        return <Video className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  // Get platform color
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'tiktok':
        return 'bg-pink-100 text-pink-800';
      case 'youtube':
        return 'bg-red-100 text-red-800';
      case 'upload':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Toggle video selection
  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  // Delete video
  const handleDeleteVideo = async (videoId: string) => {
    try {
      if (!token) {
        alert('No authentication token found');
        return;
      }
      
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setVideos(prev => prev.filter(video => video.id !== videoId));
        setShowDeleteModal(null);
      } else {
        alert(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Đã xảy ra lỗi khi xóa video');
    }
  };

  // Toggle status
  const toggleStatus = async (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;
    
    const newStatus = video.status === 'active' ? 'inactive' : 'active';
    
    try {
      if (!token) {
        alert('No authentication token found');
        return;
      }
      
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setVideos(prev => prev.map(v => 
          v.id === videoId ? { ...v, status: newStatus } : v
        ));
      } else {
        alert(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating video status:', error);
      alert('Đã xảy ra lỗi khi cập nhật trạng thái');
    }
  };

  // Statistics - with defensive checks
  const totalVideos = pagination?.total || 0;
  const activeVideos = Array.isArray(videos) ? videos.filter(v => v?.status === 'active').length : 0;
  const totalViews = Array.isArray(videos) ? videos.reduce((sum, video) => sum + (video?.views || 0), 0) : 0;
  const tiktokVideos = Array.isArray(videos) ? videos.filter(v => v?.platform === 'tiktok').length : 0;

  // Don't render if no token (let auth guard handle it)
  if (!token) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p>Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Video
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý video từ TikTok, YouTube và video upload
          </p>
        </div>
        <Link 
          href="/admin/videos/new"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Thêm video</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{totalVideos}</h3>
              <p className="text-sm text-gray-500">Tổng video</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{activeVideos}</h3>
              <p className="text-sm text-gray-500">Đang hoạt động</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {totalViews.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-500">Tổng lượt xem</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Music2 className="h-6 w-6 text-pink-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{tiktokVideos}</h3>
              <p className="text-sm text-gray-500">TikTok Videos</p>
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
                placeholder="Tìm kiếm video..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
              />
            </div>
            
            <select 
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Tất cả platform</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="upload">Upload</option>
              <option value="other">Khác</option>
            </select>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="processing">Đang xử lý</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedVideos.length > 0 && (
              <span className="text-sm text-gray-500 mr-4">
                Đã chọn {selectedVideos.length} video
              </span>
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

      {/* Videos Display */}
      <div className="bg-white rounded-lg shadow-sm">
        {viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredVideos.map((video) => (
                <div 
                  key={video.id}
                  className={`relative group border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    selectedVideos.includes(video.id) 
                      ? 'border-purple-500 shadow-md' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => toggleVideoSelection(video.id)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-100">
                    <img 
                      src={video.thumbnail || placeholderImages.videoPlaceholder} 
                      alt={video.title || 'Video thumbnail'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderImages.videoPlaceholder;
                      }}
                    />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white bg-opacity-90 rounded-full p-2">
                        <Play className="h-6 w-6 text-gray-700" />
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration || 0)}
                    </div>

                    {/* Platform Badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getPlatformColor(video.platform)}`}>
                      {getPlatformIcon(video.platform)}
                      <span className="capitalize">{video.platform}</span>
                    </div>

                    {/* Status */}
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        video.status === 'active' ? 'bg-green-100 text-green-800' :
                        video.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {video.status === 'active' ? 'Hoạt động' : 
                         video.status === 'processing' ? 'Xử lý' : 'Tạm dừng'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                      {video.title || 'Untitled Video'}
                    </h3>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {video.description || 'No description available'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{(video.views || 0).toLocaleString()}</span>
                        </span>
                        <span>{video.uploadedAt ? new Date(video.uploadedAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {Array.isArray(video.tags) && video.tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {Array.isArray(video.tags) && video.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{video.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(video.videoUrl, '_blank');
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Xem video"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/admin/videos/${video.id}/edit`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-purple-600 hover:text-purple-900 p-1"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteModal(video.id);
                          }}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(video.id);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        {video.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                      </button>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedVideos.includes(video.id) && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
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
                          setSelectedVideos(filteredVideos.map(v => v.id));
                        } else {
                          setSelectedVideos([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt xem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedVideos.includes(video.id)}
                        onChange={() => toggleVideoSelection(video.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <img 
                            src={video.thumbnail || placeholderImages.videoPlaceholder} 
                            alt={video.title || 'Video thumbnail'}
                            className="h-16 w-24 rounded object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = placeholderImages.videoPlaceholder;
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {video.title || 'Untitled Video'}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {formatDuration(video.duration || 0)} • {video.category || 'N/A'}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Array.isArray(video.tags) && video.tags.slice(0, 2).map((tag) => (
                              <span 
                                key={tag}
                                className="inline-block bg-gray-100 text-gray-600 text-xs px-1 py-0.5 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium space-x-1 ${getPlatformColor(video.platform)}`}>
                        {getPlatformIcon(video.platform)}
                        <span className="capitalize">{video.platform}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        video.status === 'active' ? 'bg-green-100 text-green-800' :
                        video.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {video.status === 'active' ? 'Hoạt động' : 
                         video.status === 'processing' ? 'Đang xử lý' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {video.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(video.uploadedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(video.videoUrl, '_blank')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem video"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/admin/videos/${video.id}/edit`}
                          className="text-purple-600 hover:text-purple-900"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal(video.id)}
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 text-purple-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Đang tải video...
            </h3>
            <p className="text-gray-500">
              Vui lòng chờ trong giây lát.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Có lỗi xảy ra
            </h3>
            <p className="text-gray-500 mb-6">
              {error}
            </p>
            <button
              onClick={() => fetchVideos(1)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy video
            </h3>
            <p className="text-gray-500 mb-6">
              Hãy thử thay đổi bộ lọc hoặc thêm video mới.
            </p>
            <Link
              href="/admin/videos/new"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center space-x-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Thêm video đầu tiên</span>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPagination(prev => ({ ...prev, page }))}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  page === pagination.page 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={!pagination.hasNext}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xác nhận xóa video
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa video này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteVideo(showDeleteModal)}
                className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VideosManagementPage() {
  try {
    return <VideosManagementPageContent />;
  } catch (error) {
    console.error('Error rendering VideosManagementPage:', error);
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold">Error Loading Videos Page</h2>
          <p className="mt-2">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}