'use client';

import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  Trash2, 
  Eye, 
  Plus,
  Search,
  Filter,
  Calendar,
  Globe,
  FileText,
  Clock,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import { postAPI, PostQueryParams } from '@/lib/api';
import { IPost } from '@/lib/models/Post';
import { format } from 'date-fns';

interface PostListProps {
  onEdit?: (post: IPost) => void;
  onNew?: () => void;
}

export default function PostList({ onEdit, onNew }: PostListProps) {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<PostQueryParams>({
    page: 1,
    limit: 10,
    status: '',
    category: '',
    search: ''
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    loadPosts();
  }, [filters]);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await postAPI.getPosts(filters);
      
      if (response.success && response.data) {
        setPosts(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.error || 'Failed to load posts');
      }
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      return;
    }

    console.log('🗑️ Starting delete process for post ID:', id);
    setDeleting(id);
    setError(null); // Clear previous errors
    
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (!token) {
        console.error('❌ No token found in localStorage');
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }
      
      console.log('🗑️ Calling deletePost API...');
      const response = await postAPI.deletePost(id);
      
      console.log('🗑️ API Response:', response);
      
      if (response.success) {
        console.log('✅ Delete successful, updating posts list');
        setPosts(posts.filter(post => post.id !== id));
        
        // Optional: Show success message
        const successMessage = response.message || 'Xóa bài viết thành công';
        console.log('✅ Success message:', successMessage);
        
        // You can uncomment this if you want to show success alert
        // alert(successMessage);
      } else {
        console.error('❌ Delete failed:', response.error);
        const errorMessage = response.error || 'Không thể xóa bài viết';
        setError(errorMessage);
        
        // Show error alert
        alert(`Lỗi: ${errorMessage}`);
      }
    } catch (err) {
      console.error('❌ Exception during delete:', err);
      const errorMessage = 'Có lỗi xảy ra khi xóa bài viết. Vui lòng thử lại.';
      setError(errorMessage);
      
      // Show error alert
      alert(`Lỗi: ${errorMessage}`);
      
      // Log additional error info
      if (err instanceof Error) {
        console.error('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
      }
    } finally {
      console.log('🗑️ Delete process completed');
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Bản nháp', color: 'bg-gray-100 text-gray-700', icon: FileText },
      published: { label: 'Đã xuất bản', color: 'bg-green-100 text-green-700', icon: Globe },
      scheduled: { label: 'Đã lên lịch', color: 'bg-blue-100 text-blue-700', icon: Clock }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý bài viết</h1>
        {onNew && (
          <button
            onClick={onNew}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo bài viết</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                placeholder="Tìm kiếm bài viết..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="draft">Bản nháp</option>
              <option value="published">Đã xuất bản</option>
              <option value="scheduled">Đã lên lịch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Tất cả danh mục</option>
              <option value="trending-now">Trending Now</option>
              <option value="sounds">Sounds</option>
              <option value="challenges">Challenges</option>
              <option value="celebrities">Celebrities</option>
              <option value="filters">Filters</option>
              <option value="top-lists">Top Lists</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng
            </label>
            <select
              value={filters.limit || 10}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Đang tải...</span>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài viết nào</h3>
            <p className="text-gray-500">Tạo bài viết đầu tiên để bắt đầu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bài viết
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt xem
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {post.featuredImage && (
                          <div className="flex-shrink-0 h-12 w-12">
                            <Image
                              src={post.featuredImage}
                              alt={post.title}
                              className="h-12 w-12 rounded-lg object-cover"
                              width={48}
                              height={48}
                            />
                          </div>
                        )}
                        <div className={post.featuredImage ? 'ml-4' : ''}>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {post.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.category && (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                          {post.category.name || post.category.slug}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {post.viewCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(post)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deleting === post.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deleting === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Hiển thị {((pagination.page - 1) * pagination.limit) + 1} đến{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} bài viết
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
              disabled={!pagination.hasNext}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}