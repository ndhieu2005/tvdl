'use client';

import { useState, useEffect } from 'react';

export default function ApiDocsTestPage() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => {
        setSpec(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load API documentation');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!spec) return;

    // Load SwaggerUI với HTML trực tiếp
    const container = document.getElementById('swagger-container');
    if (!container) return;

    // Sử dụng SwaggerUI với HTML embed
    container.innerHTML = `
      <div id="swagger-ui"></div>
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
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
              defaultModelExpandDepth: 2
            });
          }
        }
      </script>
    `;
  }, [spec]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">ViralPeek API Documentation (Test)</h1>
          <p className="mt-2 text-blue-100">
            Test version with direct HTML embedding
          </p>
        </div>
      </div>

      {/* Swagger UI Container */}
      <div className="max-w-7xl mx-auto">
        <div id="swagger-container" className="p-4"></div>
      </div>
    </div>
  );
}