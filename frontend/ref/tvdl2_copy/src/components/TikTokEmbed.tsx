'use client';

import React, { useEffect, useRef } from 'react';

interface TikTokEmbedProps {
  videoUrl: string;
  className?: string;
  compact?: boolean;
}

const TikTokEmbed: React.FC<TikTokEmbedProps> = ({ 
  videoUrl, 
  className = '', 
  compact = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract video ID from TikTok URL
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /\/video\/(\d+)/,
      /\/v\/(\d+)/,
      /tiktok\.com\/.*\/video\/(\d+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Extract username from TikTok URL
  const extractUsername = (url: string): string | null => {
    const patterns = [
      /@([^/]+)/,
      /tiktok\.com\/([^/]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] !== 'www' && match[1] !== 'v') {
        return match[1];
      }
    }
    return null;
  };

  const videoId = extractVideoId(videoUrl);
  const username = extractUsername(videoUrl);

  useEffect(() => {
    // Load TikTok embed script
    const loadTikTokScript = () => {
      const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
      
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://www.tiktok.com/embed.js';
        script.async = true;
        script.onload = () => {
          // Render TikTok embeds after script loads
          if (window.tiktokEmbed) {
            window.tiktokEmbed.lib.render();
          }
        };
        document.head.appendChild(script);
      } else {
        // Script already exists, just render
        if (window.tiktokEmbed) {
          window.tiktokEmbed.lib.render();
        }
      }
    };

    loadTikTokScript();

    // Re-render when component updates
    const timer = setTimeout(() => {
      if (window.tiktokEmbed) {
        window.tiktokEmbed.lib.render();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [videoUrl]);

  if (!videoId || !username) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
        <p className="text-gray-500 text-sm">URL TikTok không hợp lệ</p>
        <p className="text-gray-400 text-xs mt-1">URL: {videoUrl}</p>
      </div>
    );
  }

  const embedHtml = `
    <blockquote 
      class="tiktok-embed" 
      cite="${videoUrl}" 
      data-video-id="${videoId}" 
      style="max-width: ${compact ? '325px' : '605px'}; min-width: 325px; margin: 0 auto;"
    >
      <section>
        <a 
          target="_blank" 
          title="@${username}" 
          href="https://www.tiktok.com/@${username}?refer=embed"
        >
          @${username}
        </a>
        <p></p>
        <a 
          target="_blank" 
          title="♬ original sound" 
          href="${videoUrl}?refer=embed"
        >
          ♬ original sound
        </a>
      </section>
    </blockquote>
  `;

  return (
    <div 
      ref={containerRef}
      className={`tiktok-embed-container ${className}`}
      dangerouslySetInnerHTML={{ __html: embedHtml }}
    />
  );
};

// Extend window interface for TikTok embed
declare global {
  interface Window {
    tiktokEmbed?: any;
  }
}

export default TikTokEmbed;