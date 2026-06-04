'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Tag, Star, Eye, AlertCircle } from 'lucide-react';

interface TagStats {
  overview: {
    totalTags: number;
    activeTags: number;
    inactiveTags: number;
    featuredTags: number;
    tagsWithPosts: number;
    unusedTags: number;
    recentTags: number;
    usageRate: number;
  };
  topTags: Array<{
    id: string;
    name: string;
    slug: string;
    postCount: number;
  }>;
  latestTags: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    createdAt: string;
  }>;
  unusedTags: Array<{
    id: string;
    name: string;
    slug: string;
    createdAt: string;
  }>;
  monthlyStats: Array<{
    month: string;
    count: number;
  }>;
  period: string;
}

export default function TagStats() {
  const [stats, setStats] = useState<TagStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/tags/stats?period=${period}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading tag stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [period]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không thể tải thống kê tags
      </div>
    );
  }

  const statusData = [
    { name: 'Hoạt động', value: stats.overview.activeTags, color: '#10B981' },
    { name: 'Không hoạt động', value: stats.overview.inactiveTags, color: '#EF4444' },
  ];

  const usageData = [
    { name: 'Đã sử dụng', value: stats.overview.tagsWithPosts, color: '#3B82F6' },
    { name: 'Chưa sử dụng', value: stats.overview.unusedTags, color: '#9CA3AF' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Thống kê Tags</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">7 ngày qua</option>
          <option value="30d">30 ngày qua</option>
          <option value="90d">90 ngày qua</option>
          <option value="1y">1 năm qua</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số Tags</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalTags}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Tag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tags Hoạt động</p>
              <p className="text-2xl font-bold text-green-600">{stats.overview.activeTags}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tags Đặc biệt</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.overview.featuredTags}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ sử dụng</p>
              <p className="text-2xl font-bold text-purple-600">{stats.overview.usageRate}%</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Phân bố theo trạng thái</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Usage Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Phân bố theo sử dụng</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {usageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Tags */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Top Tags (theo số bài viết)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.topTags}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="postCount" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Creation Stats */}
      {stats.monthlyStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Tags được tạo theo tháng</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent and Unused Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tags */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Tags mới nhất</h3>
          <div className="space-y-3">
            {stats.latestTags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{tag.name}</div>
                  <div className="text-sm text-gray-500">/{tag.slug}</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    tag.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tag.status === 'ACTIVE' ? 'Hoạt động' : 'Ẩn'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(tag.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unused Tags */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Tags chưa sử dụng
          </h3>
          <div className="space-y-3">
            {stats.unusedTags.length > 0 ? (
              stats.unusedTags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <div className="font-medium">{tag.name}</div>
                    <div className="text-sm text-gray-500">/{tag.slug}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {new Date(tag.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Tất cả tags đều đang được sử dụng
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}