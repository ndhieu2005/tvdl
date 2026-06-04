'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Shield, X, AlertCircle } from 'lucide-react';

const AuthStatusBanner = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  if (!user || !isVisible) return null;

  const isAdmin = user.role === 'ADMIN';
  const isEditor = user.role === 'EDITOR';

  if (!isAdmin && !isEditor) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <h3 className="text-sm font-medium text-green-800">
              Xác thực thành công
            </h3>
            <p className="text-sm text-green-700">
              Bạn đã đăng nhập với quyền <strong>{user.role}</strong> - {user.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
              <Shield className="h-3 w-3" />
              <span>Admin</span>
            </div>
          )}
          {isEditor && !isAdmin && (
            <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              <AlertCircle className="h-3 w-3" />
              <span>Editor</span>
            </div>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="text-green-600 hover:text-green-800 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthStatusBanner;