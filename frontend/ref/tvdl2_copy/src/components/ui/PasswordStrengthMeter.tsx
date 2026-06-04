'use client';

import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { usePasswordValidation } from '@/hooks/useSecuritySettings';
import { Check, X, AlertCircle } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  showSuggestions?: boolean;
  className?: string;
}

export default function PasswordStrengthMeter({ 
  password, 
  showSuggestions = true,
  className = "" 
}: PasswordStrengthMeterProps) {
  const { validationResult, validating, validatePassword } = usePasswordValidation();
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (password.length > 0) {
      const timer = setTimeout(() => {
        validatePassword(password);
      }, 300);
      setDebounceTimer(timer);
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [password]);

  if (!password || password.length === 0) {
    return null;
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'strong':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStrengthValue = (strength: string) => {
    switch (strength) {
      case 'weak':
        return 33;
      case 'medium':
        return 66;
      case 'strong':
        return 100;
      default:
        return 0;
    }
  };

  const getStrengthLabel = (strength: string) => {
    switch (strength) {
      case 'weak':
        return 'Yếu';
      case 'medium':
        return 'Trung bình';
      case 'strong':
        return 'Mạnh';
      default:
        return 'Không xác định';
    }
  };

  const getStrengthBadgeVariant = (strength: string) => {
    switch (strength) {
      case 'weak':
        return 'destructive';
      case 'medium':
        return 'outline';
      case 'strong':
        return 'default';
      default:
        return 'outline';
    }
  };

  if (validating) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <span className="text-sm text-gray-600">Đang kiểm tra mật khẩu...</span>
        </div>
      </div>
    );
  }

  if (!validationResult) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Độ mạnh mật khẩu:</span>
          <Badge 
            variant={getStrengthBadgeVariant(validationResult.strength)}
            className={getStrengthColor(validationResult.strength)}
          >
            {getStrengthLabel(validationResult.strength)}
          </Badge>
        </div>
        <Progress 
          value={getStrengthValue(validationResult.strength)} 
          className="h-2"
        />
      </div>

      {/* Validation Status */}
      {validationResult.isValid ? (
        <div className="flex items-center gap-2 text-green-600">
          <Check className="h-4 w-4" />
          <span className="text-sm">Mật khẩu hợp lệ</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-red-600">
          <X className="h-4 w-4" />
          <span className="text-sm">Mật khẩu không hợp lệ</span>
        </div>
      )}

      {/* Errors */}
      {validationResult.errors && validationResult.errors.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Lỗi:</span>
          </div>
          <ul className="text-sm text-red-600 space-y-1 ml-6">
            {validationResult.errors.map((error: string, index: number) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && validationResult.suggestions && validationResult.suggestions.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Gợi ý:</span>
          </div>
          <ul className="text-sm text-blue-600 space-y-1 ml-6">
            {validationResult.suggestions.map((suggestion: string, index: number) => (
              <li key={index}>• {suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}