'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  ExternalLink, 
  Calendar, 
  Tag, 
  BarChart3, 
  Eye,
  Clock,
  Hash,
  Globe,
  FileText,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useCategory } from '@/hooks/useCategories';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  status: 'active' | 'inactive';
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  postsCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'scheduled';
  publishedAt: string;
  views: number;
  thumbnail: string;
}

// Mock data
const mockCategories: Record<string, Category> = {
  '1': {
    id: '1',
    name: 'Trending Now',
    slug: 'trending-now',
    description: 'Những xu hướng hot nhất hiện tại trên TikTok',
    color: '#8B5CF6',
    status: 'active',
    metaTitle: 'Trending Now - Xu hướng TikTok mới nhất',
    metaDescription: 'Khám phá những xu hướng TikTok hot nhất, viral content và những điều đang được quan tâm nhất hiện tại.',
    featured: true,
    postsCount: 45,
    viewsCount: 125430,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  }
};

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Top 10 TikTok Trends đang "viral" nhất tuần này',
    slug: 'top-10-tiktok-trends-viral-tuan-nay',
    status: 'published',
    publishedAt: '2024-01-20',
    views: 15420,
    thumbnail: ''
  },
  {
    id: '2',
    title: 'Bí quyết tạo content viral trên TikTok 2024',
    slug: 'bi-quyet-tao-content-viral-tiktok-2024',
    status: 'published',
    publishedAt: '2024-01-19',
    views: 12350,
    thumbnail: ''
  },
  {
    id: '3',
    title: 'Những hashtag trending không thể bỏ qua',
    slug: 'nhung-hashtag-trending-khong-the-bo-qua',
    status: 'draft',
    publishedAt: '2024-01-18',
    views: 8760,
    thumbnail: ''
  }
];

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  
  const { category, loading, error, refetch } = useCategory(categoryId);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'seo'>('overview');

  // Redirect if category not found
  useEffect(() => {
    if (!loading && error) {
      router.push('/admin/categories');
    }
  }, [loading, error, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
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

  if (error || !category) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Lỗi khi tải thông tin category</h3>
          <p className="text-red-600 mt-1">{error || 'Không tìm thấy danh mục'}</p>
          <div className="mt-3 flex space-x-3">
            <button
              onClick={refetch}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Thử lại</span>
            </button>
            <Link
              href="/admin/categories"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Quay lại
            </Link>
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
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              ></div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category.name}
              </h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                category.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {category.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
              </span>
              {category.featured && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Nổi bật
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">
              {category.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            href={`/category/${category.slug}`}
            target="_blank"
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Xem trước</span>
          </Link>
          <Link
            href={`/admin/categories/${category.id}/edit`}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Chỉnh sửa</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{category.postsCount || 0}</h3>
              <p className="text-sm text-gray-500">Bài viết</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {category.stats?.totalViews?.toLocaleString() || '0'}
              </h3>
              <p className="text-sm text-gray-500">Lượt xem</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {new Date(category.createdAt).toLocaleDateString('vi-VN')}
              </h3>
              <p className="text-sm text-gray-500">Ngày tạo</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {new Date(category.updatedAt).toLocaleDateString('vi-VN')}
              </h3>
              <p className="text-sm text-gray-500">Cập nhật cuối</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Tổng quan</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Bài viết ({category?.recentPosts?.length || 0})</span>
              </div>
            </button>
            <button
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

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">Tên:</span>
                      <span className="text-sm text-gray-900">{category.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">Slug:</span>
                      <span className="text-sm text-gray-900">/{category.slug}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-500">Màu:</span>
                      <span className="text-sm text-gray-900">{category.color}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Mô tả</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Recent Activity Chart Placeholder */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Biểu đồ thống kê sẽ được hiển thị ở đây</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Bài viết trong danh mục ({category.postsCount || 0})
                </h3>
                <Link
                  href={`/admin/posts/new?category=${category.id}`}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Thêm bài viết
                </Link>
              </div>

              {/* Posts Table */}
              {category.recentPosts && category.recentPosts.length > 0 ? (
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bài viết
                        </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày xuất bản
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lượt xem
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Thao tác</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {category.recentPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded bg-gray-200"></div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {post.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                /{post.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800'
                              : post.status === 'DRAFT'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {post.status === 'PUBLISHED' ? 'Đã xuất bản' : 
                             post.status === 'DRAFT' ? 'Bản nháp' : 'Đã lên lịch'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.viewCount?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Chỉnh sửa
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              ) : (
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có bài viết nào
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Danh mục này chưa có bài viết. Hãy tạo bài viết đầu tiên.
                  </p>
                  <Link
                    href={`/admin/posts/new?category=${category.id}`}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center space-x-2"
                  >
                    <span>Tạo bài viết đầu tiên</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Thông tin SEO</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Meta Title:</span>
                      <p className="text-sm text-gray-900 mt-1">{category.name}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-500">Meta Description:</span>
                      <p className="text-sm text-gray-900 mt-1">{category.description}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-500">URL Canonical:</span>
                      <p className="text-sm text-gray-900 mt-1">
                        https://viralpeek.com/category/{category.slug}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Xem trước Google</h3>
                  <div className="bg-white rounded border p-3">
                    <div className="text-blue-600 text-lg font-medium">
                      {category.metaTitle}
                    </div>
                    <div className="text-green-700 text-sm">
                      viralpeek.com/category/{category.slug}
                    </div>
                    <div className="text-gray-600 text-sm mt-1">
                      {category.metaDescription}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}