'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Eye, AlertTriangle, CheckCircle, RotateCcw, Bug } from 'lucide-react';

interface LogoDebuggerProps {
  logoUrl: string;
}

export const LogoDebugger: React.FC<LogoDebuggerProps> = ({ logoUrl }) => {
  const [logoExists, setLogoExists] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any[]>([]);

  useEffect(() => {
    updateDebugInfo();
  }, [logoUrl]);

  const updateDebugInfo = async () => {
    if (logoUrl) {
      checkLogoExists(logoUrl).then(exists => {
        setLogoExists(exists);
      });
    }
    
    // Check API response
    try {
      const response = await fetch('/api/public/general-settings');
      if (response.ok) {
        const data = await response.json();
        setDebugInfo([
          {
            source: 'Props',
            value: logoUrl || 'Not set',
            status: logoExists
          },
          {
            source: 'API Response',
            value: data.logo || 'undefined',
            status: data.logo ? await checkLogoExists(data.logo) : false
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch API settings:', error);
    }
  };

  const checkLogoExists = (logoUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = logoUrl;
    });
  };

  const handleForceRefresh = async () => {
    setIsChecking(true);
    try {
      // Force refresh by adding timestamp
      const refreshedUrl = logoUrl + (logoUrl.includes('?') ? '&' : '?') + `v=${Date.now()}`;
      setTimeout(() => {
        updateDebugInfo();
        setIsChecking(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing logo:', error);
      setIsChecking(false);
    }
  };

  const handleDebugLog = () => {
    console.log('🔍 Logo Debug State:');
    console.log('📋 Props logoUrl:', logoUrl);
    console.log('📋 Logo exists:', logoExists);
    console.log('📋 Debug info:', debugInfo);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">🖼️ Logo Debug</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleForceRefresh}
            disabled={isChecking}
            className="flex items-center space-x-1 text-xs text-purple-600 hover:text-purple-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleDebugLog}
            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <Bug className="h-3 w-3" />
            <span>Debug</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Current Status */}
        <div className="flex items-center space-x-2">
          {logoExists === true ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : logoExists === false ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-xs text-gray-600">
            Status: {logoExists === true ? 'Exists' : logoExists === false ? 'Not Found' : 'Checking...'}
          </span>
        </div>

        {/* Logo URL */}
        <div className="text-xs">
          <span className="font-medium text-gray-700">Current Logo:</span>
          <div className="text-gray-600 truncate">{logoUrl || 'Not set'}</div>
        </div>

        {/* Logo Preview */}
        {logoUrl && logoExists && (
          <div className="text-xs">
            <span className="font-medium text-gray-700">Preview:</span>
            <div className="mt-1 p-2 bg-white rounded border">
              <img 
                src={logoUrl} 
                alt="Logo preview" 
                className="h-8 max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Debug Info */}
        {debugInfo.length > 0 && (
          <div className="text-xs">
            <span className="font-medium text-gray-700">Debug Info:</span>
            <div className="mt-1 space-y-1">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-gray-600 bg-white p-2 rounded border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div><strong>Source:</strong> {info.source}</div>
                      <div><strong>Value:</strong> <span className="truncate">{info.value}</span></div>
                    </div>
                    <div>
                      {info.status === true ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : info.status === false ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};