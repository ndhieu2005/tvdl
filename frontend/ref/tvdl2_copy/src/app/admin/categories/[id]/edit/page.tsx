'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Eye, Palette, Tag, Globe, Hash, Trash2, Clock } from 'lucide-react';
import { useCategory } from '@/hooks/useCategories';
import { ToastContainer, useToast } from '@/components/admin/Toast';

const predefinedColors = [
  '#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
  '#EC4899', '#F97316', '#84CC16', '#06B6D4', '#6366F1'
];

interface CategoryFormData {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  status: 'active' | 'inactive';
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  // Use the useCategory hook instead of mock data
  const { category, loading, error } = useCategory(categoryId);
  const { toasts, removeToast, showSuccess, showError, showInfo, showWarning } = useToast();
  
  const [formData, setFormData] = useState<CategoryFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'advanced'>('general');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load category data from hook
  useEffect(() => {
    if (category) {
      setFormData({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        status: category.status,
        metaTitle: category.metaTitle || category.name,
        metaDescription: category.metaDescription || category.description,
        featured: category.featured || false,
        postsCount: category.postsCount,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      });
    }
  }, [category]);

  // Handle error or category not found
  useEffect(() => {
    if (error && !loading) {
      console.error('Error loading category:', error);
      router.push('/admin/categories');
    }
  }, [error, loading, router]);

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
    if (!formData) return;
    
    setFormData(prev => ({
      ...prev!,
      name,
      slug: generateSlug(name),
      metaTitle: prev!.metaTitle === prev!.name ? name : prev!.metaTitle
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setIsSubmitting(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          color: formData.color,
          status: formData.status,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          featured: formData.featured
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('Cập nhật danh mục thành công!');
        // Redirect back to categories list after a short delay
        setTimeout(() => {
          router.push('/admin/categories');
        }, 1500);
      } else {
        console.error('Error updating category:', data.message);
        showError(data.message || 'Có lỗi xảy ra khi cập nhật danh mục');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showError('Có lỗi xảy ra khi cập nhật danh mục');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!formData) return;
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('Xóa danh mục thành công!');
        // Redirect back to categories list after a short delay
        setTimeout(() => {
          router.push('/admin/categories');
        }, 1500);
      } else {
        console.error('Error deleting category:', data.message);
        showError(data.message || 'Có lỗi xảy ra khi xóa danh mục');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showError('Có lỗi xảy ra khi xóa danh mục');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handlePreview = () => {
    // In real app, this would open a preview modal or new tab
    console.log('Preview category:', formData);
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
        <p className="text-gray-500">Không tìm thấy danh mục</p>
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
              Chỉnh sửa danh mục
            </h1>
            <p className="text-gray-600 mt-1">
              Cập nhật thông tin danh mục "{formData.name}"
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
            onClick={handlePreview}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Xem trước</span>
          </button>
          <button
            type="submit"
            form="category-form"
            disabled={isSubmitting}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{formData.postsCount}</h3>
              <p className="text-sm text-gray-500">Bài viết</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {new Date(formData.createdAt).toLocaleDateString('vi-VN')}
              </h3>
              <p className="text-sm text-gray-500">Ngày tạo</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {new Date(formData.updatedAt).toLocaleDateString('vi-VN')}
              </h3>
              <p className="text-sm text-gray-500">Cập nhật cuối</p>
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
                    onChange={(e) => setFormData(prev => ({ ...prev!, slug: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="ten-danh-muc"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  URL: /category/{formData.slug}
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
                  onChange={(e) => setFormData(prev => ({ ...prev!, description: e.target.value }))}
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
                        onClick={() => setFormData(prev => ({ ...prev!, color }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev!, color: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev!, status: e.target.value as 'active' | 'inactive' }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev!, featured: e.target.checked }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev!, metaTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Tiêu đề hiển thị trên công cụ tìm kiếm..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.metaTitle?.length || 0}/60 ký tự (khuyến nghị)
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
                  placeholder="Mô tả ngắn gọn về danh mục này để hiển thị trên công cụ tìm kiếm..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.metaDescription?.length || 0}/160 ký tự (khuyến nghị)
                </p>
              </div>

              {/* SEO Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Xem trước Google
                </h4>
                <div className="bg-white rounded border p-3">
                  <div className="text-blue-600 text-lg font-medium">
                    {formData.metaTitle || formData.name}
                  </div>
                  <div className="text-green-700 text-sm">
                    viralpeek.com/category/{formData.slug}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {formData.metaDescription || formData.description}
                  </div>
                </div>
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
              Xác nhận xóa danh mục
            </h3>
            <p className="text-gray-600 mb-2">
              Bạn có chắc chắn muốn xóa danh mục "<strong>{formData.name}</strong>"?
            </p>
            <p className="text-red-600 text-sm mb-6">
              Danh mục này có {formData.postsCount} bài viết. Hành động này không thể hoàn tác.
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

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}