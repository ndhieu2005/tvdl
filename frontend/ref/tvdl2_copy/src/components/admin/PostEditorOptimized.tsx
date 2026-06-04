'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Save, 
  Eye, 
  Video, 
  Image as ImageIcon, 
  Calendar,
  Globe,
  X,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import RichTextEditor from './RichTextEditor';
import MediaUploader from './MediaUploader';
import VideoEmbedModal from './VideoEmbedModal';
import TagSelector from './TagSelector';
import { TagData } from '@/lib/tags';
import VideoThumbnail from './VideoThumbnail';
import VideoThumbnailSimple from './VideoThumbnailSimple';
import VideoPreview from './VideoPreview';
import MediaManager from './MediaManager';
import { postAPI, PostData } from '@/lib/api';
import { IPost } from '@/lib/models/Post';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';

interface PostEditorProps {
  postId?: string;
  onSave?: (post: IPost) => void;
  onCancel?: () => void;
  onPostCreated?: (postId: string) => void;
}

export default function PostEditorOptimized({ postId, onSave, onCancel, onPostCreated }: PostEditorProps) {
  const { user, token } = useAuth();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  
  const [postData, setPostData] = useState<PostData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    featuredVideo: '',
    videoUrl: '',
    category: '',
    tags: [],
    status: 'draft',
    publishDate: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: ''
    }
  });

  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<TagData[]>([]);
  const [lastSaveTime, setLastSaveTime] = useState(0);

  // Stable refs to prevent re-renders
  const postDataRef = useRef(postData);
  const selectedTagsRef = useRef(selectedTags);
  const savingRef = useRef(saving);
  const lastSaveTimeRef = useRef(lastSaveTime);

  // Update refs only when needed
  useEffect(() => { postDataRef.current = postData; }, [postData]);
  useEffect(() => { selectedTagsRef.current = selectedTags; }, [selectedTags]);
  useEffect(() => { savingRef.current = saving; }, [saving]);
  useEffect(() => { lastSaveTimeRef.current = lastSaveTime; }, [lastSaveTime]);

  // Helper function to convert status
  const convertStatus = (status: any): 'draft' | 'published' | 'scheduled' => {
    switch (status) {
      case 'DRAFT':
        return 'draft';
      case 'PUBLISHED':
        return 'published';
      case 'SCHEDULED':
        return 'scheduled';
      default:
        return 'draft';
    }
  };

  // Load post data if editing
  const loadPost = useCallback(async () => {
    if (!postId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await postAPI.getPost(postId);
      
      if (response.success && response.data) {
        const post = response.data;
        setPostData({
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt || '',
          featuredImage: post.featuredImage || '',
          featuredVideo: (post as any).featuredVideo || '',
          videoUrl: post.videoUrl || '',
          category: (post as any).categorySlug || (post.category as any)?.slug || '',
          tags: post.tags ? JSON.parse(post.tags) : [],
          status: convertStatus(post.status),
          publishDate: post.publishDate ? new Date(post.publishDate).toISOString().slice(0, 16) : '',
          seo: {
            metaTitle: post.seoTitle || '',
            metaDescription: post.seoDescription || '',
            keywords: post.seoKeywords || ''
          }
        });
        
        setSelectedTags(post.tags ? JSON.parse(post.tags) : []);
      } else {
        setError(response.error || 'Failed to load post');
      }
    } catch (err) {
      setError('Failed to load post');
      console.error('Error loading post:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId, loadPost]);

  // Set default category when categories are loaded for new posts
  useEffect(() => {
    if (!postId && categories.length > 0 && !postData.category) {
      const firstActiveCategory = categories.find(cat => cat.status === 'active');
      if (firstActiveCategory) {
        setPostData(prev => ({ ...prev, category: firstActiveCategory.slug }));
      }
    }
  }, [categories, postId, postData.category]);

  // Memoized handlers to prevent re-creation
  const handleTitleChange = useCallback((title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    setPostData(prev => ({
      ...prev,
      title,
      slug,
      seo: {
        ...prev.seo,
        metaTitle: title
      }
    }));
  }, []);

  const handleContentChange = useCallback((content: string) => {
    setPostData(prev => ({ ...prev, content }));
  }, []);

  const handleTagsChange = useCallback((tags: TagData[]) => {
    setSelectedTags(tags);
  }, []);

  const handleMediaSelect = useCallback((url: string) => {
    setPostData(prev => ({ ...prev, featuredImage: url }));
    setShowMediaUploader(false);
  }, []);

  const handleVideoEmbed = useCallback((url: string) => {
    setPostData(prev => ({ ...prev, videoUrl: url }));
    setShowVideoModal(false);
  }, []);

  const handleSave = useCallback(async (status: 'draft' | 'published' | 'scheduled') => {
    if (savingRef.current) return;

    const now = Date.now();
    if (now - lastSaveTimeRef.current < 2000) return;
    setLastSaveTime(now);

    const currentPostData = postDataRef.current;
    if (!currentPostData.title.trim() || !currentPostData.content.trim()) {
      setError('Tiêu đề và nội dung là bắt buộc');
      return;
    }

    if (!currentPostData.category) {
      setError('Vui lòng chọn danh mục');
      return;
    }

    const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const tokenToUse = currentToken || token;

    if (!tokenToUse) {
      setError('Bạn cần đăng nhập để lưu bài viết');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedPost = { 
        ...currentPostData, 
        status: status || currentPostData.status,
        tagIds: selectedTagsRef.current.map(tag => tag.id)
      };
      
      let response;
      if (postId) {
        response = await postAPI.updatePost(postId, updatedPost, tokenToUse);
      } else {
        response = await postAPI.createPost(updatedPost, tokenToUse);
      }

      if (response.success && response.data) {
        const successMessage = 
          (status || currentPostData.status) === 'published' 
            ? 'Bài viết đã được xuất bản thành công!' 
            : (status || currentPostData.status) === 'scheduled'
            ? 'Bài viết đã được lên lịch thành công!'
            : 'Bài viết đã được lưu thành công!';
        
        setSuccess(successMessage);
        
        const updatedPostData = response.data;
        const newPostData = {
          title: updatedPostData.title,
          slug: updatedPostData.slug,
          content: updatedPostData.content,
          excerpt: updatedPostData.excerpt || '',
          featuredImage: updatedPostData.featuredImage || '',
          featuredVideo: (updatedPostData as any).featuredVideo || '',
          videoUrl: updatedPostData.videoUrl || '',
          category: (updatedPostData as any).categorySlug || (updatedPostData.category as any)?.slug || '',
          tags: updatedPostData.tags ? JSON.parse(updatedPostData.tags) : [],
          status: convertStatus(updatedPostData.status),
          publishDate: updatedPostData.publishDate ? new Date(updatedPostData.publishDate).toISOString().slice(0, 16) : '',
          seo: {
            metaTitle: updatedPostData.seoTitle || '',
            metaDescription: updatedPostData.seoDescription || '',
            keywords: updatedPostData.seoKeywords || ''
          }
        };
        
        setPostData(newPostData);
        setSelectedTags(updatedPostData.tags ? JSON.parse(updatedPostData.tags) : []);
        
        if (onSave) {
          onSave(updatedPostData);
        }
        
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(response.error || 'Không thể lưu bài viết');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi lưu bài viết');
    } finally {
      setSaving(false);
    }
  }, [postId, token, onSave]);

  const handleSaveDraft = useCallback(() => handleSave('draft'), [handleSave]);
  const handleSavePublished = useCallback(() => handleSave('published'), [handleSave]);

  const handlePreview = useCallback(() => {
    if (postData.slug) {
      window.open(`/preview/${postData.slug}`, '_blank');
    } else {
      alert('Vui lòng lưu bài viết trước khi xem trước');
    }
  }, [postData.slug]);

  // Memoized form handlers
  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPostData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'scheduled' }));
  }, []);

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPostData(prev => ({ ...prev, slug: e.target.value }));
  }, []);

  const handleExcerptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostData(prev => ({ ...prev, excerpt: e.target.value }));
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPostData(prev => ({ ...prev, category: e.target.value }));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 pb-20 lg:pb-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-green-400">✓</div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccess(null)}
                className="text-green-400 hover:text-green-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <select 
              value={postData.status}
              onChange={handleStatusChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="draft">Bản nháp</option>
              <option value="published">Xuất bản</option>
              <option value="scheduled">Lên lịch</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            {onCancel && (
              <button 
                onClick={onCancel}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Hủy</span>
              </button>
            )}
            
            <button 
              onClick={handleSaveDraft}
              disabled={saving || loading}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? 'Đang lưu...' : 'Lưu nháp'}</span>
            </button>
            
            <button 
              onClick={handlePreview}
              className="flex items-center space-x-2 px-4 py-2 text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>Xem trước</span>
            </button>
            
            <button 
              onClick={handleSavePublished}
              disabled={saving || loading}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
              <span>{saving ? 'Đang xuất bản...' : 'Xuất bản'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* Title & Slug */}
          <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề bài viết *
                </label>
                <input
                  type="text"
                  value={postData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Nhập tiêu đề bài viết..."
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 text-base lg:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug URL
                </label>
                <div className="flex flex-col sm:flex-row">
                  <span className="inline-flex items-center px-3 py-2 sm:rounded-l-lg sm:rounded-r-none rounded-t-lg sm:rounded-t-lg border sm:border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    /post/
                  </span>
                  <input
                    type="text"
                    value={postData.slug}
                    onChange={handleSlugChange}
                    className="flex-1 px-3 py-2 border border-gray-300 sm:rounded-r-lg sm:rounded-l-none rounded-b-lg sm:rounded-b-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tóm tắt
                </label>
                <textarea
                  value={postData.excerpt}
                  onChange={handleExcerptChange}
                  rows={3}
                  placeholder="Nhập tóm tắt bài viết..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung *
                </label>
                <textarea
                  value={postData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Nhập nội dung bài viết..."
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:space-y-6">
          {/* Category */}
          <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h3>
            <select
              value={postData.category}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <TagSelector
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
            />
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ảnh đại diện</h3>
            {postData.featuredImage ? (
              <div className="relative">
                <Image
                  src={postData.featuredImage}
                  alt="Featured image"
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => setPostData(prev => ({ ...prev, featuredImage: '' }))}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowMediaUploader(true)}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-purple-500 transition-colors"
              >
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Chọn ảnh đại diện</p>
                </div>
              </button>
            )}
          </div>

          {/* Video URL */}
          <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Video</h3>
            {postData.videoUrl ? (
              <div className="space-y-2">
                <VideoPreview videoUrl={postData.videoUrl} />
                <button
                  onClick={() => setPostData(prev => ({ ...prev, videoUrl: '' }))}
                  className="w-full px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  Xóa video
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowVideoModal(true)}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-purple-500 transition-colors"
              >
                <div className="text-center">
                  <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Thêm video</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showMediaUploader && (
        <MediaUploader
          onClose={() => setShowMediaUploader(false)}
          onSelect={handleMediaSelect}
        />
      )}

      {showVideoModal && (
        <VideoEmbedModal
          onClose={() => setShowVideoModal(false)}
          onEmbed={handleVideoEmbed}
        />
      )}
    </div>
  );
}