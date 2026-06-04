'use client';

import { useEffect, useState } from 'react';

interface SwaggerWrapperProps {
  spec: any;
}

export default function SwaggerWrapperDirect({ spec }: SwaggerWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!spec) {
      setError('No API specification provided');
      return;
    }

    // Tạo một unique ID cho container
    const containerId = `swagger-container-${Date.now()}`;
    
    const loadSwagger = () => {
      try {
        // Inject CSS nếu chưa có
        if (!document.querySelector('link[href*="swagger-ui.css"]')) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css';
          document.head.appendChild(cssLink);
        }

        // Load script và render
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js';
        script.onload = () => {
          setTimeout(() => {
            const container = document.getElementById(containerId);
            if (container && window.SwaggerUIBundle) {
              window.SwaggerUIBundle({
                spec: spec,
                domNode: container,
                deepLinking: true,
                presets: [
                  window.SwaggerUIBundle.presets.apis,
                  window.SwaggerUIBundle.presets.standalone
                ],
                plugins: [
                  window.SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: 'StandaloneLayout',
                tryItOutEnabled: true,
                displayOperationId: false,
                displayRequestDuration: true,
                filter: true,
                docExpansion: 'list',
                defaultModelsExpandDepth: 2,
                defaultModelExpandDepth: 2,
                onComplete: () => {
                  setIsLoaded(true);
                  // Ẩn topbar
                  const topbar = document.querySelector('.swagger-ui .topbar') as HTMLElement;
                  if (topbar) {
                    topbar.style.display = 'none';
                  }
                }
              });
            } else {
              setError('Failed to initialize SwaggerUI');
            }
          }, 500);
        };
        script.onerror = () => {
          setError('Failed to load SwaggerUI from CDN');
        };
        
        // Chỉ append script nếu chưa có
        if (!document.querySelector('script[src*="swagger-ui-bundle.js"]')) {
          document.head.appendChild(script);
        } else {
          // Nếu script đã có, render trực tiếp
          setTimeout(() => {
            const container = document.getElementById(containerId);
            if (container && window.SwaggerUIBundle) {
              window.SwaggerUIBundle({
                spec: spec,
                domNode: container,
                deepLinking: true,
                presets: [
                  window.SwaggerUIBundle.presets.apis,
                  window.SwaggerUIBundle.presets.standalone
                ],
                plugins: [
                  window.SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: 'StandaloneLayout',
                tryItOutEnabled: true,
                displayOperationId: false,
                displayRequestDuration: true,
                filter: true,
                docExpansion: 'list',
                defaultModelsExpandDepth: 2,
                defaultModelExpandDepth: 2,
                onComplete: () => {
                  setIsLoaded(true);
                  const topbar = document.querySelector('.swagger-ui .topbar') as HTMLElement;
                  if (topbar) {
                    topbar.style.display = 'none';
                  }
                }
              });
            }
          }, 100);
        }
      } catch (err) {
        setError('Error loading SwaggerUI: ' + err);
      }
    };

    loadSwagger();
  }, [spec]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <div className="text-red-600 font-semibold mb-2">Error Loading API Documentation</div>
          <div className="text-red-500 text-sm">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading API Documentation...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="swagger-wrapper">
      <div id={`swagger-container-${Date.now()}`} />
      <style jsx global>{`
        .swagger-wrapper .swagger-ui .topbar {
          display: none !important;
        }
        .swagger-wrapper .swagger-ui .info {
          margin: 20px 0;
        }
        .swagger-wrapper .swagger-ui .wrapper {
          padding: 0;
        }
      `}</style>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SwaggerUIBundle: any;
  }
}