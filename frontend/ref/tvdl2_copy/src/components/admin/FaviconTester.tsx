'use client';

import React, { useState } from 'react';
import { Play, RefreshCw, Eye, AlertTriangle, CheckCircle, Copy } from 'lucide-react';

interface FaviconTesterProps {
  faviconUrl: string;
}

export const FaviconTester: React.FC<FaviconTesterProps> = ({ faviconUrl }) => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testFaviconLoad = async () => {
    setIsLoading(true);
    addTestResult('🔍 Testing favicon load...');
    
    try {
      const img = new Image();
      
      img.onload = () => {
        addTestResult('✅ Favicon loaded successfully');
        addTestResult(`📏 Size: ${img.width}x${img.height}`);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        addTestResult('❌ Failed to load favicon');
        setIsLoading(false);
      };
      
      img.src = faviconUrl;
    } catch (error) {
      addTestResult(`❌ Error: ${error}`);
      setIsLoading(false);
    }
  };

  const testCacheBust = () => {
    addTestResult('🔄 Testing cache bust...');
    const cacheBustUrl = `${faviconUrl}?v=${Date.now()}`;
    addTestResult(`🔗 Cache bust URL: ${cacheBustUrl}`);
    
    // Create a test image to verify cache busting
    const img = new Image();
    img.onload = () => {
      addTestResult('✅ Cache bust successful');
    };
    img.onerror = () => {
      addTestResult('❌ Cache bust failed');
    };
    img.src = cacheBustUrl;
  };

  const testBrowserSupport = () => {
    addTestResult('🌐 Testing browser support...');
    
    // Test different favicon formats
    const formats = [
      { ext: '.ico', type: 'image/x-icon', description: 'ICO format' },
      { ext: '.png', type: 'image/png', description: 'PNG format' },
      { ext: '.svg', type: 'image/svg+xml', description: 'SVG format' },
    ];
    
    formats.forEach(format => {
      if (faviconUrl.includes(format.ext)) {
        addTestResult(`✅ Format: ${format.description} (${format.type})`);
      } else {
        addTestResult(`ℹ️ Format: ${format.description} not detected`);
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addTestResult('📋 Copied to clipboard');
  };

  const runAllTests = async () => {
    clearResults();
    addTestResult('🚀 Starting favicon tests...');
    
    await testFaviconLoad();
    testCacheBust();
    testBrowserSupport();
    
    addTestResult('✨ All tests completed');
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">🧪 Favicon Tester</h3>
        <div className="flex space-x-2">
          <button
            onClick={runAllTests}
            disabled={isLoading}
            className="flex items-center space-x-1 text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            <Play className={`h-3 w-3 ${isLoading ? 'animate-pulse' : ''}`} />
            <span>Run Tests</span>
          </button>
          <button
            onClick={clearResults}
            className="flex items-center space-x-1 text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Test URL */}
      <div className="text-xs">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Test URL:</span>
          <button
            onClick={() => copyToClipboard(faviconUrl)}
            className="text-purple-600 hover:text-purple-800"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
        <div className="text-gray-600 break-all bg-gray-50 p-2 rounded mt-1">
          {faviconUrl || 'No favicon URL set'}
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="text-xs">
          <span className="font-medium text-gray-700">Test Results:</span>
          <div className="mt-1 bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-gray-600 font-mono text-xs py-1">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button
          onClick={testFaviconLoad}
          disabled={isLoading}
          className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          <Eye className="h-3 w-3" />
          <span>Test Load</span>
        </button>
        <button
          onClick={testCacheBust}
          className="flex items-center space-x-1 text-xs text-green-600 hover:text-green-800"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Test Cache</span>
        </button>
      </div>
    </div>
  );
};