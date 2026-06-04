'use client';

import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface DevRecaptchaStatusProps {
  className?: string;
}

export default function DevRecaptchaStatus({ className = '' }: DevRecaptchaStatusProps) {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">
            Chế độ phát triển
          </p>
          <p className="text-xs text-yellow-700">
            reCAPTCHA đã được bỏ qua tự động
          </p>
        </div>
        <CheckCircle className="h-4 w-4 text-green-600" />
      </div>
    </div>
  );
}