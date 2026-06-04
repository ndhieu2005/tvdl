'use client';

import React, { useState, useEffect } from 'react';

interface AdminStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  todayViews: number;
  totalComments: number;
  trendingPosts: number;
  recentPosts: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    createdAt: string;
    viewCount: number;
    category: {
      id: string;
      name: string;
      slug: string;
      color?: string;
    } | null;
    author: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }>;
}

export default function TestStatsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [token, setToken] = useState<string>('');

  const fetchStats = async () => {
    if (!token) {
      setError('Please enter a token first');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch stats');
      }

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError('Failed to fetch stats');
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Admin Stats API</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Authentication</h2>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Enter JWT token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={fetchStats}
              disabled={loading || !token}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Fetch Stats'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            You can get a token by logging in to the admin panel and checking localStorage
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Posts</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPosts}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Published Posts</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.publishedPosts}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Draft Posts</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.draftPosts}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Today Views</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayViews.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Comments</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalComments}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Trending Posts</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.trendingPosts}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Recent Posts</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.recentPosts.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Recent Posts</h3>
              </div>
              <div className="p-6">
                {stats.recentPosts.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentPosts.map((post) => (
                      <div key={post.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {post.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString('vi-VN')} • 
                            {post.category?.name || 'No category'} • 
                            {post.viewCount} views
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent posts found</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}