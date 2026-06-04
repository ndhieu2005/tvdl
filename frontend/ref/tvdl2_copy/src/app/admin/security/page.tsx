'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SecurityDashboard from '@/components/admin/SecurityDashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

export default function AdminSecurityPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get token from localStorage
        const savedToken = localStorage.getItem('token');
        if (!savedToken) {
          router.push('/admin/login');
          return;
        }

        // Verify token
        const response = await fetch('/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });

        if (!response.ok) {
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
          return;
        }

        const data = await response.json();
        if (data.user.role !== 'ADMIN') {
          setError('Bạn không có quyền truy cập trang này');
          return;
        }

        setToken(savedToken);
      } catch (err) {
        setError('Lỗi xác thực. Vui lòng đăng nhập lại.');
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Vui lòng đăng nhập để truy cập trang quản trị.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản trị - Bảo mật
                </h1>
                <p className="text-sm text-gray-600">
                  Quản lý cài đặt bảo mật hệ thống
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Quay lại Dashboard
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  router.push('/admin/login');
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SecurityDashboard token={token} />
      </main>
    </div>
  );
}