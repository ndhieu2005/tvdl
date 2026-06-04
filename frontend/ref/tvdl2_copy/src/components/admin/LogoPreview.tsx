'use client';

import React from 'react';
import { Image, AlertCircle } from 'lucide-react';

interface LogoPreviewProps {
  logoUrl: string;
  faviconUrl: string;
  siteName: string;
  className?: string;
}

export function LogoPreview({ logoUrl, faviconUrl, siteName, className = '' }: LogoPreviewProps) {
  const [logoError, setLogoError] = React.useState(false);
  const [faviconError, setFaviconError] = React.useState(false);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 mb-4">Preview</h3>
      
      <div className="space-y-4">
        {/* Logo Preview */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Logo hiện tại
          </label>
          <div className="p-3 bg-gray-50 rounded-lg">
            {logoUrl ? (
              <div className="flex items-center space-x-3">
                {logoError ? (
                  <div className="flex items-center space-x-2 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Không thể tải logo</span>
                  </div>
                ) : (
                  <>
                    {logoUrl.endsWith('.svg') ? (
                      <div className="flex items-center space-x-2">
                        <Image className="h-6 w-6 text-gray-400" />
                        <span className="text-sm text-gray-600">SVG Logo</span>
                      </div>
                    ) : (
                      <img 
                        src={logoUrl} 
                        alt="Logo preview" 
                        className="h-8 w-auto max-w-32"
                        onError={() => setLogoError(true)}
                        onLoad={() => setLogoError(false)}
                      />
                    )}
                  </>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 truncate">
                    {logoUrl}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-500">
                <span className="text-2xl font-bold text-purple-600">
                  {siteName}
                </span>
                <span className="text-xs">(Text fallback)</span>
              </div>
            )}
          </div>
        </div>

        {/* Favicon Preview */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Favicon hiện tại
          </label>
          <div className="p-3 bg-gray-50 rounded-lg">
            {faviconUrl ? (
              <div className="flex items-center space-x-3">
                {faviconError ? (
                  <div className="flex items-center space-x-2 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Không thể tải favicon</span>
                  </div>
                ) : (
                  <>
                    <img 
                      src={faviconUrl} 
                      alt="Favicon preview" 
                      className="h-4 w-4"
                      onError={() => setFaviconError(true)}
                      onLoad={() => setFaviconError(false)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 truncate">
                        {faviconUrl}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="h-4 w-4 bg-purple-600 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {siteName.charAt(0)}
                  </span>
                </div>
                <span className="text-xs">(Default favicon)</span>
              </div>
            )}
          </div>
        </div>

        {/* Header Preview */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Header preview
          </label>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              {logoUrl && !logoError ? (
                logoUrl.endsWith('.svg') ? (
                  <Image className="h-6 w-6 text-purple-600" />
                ) : (
                  <img 
                    src={logoUrl} 
                    alt="Header logo" 
                    className="h-6 w-auto max-w-24"
                  />
                )
              ) : (
                <span className="text-lg font-bold text-purple-600">
                  {siteName}
                </span>
              )}
              <div className="flex-1 border-l border-gray-200 pl-3">
                <span className="text-xs text-gray-500">
                  Như sẽ xuất hiện trong header
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}