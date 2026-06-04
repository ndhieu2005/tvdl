'use client';

import React, { useState } from 'react';
import TikTokEmbedSimple from './TikTokEmbedSimple';
import TikTokEmbedIframe from './TikTokEmbedIframe';
import TikTokEmbedAdvanced from './TikTokEmbedAdvanced';
import TikTokDebug from './TikTokDebug';
import { isTikTokUrl, extractTikTokVideoId, extractTikTokUsername } from '@/lib/tiktok';

const TikTokTestPage = () => {
  const [testUrl, setTestUrl] = useState('');
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedType, setEmbedType] = useState('iframe');

  const handleTest = () => {
    if (testUrl.trim()) {
      setShowEmbed(true);
    }
  };

  const sampleUrls = [
    'https://www.tiktok.com/@billieeilish/video/7301774170374958363',
    'https://www.tiktok.com/@gordonramsayofficial/video/7301445493633060118',
    'https://vm.tiktok.com/ZM8KQvQQQ/',
    'https://vt.tiktok.com/ZS8KQvQQQ/'
  ];

  const videoId = extractTikTokVideoId(testUrl);
  const username = extractTikTokUsername(testUrl);
  const isValid = isTikTokUrl(testUrl);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">TikTok Embed Test</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test TikTok URL</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            TikTok URL:
          </label>
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Paste TikTok URL here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Sample URLs:</h3>
          <div className="space-y-2">
            {sampleUrls.map((url, index) => (
              <button
                key={index}
                onClick={() => setTestUrl(url)}
                className="block w-full text-left px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                {url}
              </button>
            ))}
          </div>
        </div>

        {testUrl && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium mb-2">URL Analysis:</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Is TikTok URL:</strong> {isValid ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Video ID:</strong> {videoId || 'Not found'}</p>
              <p><strong>Username:</strong> {username || 'Not found'}</p>
            </div>
          </div>
        )}

        {testUrl && (
          <div className="mb-4">
            <TikTokDebug videoUrl={testUrl} />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Embed Type:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="iframe"
                checked={embedType === 'iframe'}
                onChange={(e) => setEmbedType(e.target.value)}
                className="mr-2"
              />
              Iframe (Recommended)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="simple"
                checked={embedType === 'simple'}
                onChange={(e) => setEmbedType(e.target.value)}
                className="mr-2"
              />
              Simple Embed
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="advanced"
                checked={embedType === 'advanced'}
                onChange={(e) => setEmbedType(e.target.value)}
                className="mr-2"
              />
              Advanced
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleTest}
            disabled={!testUrl.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Test Embed
          </button>
          <button
            onClick={() => {
              setTestUrl('');
              setShowEmbed(false);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
      </div>

      {showEmbed && testUrl && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Embed Result ({embedType})</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Normal Size</h3>
              {embedType === 'iframe' && (
                <TikTokEmbedIframe
                  videoUrl={testUrl}
                  compact={false}
                  className="border rounded-lg p-4"
                  showStats={true}
                  metadata={{
                    views: 1500000,
                    likes: 125000,
                    comments: 8500,
                    shares: 45000,
                    author: 'test_user'
                  }}
                />
              )}
              {embedType === 'simple' && (
                <TikTokEmbedSimple
                  videoUrl={testUrl}
                  compact={false}
                  className="border rounded-lg p-4"
                  showStats={true}
                  metadata={{
                    views: 1500000,
                    likes: 125000,
                    comments: 8500,
                    shares: 45000,
                    author: 'test_user'
                  }}
                />
              )}
              {embedType === 'advanced' && (
                <TikTokEmbedAdvanced
                  videoUrl={testUrl}
                  compact={false}
                  className="border rounded-lg p-4"
                  showStats={true}
                  metadata={{
                    views: 1500000,
                    likes: 125000,
                    comments: 8500,
                    shares: 45000,
                    author: 'test_user'
                  }}
                />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Compact Size</h3>
              {embedType === 'iframe' && (
                <TikTokEmbedIframe
                  videoUrl={testUrl}
                  compact={true}
                  className="border rounded-lg p-4"
                />
              )}
              {embedType === 'simple' && (
                <TikTokEmbedSimple
                  videoUrl={testUrl}
                  compact={true}
                  className="border rounded-lg p-4"
                />
              )}
              {embedType === 'advanced' && (
                <TikTokEmbedAdvanced
                  videoUrl={testUrl}
                  compact={true}
                  className="border rounded-lg p-4"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TikTokTestPage;