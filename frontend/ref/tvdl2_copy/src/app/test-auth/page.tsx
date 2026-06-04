'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const { user, logout, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const openLoginModal = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalTab('register');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Authentication</CardTitle>
            <CardDescription>
              Test trang đăng nhập và đăng ký
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-gray-600">Đang tải...</p>
              </div>
            ) : user ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800">Đăng nhập thành công!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Tên:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Vai trò:</strong> {user.role}</p>
                    <p><strong>Trạng thái:</strong> {user.status}</p>
                    <p><strong>Ngày tham gia:</strong> {user.joinDate ? new Date(user.joinDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  </div>
                </div>
                
                <Button 
                  onClick={logout}
                  variant="outline"
                  className="w-full"
                >
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800">Chưa đăng nhập</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Hãy đăng nhập hoặc đăng ký để tiếp tục
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={openLoginModal}
                    className="flex-1"
                  >
                    Đăng nhập
                  </Button>
                  <Button 
                    onClick={openRegisterModal}
                    variant="outline"
                    className="flex-1"
                  >
                    Đăng ký
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </div>
  );
}