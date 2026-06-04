'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldX, Home, LogOut } from 'lucide-react';

const UnauthorizedPage = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Truy cập bị từ chối
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Bạn không có quyền truy cập vào trang quản trị
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Thông tin tài khoản
            </h3>
            {user ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Tên:</strong> {user.name}</p>
                <p><strong>Quyền:</strong> {user.role}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Không có thông tin tài khoản
              </p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              Lưu ý quan trọng
            </h3>
            <p className="text-sm text-yellow-700">
              Để truy cập vào khu vực quản trị, bạn cần có quyền <strong>ADMIN</strong> hoặc <strong>EDITOR</strong>. 
              Vui lòng liên hệ với quản trị viên để được cấp quyền.
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <Link
              href="/"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;