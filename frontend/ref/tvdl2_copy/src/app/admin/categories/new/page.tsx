'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Palette, Tag, FileText, Globe, Hash, AlertCircle, CheckCircle } from 'lucide-react';

const predefinedColors = [
  '#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
  '#EC4899', '#F97316', '#84CC16', '#06B6D4', '#6366F1'
];

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
  status: 'active' | 'inactive';
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
}

export default function NewCategoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    color: predefinedColors[0],
    status: 'active',
    metaTitle: '',
    metaDescription: '',
    featured: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'seo'>('general');
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Load form data on component mount
  useEffect(() => {
    const loadFormData = async () => {
      try {
        // Get existing categories from main API
        const response = await fetch('/api/admin/categories');
        const data = await response.json();
        
        if (data.success) {
          setExistingCategories(data.data.map((cat: any) => cat.slug));
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        setError('Không thể tải dữ liệu form');
      } finally {
        setLoading(false);
      }
    };
    
    loadFormData();
  }, []);

  const handleNameChange = (name: string) => {
    const slug = generateSlug(name);
    setFormData(prev => ({
      ...prev,
      name,
      slug,
      metaTitle: name
    }));
    
    // Check if slug already exists
    if (existingCategories.includes(slug)) {
      setError('Slug này đã tồn tại. Vui lòng chọn tên khác.');
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate form
      if (!formData.name.trim()) {
        setError('Tên danh mục là bắt buộc');
        return;
      }

      if (!formData.slug.trim()) {
        setError('Slug là bắt buộc');
        return;
      }

      if (existingCategories.includes(formData.slug)) {
        setError('Slug này đã tồn tại');
        return;
      }

      // Call API to create category
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setInstructions(data.instructions || []);
        
        // Wait a moment then redirect
        setTimeout(() => {
          router.push('/admin/categories');
        }, 3000);
      } else {
        setError(data.error || 'Có lỗi xảy ra khi tạo danh mục');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Có lỗi xảy ra khi tạo danh mục');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    // In real app, this would open a preview modal or new tab
    console.log('Preview category:', formData);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/categories"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tạo danh mục mới
            </h1>
            <p className="text-gray-600 mt-1">
              Thêm danh mục mới cho bài viết
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
            form="category-form"
            disabled={isSubmitting || !!error || existingCategories.includes(formData.slug)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu danh mục'}</span>
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
          {instructions.length > 0 && (
            <div className="mt-3 text-sm text-green-700">
              <div className="font-medium mb-1">Các bước tiếp theo:</div>
              <ul className="list-disc list-inside space-y-1 ml-4">
                {instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
              <div className="mt-2 text-xs text-green-600">
                Tự động chuyển hướng trong 3 giây...
              </div>
            </div>
          )}
        </div>
      )}

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
                <Tag className="h-4 w-4" />
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

        <form id="category-form" onSubmit={handleSubmit} className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tên danh mục..."
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <div className="relative">
                  <Hash className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => {
                      const slug = e.target.value;
                      setFormData(prev => ({ ...prev, slug }));
                      
                      // Check if slug already exists
                      if (existingCategories.includes(slug)) {
                        setError('Slug này đã tồn tại. Vui lòng chọn slug khác.');
                      } else {
                        setError(null);
                      }
                    }}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      existingCategories.includes(formData.slug) 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="ten-danh-muc"
                    required
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-500">
                    URL: /category/{formData.slug || 'ten-danh-muc'}
                  </p>
                  {existingCategories.includes(formData.slug) && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Slug đã tồn tại
                    </p>
                  )}
                </div>
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
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Mô tả ngắn về danh mục này..."
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu sắc danh mục
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

              {/* Status and Featured */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    Danh mục nổi bật
                  </label>
                </div>
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
                  placeholder="Mô tả ngắn gọn về danh mục này để hiển thị trên công cụ tìm kiếm..."
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
                    {formData.metaTitle || formData.name || 'Tiêu đề danh mục'}
                  </div>
                  <div className="text-green-700 text-sm">
                    viralpeek.com/category/{formData.slug || 'ten-danh-muc'}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {formData.metaDescription || formData.description || 'Mô tả danh mục sẽ hiển thị ở đây...'}
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
          Xem trước danh mục
        </h3>
        <div className="border rounded-lg p-4 max-w-sm">
          <div 
            className="h-2 rounded-t-lg"
            style={{ backgroundColor: formData.color }}
          ></div>
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-1">
              {formData.name || 'Tên danh mục'}
            </h4>
            <p className="text-sm text-gray-500 mb-2">
              /{formData.slug || 'ten-danh-muc'}
            </p>
            <p className="text-sm text-gray-600">
              {formData.description || 'Mô tả danh mục sẽ hiển thị ở đây...'}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                formData.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {formData.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
              </span>
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: formData.color }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}