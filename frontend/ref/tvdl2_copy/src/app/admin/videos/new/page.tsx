'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
// Remove the import since we'll use API route
import { LoadingState } from '@/components/ui/loading-spinner';
import { VideoEmbed } from '@/components/video-embed';
import { useAuth } from '@/contexts/AuthContext';

interface VideoFormData {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  platform: 'tiktok' | 'youtube' | 'upload' | 'other';
  category: string;
  tags: string[];
  status: 'active' | 'inactive';
  metaTitle: string;
  metaDescription: string;
}

const categories = [
  'Dance', 'Comedy', 'Food', 'Beauty', 'Fashion', 'Travel', 
  'Educational', 'Sports', 'Music', 'Trends', 'Challenge', 'Other'
];

const popularTags = [
  'viral', 'trending', 'tiktok', 'dance', 'comedy', 'food', 
  'beauty', 'fashion', 'challenge', 'diy', 'tutorial', 'review'
];

export default function NewVideoPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    platform: 'tiktok',
    category: '',
    tags: [],
    status: 'active',
    metaTitle: '',
    metaDescription: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'seo'>('general');
  const [newTag, setNewTag] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractionSuccess, setExtractionSuccess] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  // Auto-extract video information when URL changes
  const handleUrlChange = async (url: string) => {
    setFormData(prev => ({
      ...prev,
      videoUrl: url
    }));

    // Clear previous states
    setExtractionError(null);
    setExtractionSuccess(false);

    if (!url.trim()) {
      return;
    }

    // Detect platform from URL
    const platform = url.includes('tiktok.com') || url.includes('vm.tiktok.com') 
      ? 'tiktok' 
      : url.includes('youtube.com') || url.includes('youtu.be') 
        ? 'youtube' 
        : 'other';
    
    // Update platform immediately
    setFormData(prev => ({
      ...prev,
      platform: platform as any
    }));

    // Only extract for supported platforms
    if (platform === 'tiktok' || platform === 'youtube') {
      setIsExtracting(true);
      
      try {
        const response = await fetch('/api/extract-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setFormData(prev => ({
            ...prev,
            title: result.data.title,
            description: result.data.description,
            thumbnailUrl: result.data.thumbnailUrl,
            platform: result.data.platform
          }));
          setExtractionSuccess(true);
          setTimeout(() => setExtractionSuccess(false), 3000);
        } else {
          setExtractionError(result.error || 'Không thể trích xuất thông tin video');
        }
      } catch (error) {
        setExtractionError('Đã xảy ra lỗi khi trích xuất thông tin video');
      } finally {
        setIsExtracting(false);
      }
    }
  };

  // Manual extract function
  const handleManualExtract = async () => {
    if (!formData.videoUrl.trim()) {
      setExtractionError('Vui lòng nhập URL video');
      return;
    }

    await handleUrlChange(formData.videoUrl);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddPopularTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare video data for API
      const videoData = {
        title: formData.title,
        description: formData.description,
        videoUrl: formData.videoUrl,
        thumbnailUrl: formData.thumbnailUrl,
        platform: formData.platform,
        category: formData.category,
        tags: formData.tags,
        status: formData.status,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription
      };

      console.log('💾 Saving video:', videoData);
      
      if (!token) {
        alert('No authentication token found');
        return;
      }
      
      // Call API to create video
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Video created successfully:', result.data);
        
        // Show success message
        alert('Video đã được tạo thành công!');
        
        // Redirect back to videos list
        router.push('/admin/videos');
      } else {
        console.error('❌ Failed to create video:', result.error);
        alert(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error saving video:', error);
      alert('Đã xảy ra lỗi khi lưu video. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    // In real app, this would open a preview modal or new tab
    console.log('Preview video:', formData);
  };

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
              Thêm video mới
            </h1>
            <p className="text-gray-600 mt-1">
              Thêm video từ TikTok, YouTube hoặc upload file
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handlePreview}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Xem trước</span>
          </button>
          <button
            type="submit"
            form="video-form"
            disabled={isSubmitting}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu video'}</span>
          </button>
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
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://www.tiktok.com/@user/video/..."
                    required
                  />
                  {formData.videoUrl && (
                    <button
                      type="button"
                      onClick={handleManualExtract}
                      disabled={isExtracting}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Trích xuất lại thông tin video"
                    >
                      <RefreshCw className={`h-4 w-4 ${isExtracting ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
                
                {/* Status Messages */}
                {isExtracting && (
                  <div className="mt-2">
                    <LoadingState 
                      message="Đang trích xuất thông tin video..." 
                      size="sm" 
                      className="text-blue-600"
                    />
                  </div>
                )}
                
                {extractionSuccess && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-600 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Đã trích xuất thông tin thành công!</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <p>✓ Tiêu đề: {formData.title}</p>
                      {formData.thumbnailUrl && <p>✓ Thumbnail: Đã tải</p>}
                      <p>✓ Platform: {formData.platform}</p>
                    </div>
                  </div>
                )}
                
                {extractionError && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{extractionError}</span>
                  </div>
                )}
                
                <p className="text-sm text-gray-500 mt-1">
                  Nhập URL từ TikTok, YouTube - thông tin sẽ được trích xuất tự động
                </p>
              </div>

              {/* Platform */}
              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
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
                      onClick={() => setFormData(prev => ({ ...prev, platform: value as any }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tiêu đề video..."
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
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Mô tả chi tiết về video..."
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
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/thumbnail.jpg"
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
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn danh mục</option>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Tiêu đề hiển thị trên công cụ tìm kiếm..."
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
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Mô tả ngắn gọn về video để hiển thị trên công cụ tìm kiếm..."
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
                    {formData.metaTitle || formData.title || 'Tiêu đề video'}
                  </div>
                  <div className="text-green-700 text-sm">
                    viralpeek.com/video/video-slug
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {formData.metaDescription || formData.description || 'Mô tả video sẽ hiển thị ở đây...'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Preview Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Xem trước video
          </h3>
          <button
            type="button"
            onClick={() => setShowVideoPreview(!showVideoPreview)}
            className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
          >
            {showVideoPreview ? 'Ẩn video' : 'Xem video'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Preview */}
          <div className="border rounded-lg overflow-hidden max-w-sm">
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-100">
              {formData.thumbnailUrl ? (
                <img 
                  src={formData.thumbnailUrl} 
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* Platform Badge */}
              {formData.platform && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded flex items-center space-x-1">
                  {formData.platform === 'tiktok' && <Music2 className="h-3 w-3" />}
                  {formData.platform === 'youtube' && <Youtube className="h-3 w-3" />}
                  {formData.platform === 'upload' && <Upload className="h-3 w-3" />}
                  <span className="capitalize">{formData.platform}</span>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h4 className="font-medium text-gray-900 line-clamp-2 mb-2">
                {formData.title || 'Tiêu đề video'}
              </h4>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {formData.description || 'Mô tả video'}
              </p>
              
              {/* Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag}
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {formData.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{formData.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Video Player */}
          {showVideoPreview && formData.videoUrl && (
            <div className="border rounded-lg overflow-hidden">
              <VideoEmbed
                url={formData.videoUrl}
                platform={formData.platform}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}