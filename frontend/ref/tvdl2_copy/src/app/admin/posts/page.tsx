'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string | {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  status: string;
  createdAt: string;
  viewCount: number;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface PostsResponse {
  success: boolean;
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function PostsListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bạn cần đăng nhập để xem danh sách bài viết');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category })
      });

      const response = await fetch(`/api/posts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi khi tải danh sách bài viết');
      }

      const data: PostsResponse = await response.json();
      
      if (data.success) {
        setPosts(data.data);
        setPagination(data.pagination);
        setCurrentPage(page);
      } else {
        setError('Lỗi khi tải danh sách bài viết');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      return;
    }

    console.log('🗑️ Starting delete process for post ID:', id);
    setDeleting(id);
    setError(''); // Clear previous errors
    
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
      
      console.log('🗑️ Calling delete API...');
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🗑️ API Response status:', response.status);
      console.log('🗑️ API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error('🗑️ Delete failed with status:', response.status);
        
        let errorData;
        try {
          errorData = await response.json();
          console.error('🗑️ Error response:', errorData);
        } catch (parseError) {
          console.error('🗑️ Could not parse error response:', parseError);
          errorData = { error: `HTTP error! status: ${response.status}` };
        }
        
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        setError(errorMessage);
        alert(`Lỗi: ${errorMessage}`);
        return;
      }
      
      const result = await response.json();
      console.log('🗑️ Delete successful:', result);
      
      if (result.success) {
        console.log('✅ Delete successful, updating posts list');
        setPosts(posts.filter(post => post.id !== id));
        
        // Optional: Show success message
        const successMessage = result.message || 'Xóa bài viết thành công';
        console.log('✅ Success message:', successMessage);
        
        // You can uncomment this if you want to show success alert
        // alert(successMessage);
        
        // Refresh the posts list
        fetchPosts(currentPage);
      } else {
        console.error('❌ Delete failed:', result.error);
        const errorMessage = result.error || 'Không thể xóa bài viết';
        setError(errorMessage);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'Đã xuất bản';
      case 'draft':
        return 'Bản nháp';
      case 'scheduled':
        return 'Đã lên lịch';
      default:
        return status;
    }
  };

  const getCategoryColor = (category: string | any) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    
    // Handle both string and object format
    const categorySlug = typeof category === 'string' ? category : category.slug || category.name || '';
    
    switch (categorySlug.toLowerCase()) {
      case 'trending_now':
      case 'trending-now':
      case 'trending':
        return 'bg-purple-100 text-purple-800';
      case 'sounds':
        return 'bg-blue-100 text-blue-800';
      case 'challenges':
        return 'bg-orange-100 text-orange-800';
      case 'celebrities':
        return 'bg-pink-100 text-pink-800';
      case 'top_lists':
      case 'top-lists':
        return 'bg-indigo-100 text-indigo-800';
      case 'filters':
        return 'bg-teal-100 text-teal-800';
      case 'social_media':
      case 'social-media':
        return 'bg-green-100 text-green-800';
      case 'guidelines':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string | any) => {
    if (!category) return 'Unknown';
    
    // Handle both string and object format
    if (typeof category === 'object' && category.name) {
      return category.name;
    }
    
    const categorySlug = typeof category === 'string' ? category : category.slug || '';
    
    switch (categorySlug.toLowerCase()) {
      case 'trending_now':
      case 'trending-now':
      case 'trending':
        return 'Trending Now';
      case 'sounds':
        return 'Sounds';
      case 'challenges':
        return 'Challenges';
      case 'celebrities':
        return 'Celebrities';
      case 'top_lists':
      case 'top-lists':
        return 'Top Lists';
      case 'filters':
        return 'Filters';
      case 'social_media':
      case 'social-media':
        return 'Social Media';
      case 'guidelines':
        return 'Guidelines';
      default:
        // For dynamic categories, try to convert slug to readable name
        return categorySlug.split('-').map((word: string) => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') || 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lý bài viết
        </h1>
        <Link 
          href="/admin/posts/new"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Tạo bài viết mới</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
              <select 
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent flex-1 sm:flex-none sm:min-w-[150px]"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="published">Đã xuất bản</option>
                <option value="draft">Bản nháp</option>
                <option value="scheduled">Đã lên lịch</option>
              </select>
              
              <select 
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent flex-1 sm:flex-none sm:min-w-[150px]"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                <option value="trending_now">Trending Now</option>
                <option value="sounds">Sounds</option>
                <option value="challenges">Challenges</option>
                <option value="celebrities">Celebrities</option>
                <option value="top_lists">Top Lists</option>
                <option value="filters">Filters</option>
              </select>
            </div>
            
            <button 
              onClick={() => fetchPosts(currentPage)}
              className="flex items-center justify-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors w-full sm:w-auto"
            >
              <Filter className="h-4 w-4" />
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Mobile View - Card Layout */}
        <div className="block md:hidden">
          {loading ? (
            <div className="p-6 text-center">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
              <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500">Không có bài viết nào</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-gray-500">
                            {post.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {post.title}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            /post/{post.slug}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Tác giả:</span>
                          <span className="text-xs font-medium text-gray-900">{post.author.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Danh mục:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                            {getCategoryLabel(post.category)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Trạng thái:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                            {getStatusLabel(post.status)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Ngày tạo:</span>
                          <span className="text-xs text-gray-900">{formatDate(post.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Lượt xem:</span>
                          <span className="text-xs text-gray-900">{post.viewCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Fixed Action Column for Mobile */}
                    <div className="flex flex-col items-center space-y-2 ml-4">
                      <button 
                        onClick={() => window.open(`/preview/${post.slug}`, '_blank')}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem trước bài viết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link 
                        href={`/admin/posts/${post.id}/edit`} 
                        className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting === post.id}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Xóa"
                      >
                        {deleting === post.id ? (
                          <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop/Tablet View - Table Layout */}
        <div className="hidden md:block">
          <div className="table-container">
            <div className="relative">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                      Bài viết
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Tác giả
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Danh mục
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                      Ngày tạo
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Lượt xem
                    </th>
                    {/* Fixed Action Column */}
                    <th className="sticky-column-header px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
                      </td>
                    </tr>
                  ) : posts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-sm text-gray-500">Không có bài viết nào</p>
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} className="table-row-hover hover:bg-gray-50">
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap min-w-0">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 md:h-12 md:w-12">
                              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-500">
                                  {post.title.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3 md:ml-4 min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-[200px] md:max-w-xs">
                                {post.title}
                              </div>
                              <div className="text-xs md:text-sm text-gray-500 truncate">
                                /post/{post.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-sm text-gray-900">{post.author.name}</div>
                          <div className="text-sm text-gray-500">{post.author.role}</div>
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <span className={`inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                            <span className="hidden lg:inline">{getCategoryLabel(post.category)}</span>
                            <span className="lg:hidden">{getCategoryLabel(post.category).substring(0, 3)}</span>
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                            <span className="hidden lg:inline">{getStatusLabel(post.status)}</span>
                            <span className="lg:hidden">
                              {post.status.toLowerCase() === 'published' ? '✓' : 
                               post.status.toLowerCase() === 'draft' ? '📝' : '⏰'}
                            </span>
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">
                          {formatDate(post.createdAt)}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {post.viewCount.toLocaleString()}
                        </td>
                        {/* Fixed Action Column */}
                        <td className="sticky-column px-3 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium border-l border-gray-200">
                          <div className="flex items-center justify-end space-x-1">
                            <button 
                              onClick={() => window.open(`/preview/${post.slug}`, '_blank')}
                              className="p-1.5 md:p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md md:rounded-lg transition-colors"
                              title="Xem trước bài viết"
                            >
                              <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </button>
                            <Link 
                              href={`/admin/posts/${post.id}/edit`} 
                              className="p-1.5 md:p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-md md:rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Link>
                            <button 
                              onClick={() => handleDelete(post.id)}
                              disabled={deleting === post.id}
                              className="p-1.5 md:p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md md:rounded-lg transition-colors disabled:opacity-50"
                              title="Xóa"
                            >
                              {deleting === post.id ? (
                                <div className="h-3.5 w-3.5 md:h-4 md:w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span> đến{' '}
                <span className="font-medium">{Math.min(currentPage * pagination.limit, pagination.total)}</span> của{' '}
                <span className="font-medium">{pagination.total}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                        currentPage === page
                          ? 'bg-purple-50 text-purple-600 border-purple-300'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}