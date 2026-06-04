'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Palette, Tags, Hash, Globe } from 'lucide-react';

const predefinedColors = [
  '#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
  '#EC4899', '#F97316', '#84CC16', '#06B6D4', '#6366F1'
];

interface TagFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
  status: 'active' | 'inactive';
  metaTitle: string;
  metaDescription: string;
}

export default function NewTagPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    slug: '',
    description: '',
    color: predefinedColors[0],
    status: 'active',
    metaTitle: '',
    metaDescription: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'seo'>('general');

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
      metaTitle: `#${name} - Thẻ TikTok Viral`
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, this would be an API call
      console.log('Saving tag:', formData);
      
      // Redirect back to tags list
      router.push('/admin/tags');
    } catch (error) {
      console.error('Error saving tag:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    // In real app, this would open a preview modal or new tab
    console.log('Preview tag:', formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/tags"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tạo thẻ mới
            </h1>
            <p className="text-gray-600 mt-1">
              Thêm thẻ mới để phân loại bài viết
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
            form="tag-form"
            disabled={isSubmitting}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thẻ'}</span>
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
                <Tags className="h-4 w-4" />
                <span>Thông tin chung</span>
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

        <form id="tag-form" onSubmit={handleSubmit} className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên thẻ *
                </label>
                <div className="relative">
                  <Hash className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nhập tên thẻ..."
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Tên thẻ sẽ hiển thị dưới dạng #{formData.name || 'ten-the'}
                </p>
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="ten-the"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL: /tag/{formData.slug || 'ten-the'}
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Mô tả ngắn về thẻ này..."
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu sắc thẻ
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-400' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Palette className="h-4 w-4 text-gray-400" />
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-8 h-8 rounded border border-gray-300"
                    />
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
                  placeholder="Mô tả ngắn gọn về thẻ này để hiển thị trên công cụ tìm kiếm..."
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
                    {formData.metaTitle || `#${formData.name}` || 'Tiêu đề thẻ'}
                  </div>
                  <div className="text-green-700 text-sm">
                    viralpeek.com/tag/{formData.slug || 'ten-the'}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {formData.metaDescription || formData.description || 'Mô tả thẻ sẽ hiển thị ở đây...'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Preview Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Xem trước thẻ
        </h3>
        <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-full border max-w-xs"
             style={{ 
               borderColor: formData.color,
               color: formData.color,
               backgroundColor: `${formData.color}10`
             }}>
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: formData.color }}
          ></div>
          <span className="font-medium">
            #{formData.name || 'ten-the'}
          </span>
        </div>
        
        {formData.description && (
          <p className="text-sm text-gray-600 mt-3 max-w-md">
            {formData.description}
          </p>
        )}
        
        <div className="flex items-center space-x-4 mt-4 text-xs text-gray-500">
          <span>Slug: /{formData.slug || 'ten-the'}</span>
          <span className={`px-2 py-1 rounded-full ${
            formData.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {formData.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
          </span>
        </div>
      </div>
    </div>
  );
}