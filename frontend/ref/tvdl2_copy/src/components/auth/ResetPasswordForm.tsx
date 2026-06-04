'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ResetPasswordFormProps {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ResetPasswordForm({ email, onSuccess, onCancel }: ResetPasswordFormProps) {
  const [formData, setFormData] = useState({
    email: email,
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    // Validate password length
    if (formData.newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }
      
      setSuccess('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 8) return { strength: 'weak', text: 'Yếu', color: 'text-red-500' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 'strong', text: 'Mạnh', color: 'text-green-500' };
    }
    return { strength: 'medium', text: 'Trung bình', color: 'text-yellow-500' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Đổi mật khẩu lần đầu</h2>
        <p className="text-sm text-gray-600 mt-2">
          Tài khoản của bạn cần đặt mật khẩu mới để tiếp tục sử dụng
        </p>
      </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (disabled) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Password Strength */}
            {formData.newPassword && (
              <div className="mt-2 text-sm">
                <span className="text-gray-600">Độ mạnh: </span>
                <span className={passwordStrength.color}>
                  {passwordStrength.text}
                </span>
              </div>
            )}
            
            <div className="mt-1 text-xs text-gray-500">
              Mật khẩu phải có ít nhất 8 ký tự
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nhập lại mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="mt-2 text-sm">
                {formData.newPassword === formData.confirmPassword ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>Mật khẩu khớp</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>Mật khẩu không khớp</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-green-600">{success}</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.newPassword || !formData.confirmPassword}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </div>
      </form>
    </div>
  );
}