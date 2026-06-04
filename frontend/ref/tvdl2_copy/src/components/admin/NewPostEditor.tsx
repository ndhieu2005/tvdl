'use client';

import React, { useState } from 'react';
import SimpleRichTextEditor from './SimpleRichTextEditor';
import FallbackTextEditor from './FallbackTextEditor';
import MediaUploader from './MediaUploader';
import { useCategories } from '@/hooks/useCategories';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface PostData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string;
  featuredImage: string;
  status: 'draft' | 'published';
}

export default function NewPostEditor() {
  // Tạm thời bypass API để test input focus
  // const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const categories = [
    { id: '1', name: 'Trending Now', slug: 'trending-now' },
    { id: '2', name: 'Sounds', slug: 'sounds' },
    { id: '3', name: 'Tin tức', slug: 'news' }
  ];
  const categoriesLoading = false;
  const categoriesError = null;
  
  const [postData, setPostData] = useState<PostData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    featuredImage: '',
    status: 'draft'
  });

  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [useRichEditor, setUseRichEditor] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    setPostData(prev => ({ ...prev, title, slug }));
  };

  const handleSave = async (status: 'draft' | 'published') => {
    // Validation
    if (!postData.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết');
      return;
    }
    if (!postData.category) {
      alert('Vui lòng chọn danh mục');
      return;
    }
    if (status === 'published' && !postData.content.trim()) {
      alert('Vui lòng nhập nội dung bài viết trước khi xuất bản');
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      alert('Bạn cần đăng nhập để tạo bài viết');
      return;
    }

    try {
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
          featuredImage: postData.featuredImage,
          status,
          categoryId: postData.category,
          tagIds: postData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          seo: {
            metaTitle: postData.title,
            metaDescription: postData.excerpt,
            keywords: postData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          }
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert('Tạo bài viết thành công!');
        window.location.href = '/admin/posts';
      } else {
        alert(result.error || 'Lỗi khi tạo bài viết');
      }
    } catch (error) {
      alert('Lỗi kết nối server');
    }
  };

  const handleMediaSelect = (mediaUrl: string) => {
    setPostData(prev => ({ ...prev, featuredImage: mediaUrl }));
    setShowMediaUploader(false);
  };

  const removeFeaturedImage = () => {
    setPostData(prev => ({ ...prev, featuredImage: '' }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Tạo bài viết mới</h2>
      
      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tiêu đề bài viết *
        </label>
        <input
          type="text"
          value={postData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Nhập tiêu đề bài viết..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Slug */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slug (URL)
        </label>
        <input
          type="text"
          value={postData.slug}
          onChange={(e) => setPostData(prev => ({ ...prev, slug: e.target.value }))}
          placeholder="url-bai-viet"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Danh mục *
        </label>
        <div className="relative">
          <select
            value={postData.category}
            onChange={(e) => setPostData(prev => ({ ...prev, category: e.target.value }))}
            disabled={categoriesLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {categoriesLoading ? 'Đang tải danh mục...' : 'Chọn danh mục'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          {categoriesLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        {categoriesError && (
          <p className="mt-1 text-sm text-red-600">
            Lỗi tải danh mục: {categoriesError}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (phân cách bằng dấu phẩy)
        </label>
        <input
          type="text"
          value={postData.tags}
          onChange={(e) => setPostData(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="tiktok, viral, trending"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Featured Image - Simplified */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ảnh đại diện (URL)
        </label>
        <input
          type="url"
          value={postData.featuredImage}
          onChange={(e) => setPostData(prev => ({ ...prev, featuredImage: e.target.value }))}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Excerpt */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tóm tắt
        </label>
        <textarea
          value={postData.excerpt}
          onChange={(e) => setPostData(prev => ({ ...prev, excerpt: e.target.value }))}
          placeholder="Tóm tắt ngắn gọn về bài viết..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Content */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Nội dung
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Editor:</span>
            <button
              type="button"
              onClick={() => setUseRichEditor(false)}
              className={`px-2 py-1 text-xs rounded ${
                !useRichEditor 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Simple
            </button>
            <button
              type="button"
              onClick={() => setUseRichEditor(true)}
              className={`px-2 py-1 text-xs rounded ${
                useRichEditor 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Rich
            </button>
          </div>
        </div>
        
        {useRichEditor ? (
          <SimpleRichTextEditor
            content={postData.content}
            onChange={(content) => setPostData(prev => ({ ...prev, content }))}
            placeholder="Nhập nội dung bài viết chi tiết..."
            minHeight={400}
          />
        ) : (
          <FallbackTextEditor
            content={postData.content}
            onChange={(content) => setPostData(prev => ({ ...prev, content }))}
            placeholder="Nhập nội dung bài viết chi tiết..."
            minHeight={400}
          />
        )}
      </div>

      {/* Status */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trạng thái
        </label>
        <select
          value={postData.status}
          onChange={(e) => setPostData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="draft">Bản nháp</option>
          <option value="published">Xuất bản</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={() => handleSave('draft')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Lưu nháp
        </button>
        <button
          type="button"
          onClick={() => handleSave('published')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Xuất bản
        </button>
      </div>

      {/* Debug info */}
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-medium mb-2">Debug Info:</h3>
        <p><strong>Title:</strong> {postData.title}</p>
        <p><strong>Slug:</strong> {postData.slug}</p>
        <p><strong>Category:</strong> {postData.category}</p>
        <p><strong>Tags:</strong> {postData.tags}</p>
        <p><strong>Content length:</strong> {postData.content.length}</p>
        <p><strong>Excerpt length:</strong> {postData.excerpt.length}</p>
        <p><strong>Featured Image:</strong> {postData.featuredImage ? 'Set' : 'Not set'}</p>
        <p><strong>Status:</strong> {postData.status}</p>
        <p><strong>Categories loaded:</strong> {categories.length} categories</p>
        <p><strong>Categories loading:</strong> {categoriesLoading ? 'Yes' : 'No'}</p>
      </div>


    </div>
  );
}