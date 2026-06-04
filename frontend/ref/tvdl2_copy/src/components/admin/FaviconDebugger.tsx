'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Eye, AlertTriangle, CheckCircle, RotateCcw, Bug } from 'lucide-react';
import { forceFaviconRefresh, getCurrentFaviconUrl, checkFaviconExists, completeFaviconReset, debugFaviconState } from '@/lib/favicon-utils';

interface FaviconDebuggerProps {
  faviconUrl: string;
}

export const FaviconDebugger: React.FC<FaviconDebuggerProps> = ({ faviconUrl }) => {
  const [currentFavicon, setCurrentFavicon] = useState<string | null>(null);
  const [faviconExists, setFaviconExists] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any[]>([]);

  useEffect(() => {
    updateDebugInfo();
  }, [faviconUrl]);

  const updateDebugInfo = async () => {
    const current = getCurrentFaviconUrl();
    setCurrentFavicon(current);
    
    if (faviconUrl) {
      checkFaviconExists(faviconUrl).then(exists => {
        setFaviconExists(exists);
      });
    }
    
    // Get all favicon-related links
    const faviconLinks = document.querySelectorAll('link[rel*="icon"]');
    const info = Array.from(faviconLinks).map(link => ({
      rel: link.getAttribute('rel'),
      href: (link as HTMLLinkElement).href,
      type: link.getAttribute('type'),
      sizes: link.getAttribute('sizes')
    }));
    
    // Also check API response
    try {
      const response = await fetch('/api/public/general-settings');
      if (response.ok) {
        const data = await response.json();
        info.push({
          rel: 'API Response',
          href: data.favicon || 'undefined',
          type: 'API',
          sizes: null
        });
      }
    } catch (error) {
      console.error('Failed to fetch API settings:', error);
    }
    
    setDebugInfo(info);
  };

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      forceFaviconRefresh(faviconUrl);
      setTimeout(() => {
        updateDebugInfo();
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing favicon:', error);
      setIsRefreshing(false);
    }
  };

  const handleCompleteReset = async () => {
    setIsRefreshing(true);
    try {
      await completeFaviconReset();
      setTimeout(() => {
        updateDebugInfo();
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error resetting favicon:', error);
      setIsRefreshing(false);
    }
  };

  const handleDebugLog = () => {
    debugFaviconState();
    console.log('📋 Props faviconUrl:', faviconUrl);
    console.log('📋 Current favicon state:', currentFavicon);
    console.log('📋 Favicon exists:', faviconExists);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">🔍 Favicon Debug</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleForceRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1 text-xs text-purple-600 hover:text-purple-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleCompleteReset}
            disabled={isRefreshing}
            className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            <RotateCcw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Reset</span>
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
          {faviconExists === true ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : faviconExists === false ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-xs text-gray-600">
            Status: {faviconExists === true ? 'Exists' : faviconExists === false ? 'Not Found' : 'Checking...'}
          </span>
        </div>

        {/* Target URL */}
        <div className="text-xs">
          <span className="font-medium text-gray-700">Target:</span>
          <div className="text-gray-600 truncate">{faviconUrl || 'Not set'}</div>
        </div>

        {/* Current URL */}
        <div className="text-xs">
          <span className="font-medium text-gray-700">Current:</span>
          <div className="text-gray-600 truncate">{currentFavicon || 'Not set'}</div>
        </div>

        {/* Debug Info */}
        {debugInfo.length > 0 && (
          <div className="text-xs">
            <span className="font-medium text-gray-700">All favicon links:</span>
            <div className="mt-1 space-y-1">
              {debugInfo.map((link, index) => (
                <div key={index} className="text-gray-600 bg-white p-2 rounded border">
                  <div><strong>rel:</strong> {link.rel}</div>
                  <div><strong>href:</strong> <span className="truncate">{link.href}</span></div>
                  {link.type && <div><strong>type:</strong> {link.type}</div>}
                  {link.sizes && <div><strong>sizes:</strong> {link.sizes}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};