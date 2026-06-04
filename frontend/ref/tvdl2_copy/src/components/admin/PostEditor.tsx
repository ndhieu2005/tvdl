'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { postAPI, PostData } from '@/lib/api';
import { IPost } from '@/lib/models/Post';
import { TagData } from '@/lib/tags';
import {
  Calendar,
  Eye,
  Globe,
  Loader2,
  Save,
  X
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MediaManager from './MediaManager';
import MediaUploader from './MediaUploader';
import RichTextEditor from './RichTextEditor';
import TagSelector from './TagSelector';
import VideoEmbedModal from './VideoEmbedModal';

interface PostEditorProps {
  postId?: string;
  onSave?: (post: IPost) => void;
  onCancel?: () => void;
  onPostCreated?: (postId: string) => void;
}

export default function PostEditor({ postId, onSave, onCancel, onPostCreated }: PostEditorProps) {
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
  const [loadingVideoInfo, setLoadingVideoInfo] = useState(false);
  const [selectedTags, setSelectedTags] = useState<TagData[]>([]);
  const [lastSaveTime, setLastSaveTime] = useState(0);
  const [countdownTrigger, setCountdownTrigger] = useState(0);
  const [currentPostId, setCurrentPostId] = useState<string | null>(postId || null);

  // Debug render count - only increment when needed
  const renderCountRef = useRef(0);

  // Use refs to store current values to avoid re-creating handleSave
  const postDataRef = useRef(postData);
  const selectedTagsRef = useRef(selectedTags);
  const savingRef = useRef(saving);
  const lastSaveTimeRef = useRef(lastSaveTime);

  // Update refs when values change - use useEffect to prevent unnecessary updates
  useEffect(() => {
    postDataRef.current = postData;

  }, [postData]);

  useEffect(() => {
    selectedTagsRef.current = selectedTags;
  }, [selectedTags]);

  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  useEffect(() => {
    lastSaveTimeRef.current = lastSaveTime;
  }, [lastSaveTime]);

  // Only increment render count in development and when actually needed
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      renderCountRef.current += 1;
    }
  }, []);

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

  // Define loadPost function first
  const loadPost = useCallback(async () => {
    if (!postId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await postAPI.getPost(postId);

      if (response.success && response.data) {
        const post = response.data;
        const newData = {
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt || '',
          featuredImage: post.featuredImage || '',
          featuredVideo: (post as any).featuredVideo || '',
          videoUrl: post.videoUrl || '',
          category: (post as any).categorySlug || (post.category as any)?.slug || '',
          tags: Array.isArray(post.tags)
            ? post.tags
            : post.tags
              ? JSON.parse(post.tags)
              : [],
          status: convertStatus(post.status),
          publishDate: post.publishDate ? new Date(post.publishDate).toISOString().slice(0, 16) : '',
          seo: {
            metaTitle: post.seoTitle || '',
            metaDescription: post.seoDescription || '',
            keywords: post.seoKeywords || ''
          }
        };

        // Log khi setPostData từ loadPost
        setPostData(prev => {
          // So sánh từng trường, chỉ set nếu thực sự khác
          let changed = false;
          for (const key of Object.keys(newData) as (keyof typeof newData)[]) {
            if (typeof newData[key] === 'object') {
              if (JSON.stringify(newData[key]) !== JSON.stringify(prev[key])) {
                changed = true;
                break;
              }
            } else if (newData[key] !== prev[key]) {
              changed = true;
              break;
            }
          }
          if (changed) {
            console.log('[PostEditor] setPostData (from loadPost)', { prev, newData });
          }
          return changed ? newData : prev;
        });

        // Log khi setSelectedTags từ loadPost
        setSelectedTags(prevTags => {
          const newTags = (post.tags as any) || [];
          if (JSON.stringify(prevTags) !== JSON.stringify(newTags)) {
            console.log('[PostEditor] setSelectedTags (from loadPost)', { prevTags, newTags });
            return newTags;
          }
          return prevTags;
        });
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

  // Debug authentication state (simplified) - Only log when auth state changes
  React.useEffect(() => {
    // Auth state tracking for debugging if needed
  }, [user, token]);

  // Sync currentPostId with prop postId
  useEffect(() => {
    setCurrentPostId(postId || null);
  }, [postId]);

  // Load post data if editing
  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId, loadPost]);

  // Set default category when categories are loaded for new posts (only once)
  useEffect(() => {
    if (!postId && categories.length > 0) {
      setPostData(prev => {
        // Only set if category is empty
        if (!prev.category) {
          const firstActiveCategory = categories.find(cat => cat.status === 'active');
          if (firstActiveCategory) {
            return { ...prev, category: firstActiveCategory.slug };
          }
        }
        return prev;
      });
    }
  }, [categories, postId]);

  // Update countdown every minute for scheduled posts - optimized
  useEffect(() => {
    if (postData.status === 'scheduled' && postData.publishDate) {
      // Only update if the publish date is in the future
      const publishTime = new Date(postData.publishDate).getTime();
      const now = Date.now();

      if (publishTime > now) {
        const interval = setInterval(() => {
          // Only update if still in the future
          if (Date.now() < publishTime) {
            setCountdownTrigger(prev => prev + 1);
          }
        }, 60000); // Update every minute

        return () => clearInterval(interval);
      }
    }
  }, [postData.status, postData.publishDate]);

  const handleTitleChange = useCallback((title: string) => {
    console.log('[PostEditor] handleTitleChange', title);
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

  const handleMediaUploaderClose = useCallback(() => {
    setShowMediaUploader(false);
  }, []);

  const handleMediaSelect = useCallback((url: string) => {
    setPostData(prev => ({ ...prev, featuredImage: url }));
    setShowMediaUploader(false);
  }, []);

  const handleVideoModalClose = useCallback(() => {
    setShowVideoModal(false);
  }, []);

  const handleVideoEmbed = useCallback((url: string) => {
    setPostData(prev => ({ ...prev, videoUrl: url }));
    setShowVideoModal(false);
  }, []);

  const handleSave = useCallback(async (status: 'draft' | 'published' | 'scheduled') => {
    // Prevent multiple simultaneous save attempts
    if (savingRef.current) {
      return;
    }

    // Prevent rapid successive saves (debounce)
    const now = Date.now();
    if (now - lastSaveTimeRef.current < 2000) { // 2 second debounce
      return;
    }
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

    // Validate scheduled posts
    if (status === 'scheduled' || currentPostData.status === 'scheduled') {
      if (!currentPostData.publishDate) {
        setError('Vui lòng chọn thời gian xuất bản');
        return;
      }

      const selectedDate = new Date(currentPostData.publishDate);
      const now = new Date();

      if (selectedDate <= now) {
        setError('Thời gian lập lịch phải lớn hơn thời gian hiện tại');
        return;
      }
    }

    // Get fresh token from localStorage to ensure we have the latest
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const tokenToUse = currentToken || token;

    // Authentication check
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
        tagIds: selectedTagsRef.current.map(tag => tag.id) // Convert selected tags to IDs
      };
      let response;

      // Sử dụng currentPostId thay vì postId
      if (currentPostId) {
        // Update existing post
        response = await postAPI.updatePost(currentPostId, updatedPost, tokenToUse);
      } else {
        // Create new post
        response = await postAPI.createPost(updatedPost, tokenToUse);
      }

      // Process save response
      if (response.success && response.data) {
        const successMessage =
          (status || currentPostData.status) === 'published'
            ? 'Bài viết đã được xuất bản thành công!'
            : (status || currentPostData.status) === 'scheduled'
              ? `Bài viết đã được lên lịch thành công! Sẽ xuất bản vào ${formatDisplayTime(currentPostData.publishDate)}`
              : 'Bài viết đã được lưu thành công!';

        setSuccess(successMessage);

        // Update local state with the response data to prevent stale data
        const updatedPostData = response.data;

        // If this was a new post creation, update currentPostId and call onPostCreated
        if (!currentPostId && updatedPostData.id) {
          setCurrentPostId(updatedPostData.id);
          if (onPostCreated) {
            onPostCreated(updatedPostData.id);
          }
        }

        // Update postData state
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

        // Update selected tags as well
        const newTags = (updatedPostData.tags as any) || [];
        setSelectedTags(newTags);

        if (onSave) {
          onSave(updatedPostData);
        }

        // Clear success message after 5 seconds (longer for scheduled posts)
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(response.error || 'Không thể lưu bài viết');

        // Check if error is authentication related
        if (response.error && (
          response.error.includes('authentication') ||
          response.error.includes('unauthorized') ||
          response.error.includes('token')
        )) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
      }
    } catch (err) {
      let errorMessage = 'Đã xảy ra lỗi khi lưu bài viết';

      // Check if it's a network error
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.';
        } else if (err.message.includes('authentication') || err.message.includes('unauthorized')) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else {
          errorMessage = err.message || errorMessage;
        }
      }

      setError(errorMessage);
    } finally {
      setSaving(false);

      // Double check that saving state is properly reset after a delay
      setTimeout(() => {
        setSaving(false);
      }, 100);
    }
  }, [currentPostId, token, onSave, onPostCreated]);

  const handleSaveDraft = useCallback(() => {
    handleSave('draft');
  }, [handleSave]);

  const handleSavePublished = useCallback(() => {
    handleSave('published');
  }, [handleSave]);

  const handleSaveScheduled = useCallback(() => {
    handleSave('scheduled');
  }, [handleSave]);

  const handlePreview = useCallback(() => {
    if (postData.slug) {
      window.open(`/preview/${postData.slug}`, '_blank');
    } else {
      alert('Vui lòng lưu bài viết trước khi xem trước');
    }
  }, [postData.slug]);

  const handleClearError = useCallback(() => {
    setError(null);
  }, []);

  const handleClearSuccess = useCallback(() => {
    setSuccess(null);
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPostData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'scheduled' }));
  }, []);

  const handlePublishDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPostData(prev => ({ ...prev, publishDate: e.target.value }));
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

  const handleSeoMetaTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPostData(prev => ({
      ...prev,
      seo: { ...prev.seo, metaTitle: e.target.value }
    }));
  }, []);

  const handleSeoMetaDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostData(prev => ({
      ...prev,
      seo: { ...prev.seo, metaDescription: e.target.value }
    }));
  }, []);

  const handleSeoKeywordsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPostData(prev => ({
      ...prev,
      seo: { ...prev.seo, keywords: e.target.value }
    }));
  }, []);

  // Format datetime-local value to ensure it includes seconds - memoized
  const formatDateTimeLocal = useCallback((dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    // Format as YYYY-MM-DDTHH:MM:SS (with seconds)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }, []);

  // Get current datetime for min attribute - memoized
  const getCurrentDateTime = useCallback(() => {
    const now = new Date();
    return formatDateTimeLocal(now.toISOString());
  }, [formatDateTimeLocal]);

  // Format display time for user - memoized
  const formatDisplayTime = useCallback((dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }, []);

  // Calculate time remaining until publish - memoized with countdownTrigger dependency
  const getTimeRemaining = useCallback((dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff <= 0) return 'Đã quá hạn';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} ngày ${hours} giờ`;
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    return `${minutes} phút`;
  }, [countdownTrigger]); // Add countdownTrigger as dependency to update countdown

  // Debug function to reset all states - memoized
  const debugResetStates = useCallback(() => {
    setSaving(false);
    setLoading(false);
    setError(null);
    setSuccess(null);
    setLastSaveTime(0);
    renderCountRef.current = 0;
  }, []);



  const getVideoPreview = useCallback((url: string) => {
    // Simple preview for YouTube and TikTok URLs
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
    return null;
  }, []);

  const isVideoUrl = useCallback((url: string) => {
    return url.includes('/api/media/') || url.includes('/api/admin/media/') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
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
                onClick={handleClearSuccess}
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
        {/* Mobile Layout */}
        <div className="block lg:hidden space-y-4">
          {/* Status Selection */}
          <div className="flex flex-col space-y-3">
            <select
              value={postData.status}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="draft">Bản nháp</option>
              <option value="published">Xuất bản</option>
              <option value="scheduled">Lên lịch</option>
            </select>

            {postData.status === 'scheduled' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <input
                    type="datetime-local"
                    value={postData.publishDate}
                    onChange={handlePublishDateChange}
                    min={getCurrentDateTime()}
                    step="1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                {postData.publishDate && (
                  <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
                    <div>
                      <span className="font-medium">Sẽ xuất bản vào:</span><br />
                      {formatDisplayTime(postData.publishDate)}
                      <span className="ml-2 text-gray-400">(GMT+7)</span>
                    </div>
                    <div className="text-purple-600 font-medium">
                      Còn lại: {getTimeRemaining(postData.publishDate)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons - Mobile Grid */}
          <div className="grid grid-cols-2 gap-2">
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex items-center justify-center space-x-1 px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
              >
                <X className="h-4 w-4" />
                <span>Hủy</span>
              </button>
            )}

            <button
              onClick={handleSaveDraft}
              disabled={saving || loading}
              className="flex items-center justify-center space-x-1 px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? 'Đang lưu...' : 'Lưu nháp'}</span>
            </button>

            <button
              onClick={handlePreview}
              className="flex items-center justify-center space-x-1 px-3 py-2 text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors text-sm"
            >
              <Eye className="h-4 w-4" />
              <span>Xem trước</span>
            </button>

            {postData.status === 'scheduled' ? (
              <button
                onClick={handleSaveScheduled}
                disabled={saving || loading}
                className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                <span>{saving ? 'Đang lên lịch...' : 'Lên lịch'}</span>
              </button>
            ) : (
              <button
                onClick={handleSavePublished}
                disabled={saving || loading}
                className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                <span>{saving ? 'Đang xuất bản...' : 'Xuất bản'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between">
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

            {postData.status === 'scheduled' && (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <input
                    type="datetime-local"
                    value={postData.publishDate}
                    onChange={handlePublishDateChange}
                    min={getCurrentDateTime()}
                    step="1"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[220px]"
                    required
                  />
                </div>
                {postData.publishDate && (
                  <div className="text-xs text-gray-500 ml-6 space-y-1">
                    <div>
                      Sẽ xuất bản vào: {formatDisplayTime(postData.publishDate)}
                      <span className="ml-2 text-gray-400">(GMT+7)</span>
                    </div>
                    <div className="text-purple-600 font-medium">
                      Còn lại: {getTimeRemaining(postData.publishDate)}
                    </div>
                  </div>
                )}
              </div>
            )}
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

            {postData.status === 'scheduled' ? (
              <button
                onClick={handleSaveScheduled}
                disabled={saving || loading}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                <span>{saving ? 'Đang lên lịch...' : 'Lên lịch'}</span>
              </button>
            ) : (
              <button
                onClick={handleSavePublished}
                disabled={saving || loading}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                <span>{saving ? 'Đang xuất bản...' : 'Xuất bản'}</span>
              </button>
            )}
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

          {/* Content Tabs */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-4 lg:space-x-8 px-4 lg:px-6 overflow-x-auto">
                {[
                  { id: 'content', name: 'Nội dung', icon: null },
                  { id: 'seo', name: 'SEO', icon: null }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4 lg:p-6">
              {activeTab === 'content' && (
                <div className="space-y-4 lg:space-y-6">
                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tóm tắt
                    </label>
                    <textarea
                      value={postData.excerpt}
                      onChange={handleExcerptChange}
                      rows={3}
                      placeholder="Nhập tóm tắt ngắn về bài viết..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm lg:text-base"
                    />
                  </div>

                  {/* Rich Text Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nội dung *
                    </label>
                    <RichTextEditor
                      content={postData.content}
                      onChange={handleContentChange}
                      placeholder="Nhập nội dung bài viết chi tiết..."
                      minHeight={400}
                      maxHeight={800}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-4 lg:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={postData.seo.metaTitle}
                      onChange={handleSeoMetaTitleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm lg:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <span className={postData.seo.metaTitle.length > 60 ? 'text-red-500' : ''}>
                        {postData.seo.metaTitle.length}/60 ký tự
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={postData.seo.metaDescription}
                      onChange={handleSeoMetaDescriptionChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm lg:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <span className={postData.seo.metaDescription.length > 160 ? 'text-red-500' : ''}>
                        {postData.seo.metaDescription.length}/160 ký tự
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={postData.seo.keywords}
                      onChange={handleSeoKeywordsChange}
                      placeholder="Nhập từ khóa, cách nhau bằng dấu phẩy..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm lg:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ví dụ: tiktok, viral, trending, social media
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:space-y-6">
          {/* Media Manager */}
          <MediaManager
            featuredImage={postData.featuredImage}
            featuredVideo={postData.videoUrl}
            onImageChange={(url) => setPostData(prev => ({ ...prev, featuredImage: url }))}
            onVideoChange={(url) => setPostData(prev => ({ ...prev, videoUrl: url }))}
          />

          {/* Category & Tags - Mobile: Side by side, Desktop: Stacked */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
            {/* Category */}
            <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Danh mục</h3>
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-gray-500 text-sm">Đang tải danh mục...</span>
                </div>
              ) : categoriesError ? (
                <div className="text-red-500 text-sm py-2">
                  Lỗi khi tải danh mục: {categoriesError}
                </div>
              ) : (
                <select
                  value={postData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm lg:text-base"
                >
                  <option value="">Chọn danh mục</option>
                  {categories
                    .filter(cat => cat.status === 'active')
                    .map(category => (
                      <option key={category.id} value={category.slug}>
                        {category.name} ({category.postsCount} bài viết)
                      </option>
                    ))}
                </select>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Thẻ</h3>
              <TagSelector
                selectedTags={selectedTags}
                onTagsChange={handleTagsChange}
                maxTags={10}
                placeholder="Tìm kiếm và chọn tags..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showMediaUploader && (
        <MediaUploader
          onClose={handleMediaUploaderClose}
          onSelect={handleMediaSelect}
        />
      )}

      {showVideoModal && (
        <VideoEmbedModal
          onClose={handleVideoModalClose}
          onEmbed={handleVideoEmbed}
        />
      )}

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
        <div className="flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full ${postData.status === 'published' ? 'bg-green-500' :
                postData.status === 'scheduled' ? 'bg-purple-500' :
                  'bg-gray-400'
              }`}></div>
            <span className="capitalize">{
              postData.status === 'published' ? 'Đã xuất bản' :
                postData.status === 'scheduled' ? 'Đã lên lịch' :
                  'Bản nháp'
            }</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveDraft}
              disabled={saving || loading}
              className="flex items-center space-x-1 px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
            </button>

            {postData.status === 'scheduled' ? (
              <button
                onClick={handleSaveScheduled}
                disabled={saving || loading}
                className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                <span>{saving ? 'Đang lên lịch...' : 'Lên lịch'}</span>
              </button>
            ) : (
              <button
                onClick={handleSavePublished}
                disabled={saving || loading}
                className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                <span>{saving ? 'Đang xuất bản...' : 'Xuất bản'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}