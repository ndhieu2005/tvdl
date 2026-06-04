'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Search, Filter, Edit, Trash2, Eye, Tag, Clock, BarChart3, RefreshCw, TrendingUp } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import CategoryStats from '@/components/admin/CategoryStats';
import { ToastContainer, useToast } from '@/components/admin/Toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  postsCount: number;
  color: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesListPage() {
  const { categories, stats, loading, error, refetch } = useCategories();
  const { toasts, removeToast, showSuccess, showError, showInfo, showWarning } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Filter categories based on search and status
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || category.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        refetch(); // Refresh the categories list
        setShowDeleteModal(null);
        showSuccess('Xóa category thành công');
      } else {
        showError(data.message || 'Có lỗi xảy ra khi xóa category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showError('Có lỗi xảy ra khi xóa category');
    }
  };

  const toggleStatus = async (categoryId: string) => {
    try {
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) return;
      
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: category.status === 'active' ? 'inactive' : 'active'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        refetch(); // Refresh the categories list
        showSuccess('Cập nhật trạng thái thành công');
      } else {
        showError(data.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating category status:', error);
      showError('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Lỗi khi tải danh sách categories</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Thử lại</span>
          </button>
        </div>
      </div>
    );
  }

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedCategories.length === 0) {
      showWarning('Vui lòng chọn ít nhất một danh mục');
      return;
    }

    try {
      const response = await fetch('/api/admin/categories/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          categoryIds: selectedCategories
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (action === 'export') {
          // Handle export
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `categories-export-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          refetch();
        }
        setSelectedCategories([]);
        setShowBulkActions(false);
        showSuccess(data.message);
      } else {
        showError(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showError('Có lỗi xảy ra khi thực hiện thao tác');
    }
  };

  // Handle select all categories
  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map(cat => cat.id));
    }
  };

  // Handle individual category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            Quản lý danh mục
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Quản lý các danh mục bài viết trên website
          </p>
        </div>
        
        {/* Mobile buttons - stacked */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-row">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm font-medium ${
              showStats 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{showStats ? 'Ẩn thống kê' : 'Xem thống kê'}</span>
          </button>
          
          <button
            onClick={refetch}
            className="w-full sm:w-auto bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Làm mới</span>
          </button>
          
          <Link 
            href="/admin/categories/new"
            className="w-full sm:w-auto bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
          >
            <PlusCircle className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Tạo danh mục mới</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <Tag className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{stats?.total || 0}</h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Tổng danh mục</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {stats?.active || 0}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Đang hoạt động</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {stats?.inactive || 0}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Không hoạt động</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {stats?.totalPosts || 0}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Tổng bài viết</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Stats */}
      {showStats && (
        <div className="animate-in slide-in-from-top-2">
          <CategoryStats />
        </div>
      )}

      {/* Bulk Actions */}
      {selectedCategories.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-sm font-medium text-purple-900">
                Đã chọn {selectedCategories.length} danh mục
              </span>
              <button
                onClick={() => setSelectedCategories([])}
                className="text-sm text-purple-600 hover:text-purple-800 self-start"
              >
                Bỏ chọn tất cả
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleBulkAction('export')}
                className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors font-medium"
              >
                Xuất dữ liệu
              </button>
              <button
                onClick={() => handleBulkAction('activate')}
                className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors font-medium"
              >
                Kích hoạt
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 transition-colors font-medium"
              >
                Tạm dừng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Chọn tất cả</span>
            </div>
            
            <div className="relative flex-1 sm:flex-initial sm:min-w-0 sm:w-64">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm min-w-0"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium">
            <Filter className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Bộ lọc nâng cao</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Category Header */}
            <div 
              className="h-2 sm:h-3"
              style={{ backgroundColor: category.color }}
            ></div>
            
            <div className="p-4 sm:p-6">
              {/* Category Selection */}
              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategorySelect(category.id)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mt-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                        {category.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mb-2 truncate">
                        /{category.slug}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-start sm:justify-end">
                      <button
                        onClick={() => toggleStatus(category.id)}
                        className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          category.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-500 mb-4">
                <span className="font-medium">{category.postsCount} bài viết</span>
                <span className="truncate">Cập nhật: {new Date(category.updatedAt).toLocaleDateString('vi-VN')}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(category.id)}
                    className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                  title="Màu danh mục"
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
          <Tag className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy danh mục nào
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6">
            Hãy thử thay đổi từ khóa tìm kiếm hoặc tạo danh mục mới.
          </p>
          <Link
            href="/admin/categories/new"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center space-x-2 text-sm font-medium"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Tạo danh mục đầu tiên</span>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Xác nhận xóa danh mục
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteCategory(showDeleteModal)}
                className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
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