'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Eye, FileText, Tag, Calendar, Activity } from 'lucide-react';
import { useCategoryStats } from '@/hooks/useCategories';
import CategoryAnalytics from './CategoryAnalytics';

export default function CategoryStats() {
  const { stats, loading, error } = useCategoryStats();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-red-600 text-center">
          <p>Không thể tải thống kê</p>
        </div>
      </div>
    );
  }

  // Safely handle categories data
  const categories = stats.categories || [];
  const topCategories = categories.slice(0, 5);

  return (
    <div className="space-y-6">
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
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Phân tích chi tiết</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <Tag className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{stats.totals?.totalCategories || 0}</h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Tổng danh mục</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{stats.totals?.totalPosts || 0}</h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Tổng bài viết</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{(stats.totals?.totalViews || 0).toLocaleString()}</h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Tổng lượt xem</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{stats.totals?.recentPosts || 0}</h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Bài viết gần đây</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-gray-600" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Top 5 Danh mục</h3>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {topCategories.map((category: any, index: number) => (
            <div key={category.category || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex-shrink-0">
                  <span className="text-xs sm:text-sm font-medium text-purple-600">#{index + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{category.category ? category.category.replace('_', ' ') : 'N/A'}</h4>
                  <p className="text-xs sm:text-sm text-gray-500">{category.postsCount || 0} bài viết</p>
                </div>
              </div>
              
              <div className="text-left sm:text-right">
                <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{(category.totalViews || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{(category.totalLikes || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Published: {category.publishedPosts || 0} | Draft: {category.draftPosts || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Hiệu suất danh mục</h3>
        
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bài viết
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt xem
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Likes
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Shares
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Điểm ưu tiên
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category: any, index: number) => (
                  <tr key={category.category || index} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {category.category ? category.category.replace('_', ' ') : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">{category.postsCount || 0}</div>
                      <div className="text-xs text-gray-500">
                        {category.recentPosts || 0} gần đây
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {(category.totalViews || 0).toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                      {(category.totalLikes || 0).toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                      {(category.totalShares || 0).toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center">
                        <div className="text-xs sm:text-sm text-gray-900">
                          {(category.averagePriority || 0).toFixed(2)}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        </div>
      ) : (
        <CategoryAnalytics />
      )}
    </div>
  );
}