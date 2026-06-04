'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { Lock, AlertCircle } from 'lucide-react';

function ResetPasswordContent() {
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      setShowForm(true);
    }
  }, [searchParams]);

  const handleSuccess = () => {
    router.push('/admin/login?message=password-reset-success');
  };

  const handleCancel = () => {
    router.push('/admin/login');
  };

  if (!showForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Lỗi</h2>
            <p className="text-sm text-gray-600 mt-2">
              Không tìm thấy thông tin để đổi mật khẩu
            </p>
            <button
              onClick={() => router.push('/admin/login')}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Đổi mật khẩu lần đầu</h2>
          <p className="text-sm text-gray-600 mt-2">
            Tài khoản của bạn cần đặt mật khẩu mới để tiếp tục sử dụng
          </p>
        </div>

        <ResetPasswordForm
          email={email}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
    </div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}