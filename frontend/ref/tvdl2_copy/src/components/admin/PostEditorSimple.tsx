'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Save, Eye, X, Loader2 } from 'lucide-react';

interface PostEditorProps {
  postId?: string;
  onSave?: (post: any) => void;
  onCancel?: () => void;
  onPostCreated?: (postId: string) => void;
}

export default function PostEditorSimple({ postId, onSave, onCancel, onPostCreated }: PostEditorProps) {
  const [postData, setPostData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: '',
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '', // Chuỗi, ví dụ: "từ khóa 1, từ khóa 2"
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

  // Fetch categories on mount
  useEffect(() => {
    fetch('/api/categories', {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);

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
      slug
    }));
  }, []);

  const handleSave = useCallback(async (status: 'draft' | 'published') => {
    if (saving) return;

    if (!postData.title.trim() || !postData.content.trim() || !postData.category) {
      setError('Tiêu đề, nội dung và danh mục là bắt buộc');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setError('Bạn cần đăng nhập để tạo bài viết');
        setSaving(false);
        return;
      }

      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: postData.title,
          slug: postData.slug,
          content: postData.content,
          excerpt: postData.excerpt,
          status,
          categoryId: postData.category || null,
          seo: {
            metaTitle: postData.seoTitle || undefined,
            metaDescription: postData.seoDescription || undefined,
            keywords: postData.seoKeywords?.trim() ? postData.seoKeywords.split(',').map(k => k.trim()).filter(k => k) : []
          }
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSuccess(`Bài viết đã được ${status === 'published' ? 'xuất bản' : 'lưu'} thành công!`);
        if (onPostCreated) onPostCreated(result.data.id);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Lỗi khi tạo bài viết');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi lưu bài viết');
    } finally {
      setSaving(false);
    }
  }, [postData, saving, onPostCreated]);

  return (
    <div className="space-y-6 pb-6">
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
              onChange={(e) => setPostData(prev => ({ ...prev, status: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="draft">Bản nháp</option>
              <option value="published">Xuất bản</option>
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
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? 'Đang lưu...' : 'Lưu nháp'}</span>
            </button>
            
            <button 
              onClick={() => handleSave('published')}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              <span>{saving ? 'Đang xuất bản...' : 'Xuất bản'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề bài viết *
            </label>
            <input
              type="text"
              value={postData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục *
            </label>
            <select
              value={postData.category}
              onChange={e => setPostData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug URL
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                /post/
              </span>
              <input
                type="text"
                value={postData.slug}
                onChange={(e) => setPostData(prev => ({ ...prev, slug: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tóm tắt
            </label>
            <textarea
              value={postData.excerpt}
              onChange={(e) => setPostData(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
              placeholder="Nhập tóm tắt bài viết..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung *
            </label>
            <textarea
              value={postData.content}
              onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Nhập nội dung bài viết..."
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* SEO Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Title
            </label>
            <input
              type="text"
              value={postData.seoTitle}
              onChange={e => setPostData(prev => ({ ...prev, seoTitle: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="SEO Title (tùy chọn)"
            />
          </div>

          {/* SEO Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Description
            </label>
            <textarea
              value={postData.seoDescription}
              onChange={e => setPostData(prev => ({ ...prev, seoDescription: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="SEO Description (tùy chọn)"
            />
          </div>

          {/* SEO Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Keywords (phân tách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={postData.seoKeywords}
              onChange={e => setPostData(prev => ({ ...prev, seoKeywords: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="ví dụ: keyword1, keyword2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}