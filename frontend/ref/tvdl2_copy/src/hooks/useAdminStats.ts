import { useState, useEffect } from 'react';

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
    featuredImage?: string;
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

interface UseAdminStatsReturn {
  stats: AdminStats | null;
  loading: boolean;
  error: string;
  refetch: () => void;
}

export function useAdminStats(): UseAdminStatsReturn {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bạn cần đăng nhập để xem thống kê');
        return;
      }

      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi khi tải thống kê');
      }

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError('Lỗi khi tải thống kê');
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err instanceof Error ? err.message : 'Lỗi khi tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}