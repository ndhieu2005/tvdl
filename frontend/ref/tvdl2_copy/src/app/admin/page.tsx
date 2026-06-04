'use client';

import React from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  FileText, 
  Eye, 
  MessageSquare, 
  TrendingUp,
  Image,
  RefreshCw
} from 'lucide-react';
import AuthStatusBanner from '@/components/admin/AuthStatusBanner';
import RoomBookingStats from '@/components/admin/RoomBookingStats';
import CardRegistrationStats from '@/components/admin/CardRegistrationStats';
import { useAdminStats } from '@/hooks/useAdminStats';

export default function AdminDashboard() {
  const { stats, loading, error, refetch } = useAdminStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="space-y-6">
      {/* Auth Status Banner */}
      <AuthStatusBanner />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={refetch}
            disabled={loading}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
          <Link 
            href="/admin/posts/new"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Tạo bài viết mới</span>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Lỗi khi tải thống kê
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng bài viết</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats?.totalPosts || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Eye className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng lượt xem</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : (stats?.totalViews || 0).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Bình luận</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats?.totalComments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Trending posts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats?.trendingPosts || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Bài viết gần đây</h2>
              <Link 
                href="/admin/posts"
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 border border-gray-200 rounded-lg animate-pulse">
                    <div className="w-full sm:w-16 h-32 sm:h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex flex-row sm:flex-col lg:flex-row items-start space-x-2 sm:space-x-0 sm:space-y-2 lg:space-y-0 lg:space-x-2">
                      <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                      <div className="w-8 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.recentPosts && stats.recentPosts.length > 0 ? (
              <div className="space-y-4">
                {stats.recentPosts.map((post) => (
                  <div key={post.id} className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-16 h-32 sm:h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                      {post.featuredImage ? (
                        <>
                          <img 
                            src={post.featuredImage} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.parentElement?.querySelector('.fallback-icon');
                              if (fallback) {
                                fallback.classList.remove('hidden');
                              }
                            }}
                          />
                          <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-gray-400" />
                          </div>
                        </>
                      ) : (
                        <FileText className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 sm:truncate">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="block sm:inline">{formatDate(post.createdAt)}</span>
                        <span className="hidden sm:inline"> • </span>
                        <span className="block sm:inline">{post.category?.name || 'Không có danh mục'}</span>
                        <span className="hidden sm:inline"> • </span>
                        <span className="block sm:inline">{post.viewCount} lượt xem</span>
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-row sm:flex-col lg:flex-row items-start sm:items-end lg:items-center space-x-2 sm:space-x-0 sm:space-y-2 lg:space-y-0 lg:space-x-2 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                        {getStatusLabel(post.status)}
                      </span>
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap"
                      >
                        Sửa
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có bài viết nào</p>
                <Link
                  href="/admin/posts/new"
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2 inline-block"
                >
                  Tạo bài viết đầu tiên
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Thao tác nhanh</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              <Link 
                href="/admin/posts/new"
                className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Tạo bài viết mới</span>
              </Link>
              <Link 
                href="/admin/media"
                className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Image className="h-5 w-5" />
                <span>Quản lý media</span>
              </Link>
              <Link 
                href="/admin/comments"
                className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Kiểm duyệt bình luận</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Card Registration Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Thống kê đăng ký thẻ thư viện</h2>
        <CardRegistrationStats />
      </div>

      {/* Room Booking Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Thống kê đặt phòng</h2>
        <RoomBookingStats />
      </div>
    </div>
  );
}