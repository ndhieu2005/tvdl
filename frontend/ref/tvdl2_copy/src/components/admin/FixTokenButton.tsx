'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FixTokenButton() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const info = {
        length: token.length,
        isApiKey: token.startsWith('vpk_'),
        isJWT: token.includes('.'),
        preview: token.substring(0, 30) + '...'
      };
      setTokenInfo(info);
      setHasApiKey(info.isApiKey);
    }
  }, []);

  const handleFix = () => {
    if (confirm('🔧 Xóa token hiện tại và đăng nhập lại?')) {
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Only show in development environment
  if (process.env.NODE_ENV === 'production') return null;
  if (!tokenInfo) return null;
  // Only show when there's a token error (API key detected)
  if (!hasApiKey) return null;

  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {hasApiKey ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full"></div>
              </div>
            )}
            <span className="font-medium">
              {hasApiKey ? 'Token Error' : 'Token OK'}
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            Type: {tokenInfo.isApiKey ? 'API Key' : tokenInfo.isJWT ? 'JWT' : 'Unknown'} | 
            Length: {tokenInfo.length} | 
            Preview: {tokenInfo.preview}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          
          {hasApiKey && (
            <button
              onClick={handleFix}
              className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Fix Token</span>
            </button>
          )}
        </div>
      </div>
      
      {hasApiKey && (
        <div className="mt-2 text-sm text-red-600">
          🚨 API key detected in localStorage. This should be a JWT token for admin access.
        </div>
      )}
    </div>
  );
}