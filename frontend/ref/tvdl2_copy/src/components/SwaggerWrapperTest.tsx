'use client';

import { useEffect, useRef, useState } from 'react';

interface SwaggerWrapperTestProps {
  spec: any;
}

export default function SwaggerWrapperTest({ spec }: SwaggerWrapperTestProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState('Initializing...');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!spec) {
      setError('No API specification provided');
      return;
    }

    if (!containerRef.current) {
      setError('Container reference not found');
      return;
    }

    const loadSwaggerUI = async () => {
      try {
        setLoadingStep('Loading SwaggerUI CSS...');
        
        // Load CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css';
        document.head.appendChild(cssLink);

        setLoadingStep('Loading SwaggerUI JavaScript...');
        
        // Load JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js';
        
        script.onload = () => {
          setLoadingStep('Rendering SwaggerUI...');
          
          setTimeout(() => {
            try {
              if (!window.SwaggerUIBundle) {
                throw new Error('SwaggerUI Bundle not loaded');
              }

              // Clear container
              if (containerRef.current) {
                containerRef.current.innerHTML = '';
              }

              window.SwaggerUIBundle({
                spec: spec,
                domNode: containerRef.current,
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
                  setError(null);
                  setLoadingStep('Complete');
                }
              });
            } catch (err) {
              setError('Error rendering SwaggerUI: ' + err);
            }
          }, 1000);
        };
        
        script.onerror = () => {
          setError('Failed to load SwaggerUI from CDN');
        };

        document.head.appendChild(script);
      } catch (err) {
        setError('Error loading SwaggerUI: ' + err);
      }
    };

    loadSwaggerUI();
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
          <div className="text-gray-600 font-medium">Loading API Documentation...</div>
          <div className="text-gray-500 text-sm mt-2">{loadingStep}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="swagger-wrapper">
      <div ref={containerRef} />
      <style jsx global>{`
        .swagger-wrapper .swagger-ui .topbar {
          display: none;
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