'use client';

import { useEffect, useState } from 'react';

interface SwaggerWrapperProps {
  spec: any;
}

export default function SwaggerWrapperFixed({ spec }: SwaggerWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Component mounted
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!spec || !isMounted) {
      return;
    }

    const timeout = setTimeout(() => {
      loadSwaggerUI();
    }, 100);

    return () => clearTimeout(timeout);
  }, [spec, isMounted]);

  const loadSwaggerUI = async () => {
    try {
      const container = document.getElementById('swagger-ui-container-fixed');
      
      if (!container) {
        console.error('Container not found');
        setError('Container not found');
        return;
      }

      console.log('Container found, loading SwaggerUI...');

      // Load CSS
      if (!document.querySelector('link[href*="swagger-ui.css"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css';
        document.head.appendChild(cssLink);
        console.log('CSS loaded');
      }

      // Load JS
      const loadScript = () => {
        return new Promise((resolve, reject) => {
          if (window.SwaggerUIBundle) {
            resolve(true);
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js';
          script.onload = () => {
            console.log('SwaggerUI script loaded');
            resolve(true);
          };
          script.onerror = () => {
            reject(new Error('Failed to load SwaggerUI script'));
          };
          document.head.appendChild(script);
        });
      };

      await loadScript();

      // Wait a bit more for SwaggerUI to be ready
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!window.SwaggerUIBundle) {
        throw new Error('SwaggerUI not available');
      }

      console.log('Rendering SwaggerUI...');
      
      // Clear container
      container.innerHTML = '';

      // Render SwaggerUI
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
          console.log('SwaggerUI rendered successfully');
          setIsLoaded(true);
          setError(null);
        }
      });

    } catch (err) {
      console.error('Error loading SwaggerUI:', err);
      setError('Error loading SwaggerUI: ' + err);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Initializing...</div>
        </div>
      </div>
    );
  }

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
      <div id="swagger-ui-container-fixed" />
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