'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle, 
  Calendar,
  Target,
  Award,
  Activity,
  RefreshCw
} from 'lucide-react';

interface CategoryAnalytics {
  timeRange: {
    days: number;
    startDate: string;
    endDate: string;
  };
  totals: {
    totalPosts: number;
    recentPosts: number;
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
  };
  categories: Array<{
    category: string;
    name: string;
    posts: {
      recent: number;
      total: number;
    };
    stats: {
      totalViews: number;
      totalLikes: number;
      totalShares: number;
      totalComments: number;
      averagePriority: number;
    };
    engagement: {
      averageViewsPerPost: number;
      averageLikesPerPost: number;
      engagementRate: number;
    };
    statusDistribution: Record<string, number>;
  }>;
  topCategories: any[];
  growthTrends: Array<{
    category: string;
    name: string;
    viewsGrowth: number;
    postsGrowth: number;
  }>;
  summary: {
    totalCategories: number;
    activeCategories: number;
    mostActiveCategory: string;
    averagePostsPerCategory: number;
    totalEngagement: number;
  };
}

interface CategoryAnalyticsProps {
  defaultTimeRange?: number;
}

export default function CategoryAnalytics({ defaultTimeRange = 30 }: CategoryAnalyticsProps) {
  const [analytics, setAnalytics] = useState<CategoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(defaultTimeRange);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/categories/analytics?timeRange=${timeRange}&includeDetails=true`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
        setError(null);
      } else {
        setError(data.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Có lỗi xảy ra khi tải analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Lỗi khi tải analytics</h3>
        <p className="text-red-600 mt-1">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Thử lại</span>
        </button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Category Analytics</h2>
          <p className="text-gray-600">
            Phân tích hiệu suất trong {timeRange} ngày qua
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7">7 ngày</option>
            <option value="30">30 ngày</option>
            <option value="90">90 ngày</option>
            <option value="365">1 năm</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {analytics.summary.totalCategories}
              </h3>
              <p className="text-sm text-gray-500">Tổng danh mục</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {analytics.summary.activeCategories}
              </h3>
              <p className="text-sm text-gray-500">Danh mục hoạt động</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {formatNumber(analytics.totals.totalViews)}
              </h3>
              <p className="text-sm text-gray-500">Tổng lượt xem</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Heart className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {formatNumber(analytics.summary.totalEngagement)}
              </h3>
              <p className="text-sm text-gray-500">Tổng tương tác</p>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Trends */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Xu hướng tăng trưởng</h3>
        <div className="space-y-4">
          {analytics.growthTrends.map((trend, index) => (
            <div key={trend.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                  <span className="text-sm font-medium text-purple-600">#{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{trend.name}</h4>
                  <p className="text-sm text-gray-500">{trend.postsGrowth} bài viết gần đây</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 ${getGrowthColor(trend.viewsGrowth)}`}>
                  {getGrowthIcon(trend.viewsGrowth)}
                  <span className="text-sm font-medium">
                    {trend.viewsGrowth > 0 ? '+' : ''}{trend.viewsGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Categories Performance */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hiệu suất danh mục</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bài viết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lượt xem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tương tác
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tỷ lệ tương tác
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topCategories.map((category, index) => (
                <tr key={category.category} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mr-3">
                        <span className="text-sm font-medium text-purple-600">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        <div className="text-sm text-gray-500">{category.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{category.posts.total}</div>
                    <div className="text-sm text-gray-500">{category.posts.recent} gần đây</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(category.stats.totalViews)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>{formatNumber(category.stats.totalLikes)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="h-4 w-4 text-blue-500" />
                        <span>{formatNumber(category.stats.totalShares)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">
                        {category.engagement.engagementRate.toFixed(2)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published: {category.statusDistribution.PUBLISHED || 0}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Draft: {category.statusDistribution.DRAFT || 0}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}