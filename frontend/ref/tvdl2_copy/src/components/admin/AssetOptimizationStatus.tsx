'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Zap, Download, RefreshCw } from 'lucide-react';
import { isPublicAsset } from '@/lib/public-assets';

interface AssetOptimizationStatusProps {
  logoUrl?: string;
  faviconUrl?: string;
}

export function AssetOptimizationStatus({ logoUrl, faviconUrl }: AssetOptimizationStatusProps) {
  const [assetStatus, setAssetStatus] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkOptimization = async () => {
      try {
        const response = await fetch('/api/admin/asset-status', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          setAssetStatus(result.data);
        } else {
          // Fallback to client-side check
          setAssetStatus({
            favicon: { optimized: faviconUrl ? isPublicAsset(faviconUrl) : false },
            logo: { optimized: logoUrl ? isPublicAsset(logoUrl) : false },
            overall: { optimized: false }
          });
        }
      } catch (error) {
        console.error('Failed to check asset status:', error);
        // Fallback to client-side check
        setAssetStatus({
          favicon: { optimized: faviconUrl ? isPublicAsset(faviconUrl) : false },
          logo: { optimized: logoUrl ? isPublicAsset(logoUrl) : false },
          overall: { optimized: false }
        });
      } finally {
        setChecking(false);
      }
    };

    checkOptimization();
  }, [logoUrl, faviconUrl]);

  const runMigration = async () => {
    setChecking(true);
    try {
      // This would trigger the migration script
      const response = await fetch('/api/admin/migrate-assets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        // Refresh the page to see changes
        window.location.reload();
      }
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm">Đang kiểm tra tối ưu hóa...</span>
      </div>
    );
  }

  const allOptimized = assetStatus?.overall?.optimized || false;
  const logoOptimized = assetStatus?.logo?.optimized || false;
  const faviconOptimized = assetStatus?.favicon?.optimized || false;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Zap className="h-5 w-5 text-yellow-500" />
        <h4 className="font-medium text-gray-900">Tối ưu hóa tải trang</h4>
      </div>

      <div className="space-y-2">
        {/* Logo Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {logoOptimized ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Logo</p>
              <p className="text-xs text-gray-500">
                {logoOptimized 
                  ? 'Đã tối ưu - tải trực tiếp từ public' 
                  : 'Chưa tối ưu - tải qua API'
                }
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {assetStatus?.logo?.recommendedUrl || logoUrl || 'Chưa có logo'}
            {assetStatus?.logo?.availableFormats?.length > 0 && (
              <div className="text-green-600">
                Có sẵn: {assetStatus.logo.availableFormats.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Favicon Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {faviconOptimized ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Favicon</p>
              <p className="text-xs text-gray-500">
                {faviconOptimized 
                  ? 'Đã tối ưu - tải trực tiếp từ public' 
                  : 'Chưa tối ưu - tải qua API'
                }
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {assetStatus?.favicon?.recommendedUrl || faviconUrl || 'Chưa có favicon'}
            {assetStatus?.favicon?.availableFormats?.length > 0 && (
              <div className="text-green-600">
                Có sẵn: {assetStatus.favicon.availableFormats.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-4 rounded-lg border ${
        allOptimized 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-start space-x-3">
          {allOptimized ? (
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
          )}
          <div className="flex-1">
            <h5 className={`font-medium ${
              allOptimized ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {allOptimized ? 'Tối ưu hóa hoàn tất' : 'Cần tối ưu hóa'}
            </h5>
            <p className={`text-sm mt-1 ${
              allOptimized ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {allOptimized 
                ? 'Logo và favicon đã được tối ưu để tải nhanh nhất. Trang web sẽ hiển thị icon ngay lập tức.'
                : 'Upload logo và favicon mới để tối ưu hóa tốc độ tải trang. File sẽ được lưu trực tiếp vào thư mục public.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="text-xs text-gray-500 space-y-1">
        <p className="font-medium">Lợi ích khi tối ưu hóa:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Favicon hiển thị ngay lập tức khi mở trang</li>
          <li>Logo tải nhanh hơn, không cần chờ API</li>
          <li>Giảm tải cho server và database</li>
          <li>Cải thiện trải nghiệm người dùng</li>
        </ul>
      </div>
    </div>
  );
}