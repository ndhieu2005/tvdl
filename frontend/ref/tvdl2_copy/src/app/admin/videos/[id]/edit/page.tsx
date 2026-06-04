'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Upload,
  Link as LinkIcon,
  Youtube,
  Music2,
  Video,
  Plus,
  X,
  Globe,
  Trash2,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';

interface VideoFormData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  platform: 'tiktok' | 'youtube' | 'upload' | 'other';
  category: string;
  tags: string[];
  status: 'active' | 'inactive' | 'processing';
  metaTitle: string;
  metaDescription: string;
  views: number;
  likes: number;
  shares: number;
  duration: number;
  uploadedAt: string;
  updatedAt: string;
  uploadedBy: string;
}

const categories = [
  'Dance', 'Comedy', 'Food', 'Beauty', 'Fashion', 'Travel', 
  'Educational', 'Sports', 'Music', 'Trends', 'Challenge', 'Other'
];

const popularTags = [
  'viral', 'trending', 'tiktok', 'dance', 'comedy', 'food', 
  'beauty', 'fashion', 'challenge', 'diy', 'tutorial', 'review'
];

// Mock data
const mockVideos: Record<string, VideoFormData> = {
  '1': {
    id: '1',
    title: 'Dance Challenge Viral TikTok 2024',
    description: 'Thử thách nhảy mới nhất đang viral trên TikTok với hơn 10M views',
    videoUrl: 'https://www.tiktok.com/@user/video/1234567890',
    thumbnailUrl: placeholderImages.tiktokDance,
    platform: 'tiktok',
    category: 'Dance',
    tags: ['dance', 'viral', 'tiktok', 'challenge'],
    status: 'active',
    metaTitle: 'Dance Challenge Viral TikTok 2024 - Xu hướng nhảy mới nhất',
    metaDescription: 'Khám phá thử thách nhảy viral mới nhất trên TikTok với hơn 10M lượt xem. Hướng dẫn từng bước để tham gia xu hướng hot này.',
    views: 125000,
    likes: 8500,
    shares: 2100,
    duration: 15,
    uploadedAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    uploadedBy: 'Admin'
  }
};

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
            if (resolved && typeof resolved.id === 'string') {
        setResolvedParams({ id: resolved.id });
      } else {
        setResolvedParams(null);
      }
    };
    resolveParams();
  }, [params]);

  const videoId = resolvedParams?.id || "";
  
  const [formData, setFormData] = useState<VideoFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'analytics'>('general');
  const [newTag, setNewTag] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load video data
  useEffect(() => {
    const loadVideo = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const video = mockVideos[videoId];
        if (!video) {
          router.push('/admin/videos');
          return;
        }
        
        setFormData(video);
      } catch (error) {
        console.error('Error loading video:', error);
        router.push('/admin/videos');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      loadVideo();
    }
  }, [videoId, router]);

  // Auto-detect platform from URL
  const detectPlatform = (url: string) => {
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.startsWith('/') || url.includes(window.location.hostname)) return 'upload';
    return 'other';
  };

  const handleUrlChange = (url: string) => {
    if (!formData) return;
    const platform = detectPlatform(url);
    setFormData(prev => ({
      ...prev!,
      videoUrl: url,
      platform: platform as any
    }));
  };

  const handleAddTag = () => {
    if (!formData || !newTag.trim() || formData.tags.includes(newTag.trim())) return;
    
    setFormData(prev => ({
      ...prev!,
      tags: [...prev!.tags, newTag.trim()]
    }));
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      tags: prev!.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddPopularTag = (tag: string) => {
    if (!formData || formData.tags.includes(tag)) return;
    setFormData(prev => ({
      ...prev!,
      tags: [...prev!.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update updatedAt
      const updatedData = {
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Updating video:', updatedData);
      
      // Redirect back to videos list
      router.push('/admin/videos');
    } catch (error) {
      console.error('Error updating video:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!formData) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Deleting video:', formData.id);
      router.push('/admin/videos');
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy video</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/videos"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa video
            </h1>
            <p className="text-gray-600 mt-1">
              Cập nhật thông tin video "{formData.title}"
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Xóa</span>
          </button>
          <button
            type="button"
            onClick={() => window.open(formData.videoUrl, '_blank')}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Xem video</span>
          </button>
          <button
            type="submit"
            form="video-form"
            disabled={isSubmitting}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {formData.views.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-500">Lượt xem</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="h-6 w-6 text-red-600">❤️</div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {formData.likes.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-500">Lượt thích</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="h-6 w-6 text-green-600">🔄</div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {formData.shares.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-500">Lượt chia sẻ</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {formatDuration(formData.duration)}
              </h3>
              <p className="text-sm text-gray-500">Thời lượng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Video className="h-4 w-4" />
                <span>Thông tin video</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'seo'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>SEO</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Thống kê</span>
              </div>
            </button>
          </nav>
        </div>

        <form id="video-form" onSubmit={handleSubmit} className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Video URL */}
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Video *
                </label>
                <div className="relative">
                  <LinkIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'tiktok', label: 'TikTok', icon: Music2, color: 'border-pink-500 bg-pink-50 text-pink-700' },
                    { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'border-red-500 bg-red-50 text-red-700' },
                    { value: 'upload', label: 'Upload', icon: Upload, color: 'border-blue-500 bg-blue-50 text-blue-700' },
                    { value: 'other', label: 'Khác', icon: Video, color: 'border-gray-500 bg-gray-50 text-gray-700' }
                  ].map(({ value, label, icon: Icon, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev!, platform: value as any }))}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                        formData.platform === value ? color : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề video *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev!, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả video *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev!, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Thumbnail URL */}
              <div>
                <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Thumbnail
                </label>
                <input
                  type="url"
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev!, thumbnailUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {formData.thumbnailUrl && (
                  <div className="mt-2">
                    <img 
                      src={formData.thumbnailUrl} 
                      alt="Thumbnail preview"
                      className="h-24 w-36 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev!, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                
                {/* Current Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-purple-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add New Tag */}
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Thêm tag mới..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Popular Tags */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Tags phổ biến:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddPopularTag(tag)}
                        disabled={formData.tags.includes(tag)}
                        className={`px-2 py-1 rounded text-sm border transition-colors ${
                          formData.tags.includes(tag)
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev!, status: e.target.value as 'active' | 'inactive' | 'processing' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="processing">Đang xử lý</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              {/* Meta Title */}
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề SEO
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev!, metaTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.metaTitle.length}/60 ký tự (khuyến nghị)
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả SEO
                </label>
                <textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev!, metaDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.metaDescription.length}/160 ký tự (khuyến nghị)
                </p>
              </div>

              {/* SEO Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Xem trước Google
                </h4>
                <div className="bg-white rounded border p-3">
                  <div className="text-blue-600 text-lg font-medium">
                    {formData.metaTitle || formData.title}
                  </div>
                  <div className="text-green-700 text-sm">
                    viralpeek.com/video/{formData.id}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {formData.metaDescription || formData.description}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Engagement Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Views:</span>
                      <span className="text-sm font-medium">{formData.views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Likes:</span>
                      <span className="text-sm font-medium">{formData.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Shares:</span>
                      <span className="text-sm font-medium">{formData.shares.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Engagement Rate:</span>
                      <span className="text-sm font-medium">
                        {((formData.likes + formData.shares) / formData.views * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Thông tin khác</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Thời lượng:</span>
                      <span className="text-sm font-medium">{formatDuration(formData.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ngày tạo:</span>
                      <span className="text-sm font-medium">
                        {new Date(formData.uploadedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cập nhật cuối:</span>
                      <span className="text-sm font-medium">
                        {new Date(formData.updatedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Người tạo:</span>
                      <span className="text-sm font-medium">{formData.uploadedBy}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Biểu đồ analytics sẽ được hiển thị ở đây</p>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xác nhận xóa video
            </h3>
            <p className="text-gray-600 mb-2">
              Bạn có chắc chắn muốn xóa video "<strong>{formData.title}</strong>"?
            </p>
            <p className="text-red-600 text-sm mb-6">
              Video có {formData.views.toLocaleString()} lượt xem. Hành động này không thể hoàn tác.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
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