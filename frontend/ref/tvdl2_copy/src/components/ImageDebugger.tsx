'use client';

import React, { useState } from 'react';
import OptimizedImage from './OptimizedImage';

const ImageDebugger: React.FC = () => {
  const [testUrl, setTestUrl] = useState('https://picsum.photos/seed/test/400/300');
  const [isDebugMode, setIsDebugMode] = useState(false);

  const testImages = [
    'https://picsum.photos/seed/test1/400/300',
    'https://picsum.photos/seed/test2/400/300',
    'https://picsum.photos/400/300?random=1',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'https://invalid-url.com/image.jpg', // This should fallback
  ];

  if (!isDebugMode) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsDebugMode(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600"
        >
          Debug Images
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Image Debug Tool</h2>
          <button
            onClick={() => setIsDebugMode(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Enter image URL to test"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-semibold mb-2">Test Image:</h3>
            <div className="relative h-48 bg-gray-100 rounded">
              <OptimizedImage
                src={testUrl}
                alt="Test image"
                fill
                className="object-cover rounded"
                category="test"
              />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Environment Info:</h3>
            <div className="text-sm space-y-1">
              <div>NODE_ENV: {process.env.NODE_ENV}</div>
              <div>SITE_URL: {process.env.NEXT_PUBLIC_SITE_URL}</div>
              <div>Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Quick Test Images:</h3>
          <div className="grid grid-cols-3 gap-2">
            {testImages.map((url, index) => (
              <button
                key={index}
                onClick={() => setTestUrl(url)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded truncate"
                title={url}
              >
                Test {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDebugger;