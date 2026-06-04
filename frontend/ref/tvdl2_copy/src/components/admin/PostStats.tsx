// Tạo file mới: /home/ubuntu/Documents/Project/tvdl2.0/src/components/admin/PostStats.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

interface PostStatsProps {
  className?: string;
}

interface PostsResponse {
  success: boolean;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function PostStats({ className }: PostStatsProps) {
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Bạn cần đăng nhập để xem thống kê bài viết');
          return;
        }

        // Chỉ cần lấy 1 bài viết để có thông tin pagination
        const response = await fetch('/api/posts?limit=1', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Không thể tải thống kê bài viết');
        }

        const data: PostsResponse = await response.json();
        
        if (data.success) {
          setTotalPosts(data.pagination.total);
        } else {
          setError('Không thể tải thống kê bài viết');
        }
      } catch (err) {
        console.error('Error fetching post stats:', err);
        setError('Đã xảy ra lỗi khi tải thống kê bài viết');
      } finally {
        setLoading(false);
      }
    };

    fetchPostStats();
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <FileText className="h-8 w-8 text-blue-500" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Tổng bài viết</p>
          {loading ? (
            <p className="text-2xl font-semibold text-gray-400">Đang tải...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <p className="text-2xl font-semibold text-gray-900">{totalPosts}</p>
          )}
        </div>
      </div>
    </div>
  );
}
