'use client';

import { useEffect, useState } from 'react';

interface SwaggerWrapperProps {
  spec: any;
}

export default function SwaggerWrapperIframe({ spec }: SwaggerWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string>('');

  useEffect(() => {
    if (!spec) {
      setError('No API specification provided');
      return;
    }

    try {
      // Tạo HTML content hoàn chỉnh
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>API Documentation</title>
          <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .swagger-ui .topbar { display: none !important; }
            .swagger-ui .info { margin: 20px 0; }
            .swagger-ui .wrapper { padding: 0; }
          </style>
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
          <script>
            window.addEventListener('load', function() {
              if (window.SwaggerUIBundle) {
                try {
                  const ui = SwaggerUIBundle({
                    spec: ${JSON.stringify(spec)},
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [
                      SwaggerUIBundle.presets.apis,
                      SwaggerUIBundle.presets.standalone
                    ],
                    plugins: [
                      SwaggerUIBundle.plugins.DownloadUrl
                    ],
                    layout: "StandaloneLayout",
                    tryItOutEnabled: true,
                    displayOperationId: false,
                    displayRequestDuration: true,
                    filter: true,
                    docExpansion: "list",
                    defaultModelsExpandDepth: 2,
                    defaultModelExpandDepth: 2,
                    onComplete: () => {
                      console.log('SwaggerUI loaded successfully');
                      // Hide topbar
                      const topbar = document.querySelector('.topbar');
                      if (topbar) {
                        topbar.style.display = 'none';
                      }
                      
                      // Post message to parent
                      window.parent.postMessage('swagger-loaded', '*');
                    }
                  });
                } catch (error) {
                  console.error('Error initializing SwaggerUI:', error);
                  document.body.innerHTML = '<div style="text-align: center; padding: 40px; color: #dc3545;">Error loading SwaggerUI: ' + error.message + '</div>';
                }
              } else {
                document.body.innerHTML = '<div style="text-align: center; padding: 40px; color: #dc3545;">SwaggerUI not loaded</div>';
              }
            });
          </script>
        </body>
        </html>
      `;

      // Tạo blob URL
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setIframeSrc(url);

      // Listen for messages from iframe
      const handleMessage = (event: MessageEvent) => {
        if (event.data === 'swagger-loaded') {
          setIsLoaded(true);
          setError(null);
        }
      };

      window.addEventListener('message', handleMessage);

      return () => {
        window.removeEventListener('message', handleMessage);
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      setError('Error creating SwaggerUI: ' + err);
    }
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
      
      {iframeSrc && (
        <iframe
          src={iframeSrc}
          style={{
            width: '100%',
            height: isLoaded ? '100vh' : '0px',
            border: 'none',
            minHeight: isLoaded ? '600px' : '0px',
            display: isLoaded ? 'block' : 'none'
          }}
          title="API Documentation"
          onLoad={() => {
            // Fallback timeout in case message doesn't arrive
            setTimeout(() => {
              if (!isLoaded) {
                setIsLoaded(true);
              }
            }, 5000);
          }}
        />
      )}
    </div>
  );
}