'use client';

import { useEffect, useRef, useState } from 'react';

interface SwaggerWrapperProps {
  spec: any;
}

export default function SwaggerWrapperSimple({ spec }: SwaggerWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!spec || !containerRef.current) {
      console.log('🔧 [SwaggerWrapper] Missing spec or container ref');
      return;
    }

    console.log('🔧 [SwaggerWrapper] Starting to load SwaggerUI...');
    console.log('🔧 [SwaggerWrapper] Spec preview:', { 
      hasSpec: !!spec, 
      specType: typeof spec, 
      keys: Object.keys(spec || {}) 
    });

    const renderSwagger = () => {
      if (!containerRef.current || !window.SwaggerUIBundle) {
        console.log('🔧 [SwaggerWrapper] Cannot render - missing container or SwaggerUI');
        return;
      }

      try {
        console.log('🔧 [SwaggerWrapper] Rendering SwaggerUI...');
        
        // Clear container first
        containerRef.current.innerHTML = '';
        
        window.SwaggerUIBundle({
          spec: spec,
          domNode: containerRef.current, // Use domNode instead of dom_id
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
            console.log('🔧 [SwaggerWrapper] SwaggerUI rendered successfully');
            setIsLoaded(true);
            setError(null);
          }
        });
      } catch (err) {
        console.error('🔧 [SwaggerWrapper] Error rendering SwaggerUI:', err);
        setError('Error rendering SwaggerUI: ' + err);
      }
    };

    // Check if SwaggerUI is already loaded
    if (window.SwaggerUIBundle) {
      console.log('🔧 [SwaggerWrapper] SwaggerUI already loaded, rendering...');
      renderSwagger();
      return;
    }

    // Load SwaggerUI assets
    const loadSwaggerUI = async () => {
      try {
        console.log('🔧 [SwaggerWrapper] Loading SwaggerUI assets...');
        
        // Check if CSS is already loaded
        if (!document.querySelector('link[href*="swagger-ui.css"]')) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.3/swagger-ui.css';
          document.head.appendChild(cssLink);
        }

        // Check if JS is already loaded
        if (!document.querySelector('script[src*="swagger-ui-bundle.js"]')) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.3/swagger-ui-bundle.js';
          script.onload = () => {
            console.log('🔧 [SwaggerWrapper] SwaggerUI script loaded successfully');
            setTimeout(() => {
              renderSwagger();
            }, 500); // Increased timeout
          };
          script.onerror = (err) => {
            console.error('🔧 [SwaggerWrapper] Failed to load SwaggerUI script:', err);
            setError('Failed to load SwaggerUI from CDN. Please check your internet connection.');
          };

          document.head.appendChild(script);
        } else {
          // Script already exists, just render
          setTimeout(() => {
            renderSwagger();
          }, 100);
        }
      } catch (err) {
        console.error('🔧 [SwaggerWrapper] Error loading SwaggerUI:', err);
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
          <div className="text-gray-600">Loading API Documentation...</div>
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