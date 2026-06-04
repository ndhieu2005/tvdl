'use client';

import React from 'react';
import { useAdminStats } from '@/hooks/useAdminStats';

export default function StatsTestComponent() {
  const { stats, loading, error, refetch } = useAdminStats();

  if (loading) {
    return <div>Loading stats...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Admin Stats Test</h3>
      <div className="space-y-2">
        <p>Total Posts: {stats?.totalPosts}</p>
        <p>Published Posts: {stats?.publishedPosts}</p>
        <p>Draft Posts: {stats?.draftPosts}</p>
        <p>Total Views: {stats?.totalViews}</p>
        <p>Today Views: {stats?.todayViews}</p>
        <p>Total Comments: {stats?.totalComments}</p>
        <p>Trending Posts: {stats?.trendingPosts}</p>
        <p>Recent Posts: {stats?.recentPosts?.length || 0}</p>
      </div>
      <button 
        onClick={refetch}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh Stats
      </button>
    </div>
  );
}