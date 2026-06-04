'use client';

import { useEffect, useState } from 'react';

interface SwaggerWrapperProps {
  spec: any;
}

export default function SwaggerWrapperSimple2({ spec }: SwaggerWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!spec) {
      setError('No API specification provided');
      return;
    }

    // Listen for messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'request-spec') {
        // Send spec to iframe
        const iframe = document.getElementById('swagger-iframe') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'swagger-spec',
            spec: spec
          }, '*');
        }
      } else if (event.data?.type === 'swagger-loaded') {
        setIsLoaded(true);
        setError(null);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
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

  return (
    <div className="swagger-wrapper">
      {!isLoaded && (
        <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Loading API Documentation...</div>
          </div>
        </div>
      )}
      
      <iframe
        id="swagger-iframe"
        src="/swagger-simple.html"
        style={{
          width: '100%',
          height: isLoaded ? '100vh' : '0px',
          border: 'none',
          minHeight: isLoaded ? '600px' : '0px',
          display: isLoaded ? 'block' : 'none'
        }}
        title="API Documentation"
        onLoad={() => {
          // Fallback timeout
          setTimeout(() => {
            if (!isLoaded) {
              setIsLoaded(true);
            }
          }, 3000);
        }}
      />
    </div>
  );
}