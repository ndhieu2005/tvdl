'use client';

import React, { useEffect, useState } from 'react';
import { extractTikTokVideoId, extractTikTokUsername } from '@/lib/tiktok';

interface TikTokDebugProps {
  videoUrl: string;
}

const TikTokDebug: React.FC<TikTokDebugProps> = ({ videoUrl }) => {
  const [scriptStatus, setScriptStatus] = useState('Not loaded');
  const [windowTikTok, setWindowTikTok] = useState<any>(null);

  useEffect(() => {
    const checkScript = () => {
      const script = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
      if (script) {
        setScriptStatus('Script element found');
      }
      
      if (window.tiktokEmbed) {
        setScriptStatus('TikTok embed object available');
        setWindowTikTok(window.tiktokEmbed);
      }
    };

    checkScript();
    
    const interval = setInterval(checkScript, 1000);
    return () => clearInterval(interval);
  }, []);

  const videoId = extractTikTokVideoId(videoUrl);
  const username = extractTikTokUsername(videoUrl);

  return (
    <div className="bg-gray-100 p-4 rounded-lg text-sm">
      <h3 className="font-semibold mb-2">TikTok Debug Info</h3>
      <div className="space-y-1">
        <p><strong>URL:</strong> {videoUrl}</p>
        <p><strong>Video ID:</strong> {videoId || 'Not found'}</p>
        <p><strong>Username:</strong> {username || 'Not found'}</p>
        <p><strong>Script Status:</strong> {scriptStatus}</p>
        <p><strong>Window TikTok:</strong> {windowTikTok ? 'Available' : 'Not available'}</p>
        <p><strong>TikTok Embed Methods:</strong> {windowTikTok?.lib ? Object.keys(windowTikTok.lib).join(', ') : 'None'}</p>
      </div>
    </div>
  );
};

export default TikTokDebug;