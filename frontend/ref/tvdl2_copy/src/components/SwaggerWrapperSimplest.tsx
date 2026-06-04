'use client';

import { useEffect, useState } from 'react';

interface SwaggerWrapperProps {
  spec: any;
}

export default function SwaggerWrapperSimplest({ spec }: SwaggerWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    if (!spec) {
      setError('No API specification provided');
      return;
    }

    try {
      // Tạo HTML content với SwaggerUI embeded
      const swaggerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
          <script>
            window.onload = function() {
              if (window.SwaggerUIBundle) {
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
                    // Hide topbar
                    const topbar = document.querySelector('.topbar');
                    if (topbar) {
                      topbar.style.display = 'none';
                    }
                  }
                });
              }
            }
          </script>
        </body>
        </html>
      `;

      setHtmlContent(swaggerHtml);
      setIsLoaded(true);
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
      <iframe
        srcDoc={htmlContent}
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          minHeight: '600px'
        }}
        title="API Documentation"
      />
    </div>
  );
}