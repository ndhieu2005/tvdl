'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  ExternalLink, 
  Calendar, 
  Hash, 
  BarChart3, 
  Eye,
  Clock,
  Tags,
  Globe,
  FileText,
  TrendingUp
} from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  status: 'active' | 'inactive';
  metaTitle: string;
  metaDescription: string;
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
const mockTags: Record<string, Tag> = {
  '1': {
    id: '1',
    name: 'viral',
    slug: 'viral',
    description: 'Nội dung viral trên các nền tảng social media',
    color: '#8B5CF6',
    status: 'active',
    metaTitle: '#viral - Thẻ TikTok Viral',
    metaDescription: 'Khám phá những nội dung viral nhất trên TikTok và các mạng xã hội. Xu hướng hot, video trending và những điều đang được quan tâm.',
    postsCount: 87,
    viewsCount: 234560,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  }
};

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Top 10 Video TikTok Viral nhất tuần này',
    slug: 'top-10-video-tiktok-viral-nhat-tuan-nay',
    status: 'published',
    publishedAt: '2024-01-20',
    views: 25420,
    thumbnail: ''
  },
  {
    id: '2',
    title: 'Bí quyết tạo content viral trên TikTok',
    slug: 'bi-quyet-tao-content-viral-tiktok',
    status: 'published',
    publishedAt: '2024-01-19',
    views: 18350,
    thumbnail: ''
  },
  {
    id: '3',
    title: 'Phân tích xu hướng viral mới nhất',
    slug: 'phan-tich-xu-huong-viral-moi-nhat',
    status: 'draft',
    publishedAt: '2024-01-18',
    views: 12760,
    thumbnail: ''
  }
];

export default function TagDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      // Type guard to ensure id exists and is a string
      if (resolved && typeof resolved.id === 'string') {
        setResolvedParams({ id: resolved.id });
      } else {
        setResolvedParams(null);
      }
    };
    resolveParams();
  }, [params]);

  const tagId = resolvedParams?.id || "";
  
  const [tag, setTag] = useState<Tag | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'seo'>('overview');

  // Load tag data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const tagData = mockTags[tagId];
        if (!tagData) {
          router.push('/admin/tags');
          return;
        }
        
        setTag(tagData);
        setPosts(mockPosts);
      } catch (error) {
        console.error('Error loading data:', error);
        router.push('/admin/tags');
      } finally {
        setLoading(false);
      }
    };

    if (tagId) {
      loadData();
    }
  }, [tagId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy thẻ</p>
      </div>
    );
  }

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
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: tag.color }}
              ></div>
              <h1 className="text-2xl font-bold text-gray-900">
                #{tag.name}
              </h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                tag.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {tag.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              {tag.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            href={`/tag/${tag.slug}`}
            target="_blank"
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Xem trước</span>
          </Link>
          <Link
            href={`/admin/tags/${tag.id}/edit`}
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
              <h3 className="text-lg font-semibold text-gray-900">{tag.postsCount}</h3>
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
                {tag.viewsCount.toLocaleString()}
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
                {new Date(tag.createdAt).toLocaleDateString('vi-VN')}
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
                {new Date(tag.updatedAt).toLocaleDateString('vi-VN')}
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
                <span>Bài viết ({posts.length})</span>
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
                      <Tags className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">Tên:</span>
                      <span className="text-sm text-gray-900">#{tag.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">Slug:</span>
                      <span className="text-sm text-gray-900">/{tag.slug}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-500">Màu:</span>
                      <span className="text-sm text-gray-900">{tag.color}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Mô tả</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {tag.description}
                  </p>
                </div>
              </div>

              {/* Tag Display */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Hiển thị thẻ</h3>
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border"
                     style={{ 
                       borderColor: tag.color,
                       color: tag.color,
                       backgroundColor: `${tag.color}15`
                     }}>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  <span className="font-medium text-lg">
                    #{tag.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({tag.postsCount})
                  </span>
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
                  Bài viết có thẻ #{tag.name}
                </h3>
                <Link
                  href={`/admin/posts/new?tag=${tag.id}`}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Thêm bài viết
                </Link>
              </div>

              {/* Posts Table */}
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
                    {posts.map((post) => (
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
                            post.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : post.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {post.status === 'published' ? 'Đã xuất bản' : 
                             post.status === 'draft' ? 'Bản nháp' : 'Đã lên lịch'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.views.toLocaleString()}
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
                      <p className="text-sm text-gray-900 mt-1">{tag.metaTitle}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-500">Meta Description:</span>
                      <p className="text-sm text-gray-900 mt-1">{tag.metaDescription}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-500">URL Canonical:</span>
                      <p className="text-sm text-gray-900 mt-1">
                        https://viralpeek.com/tag/{tag.slug}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Xem trước Google</h3>
                  <div className="bg-white rounded border p-3">
                    <div className="text-blue-600 text-lg font-medium">
                      {tag.metaTitle}
                    </div>
                    <div className="text-green-700 text-sm">
                      viralpeek.com/tag/{tag.slug}
                    </div>
                    <div className="text-gray-600 text-sm mt-1">
                      {tag.metaDescription}
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