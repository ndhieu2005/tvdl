'use client';

import React, { useState } from 'react';
import { RefreshCw, Trash2, CheckCircle } from 'lucide-react';

export const CacheCleaner: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [lastCleared, setLastCleared] = useState<Date | null>(null);

  const clearAllCaches = async () => {
    setIsClearing(true);
    
    try {
      // 1. Clear localStorage
      localStorage.clear();
      console.log('✅ Cleared localStorage');
      
      // 2. Clear sessionStorage
      sessionStorage.clear();
      console.log('✅ Cleared sessionStorage');
      
      // 3. Clear browser cache (if supported)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('✅ Cleared browser caches');
      }
      
      // 4. Force reload favicon
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        const newFavicon = favicon.cloneNode(true) as HTMLLinkElement;
        newFavicon.href = favicon.href + '?t=' + Date.now();
        favicon.parentNode?.replaceChild(newFavicon, favicon);
        console.log('✅ Refreshed favicon');
      }
      
      // 5. Clear image cache by forcing reload
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        const src = img.src;
        img.src = '';
        img.src = src + (src.includes('?') ? '&' : '?') + 't=' + Date.now();
      });
      console.log('✅ Refreshed images');
      
      setLastCleared(new Date());
      
      // Show success message
      alert('Cache cleared successfully! The page will reload in 2 seconds.');
      
      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      alert('Error clearing cache. Please try manual refresh (Ctrl+F5).');
    } finally {
      setIsClearing(false);
    }
  };

  const forceHardRefresh = () => {
    // Force hard refresh
    window.location.reload();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <Trash2 className="h-5 w-5 text-red-500" />
        <h3 className="text-sm font-medium text-gray-900">Cache Management</h3>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-gray-600">
          If you're seeing old logo/favicon, clear cache to fix display issues.
        </p>

        <div className="flex space-x-2">
          <button
            onClick={clearAllCaches}
            disabled={isClearing}
            className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className={`h-3 w-3 ${isClearing ? 'animate-spin' : ''}`} />
            <span>{isClearing ? 'Clearing...' : 'Clear All Cache'}</span>
          </button>

          <button
            onClick={forceHardRefresh}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Hard Refresh</span>
          </button>
        </div>

        {lastCleared && (
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span>Cache cleared at {lastCleared.toLocaleTimeString()}</span>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <div><strong>Manual options:</strong></div>
          <div>• Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)</div>
          <div>• Open DevTools → Network → Disable cache</div>
          <div>• Use incognito/private browsing mode</div>
        </div>
      </div>
    </div>
  );
};