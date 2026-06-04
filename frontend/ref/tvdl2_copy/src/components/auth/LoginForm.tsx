'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { RecaptchaV3, useRecaptchaV3 } from '@/components/RecaptchaV3';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onClose?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onClose }) => {
  const { login, loading, error, clearError } = useAuth();
  const { executeRecaptcha } = useRecaptchaV3();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Execute reCAPTCHA v3
      const recaptchaToken = await executeRecaptcha('login');
      
      if (!recaptchaToken) {
        console.warn('⚠️ reCAPTCHA token not available, proceeding without it');
      }

      const result = await login(formData.email, formData.password, recaptchaToken);
      // Chỉ đóng modal khi login thành công
      if (result.success && onClose) {
        onClose();
      }
      // Nếu login thất bại, modal sẽ không đóng để user có thể nhập lại
    } catch (error) {
      // Error is handled by AuthContext
      // Modal sẽ không đóng để user có thể nhập lại
      console.log('Login failed, keeping modal open for retry');
    }
  };

  return (
    <>
      {/* reCAPTCHA v3 - Invisible */}
      <RecaptchaV3 
        onToken={() => setRecaptchaLoaded(true)}
        onError={() => setRecaptchaLoaded(false)}
        action="login"
      />
      
      <Card className="w-full max-w-md mx-auto border-0 shadow-none">
        <CardHeader className="px-0 pt-0 pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Đăng nhập vào tài khoản ViralPeek của bạn
          </CardDescription>
        </CardHeader>
      <CardContent className="px-0">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="h-10 sm:h-11 text-base"
            />
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="h-10 sm:h-11 text-base pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full h-10 sm:h-11 text-base font-medium mt-6"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
        
        <div className="mt-4 sm:mt-6 text-center text-sm">
          <span className="text-gray-600">Chưa có tài khoản? </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:underline font-medium"
          >
            Đăng ký ngay
          </button>
        </div>
      </CardContent>
    </Card>
    </>
  );
};