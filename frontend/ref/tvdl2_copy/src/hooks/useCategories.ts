import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  postsCount: number;
  color: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  recentPosts?: any[];
  stats?: {
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
  };
}

interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  totalPosts: number;
}

interface UseCategoriesReturn {
  categories: Category[];
  stats: CategoryStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
        setStats(data.stats);
      } else {
        setError(data.error || 'Không thể tải danh sách categories');
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    stats,
    loading,
    error,
    refetch: fetchCategories
  };
}

// Hook for single category
export function useCategory(id: string) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/categories/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCategory(data.data);
      } else {
        setError(data.error || 'Không thể tải thông tin category');
      }
    } catch (err) {
      setError('Lỗi khi tải thông tin category');
      console.error('Error fetching category:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  return {
    category,
    loading,
    error,
    refetch: fetchCategory
  };
}

// Hook for category statistics
export function useCategoryStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/categories/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Không thể tải thống kê categories');
      }
    } catch (err) {
      setError('Lỗi khi tải thống kê categories');
      console.error('Error fetching category stats:', err);
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