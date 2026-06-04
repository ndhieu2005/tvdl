'use client';

import { useState, useEffect } from 'react';

interface OpenAPISpec {
  openapi?: string;
  info?: {
    title?: string;
    version?: string;
    description?: string;
  };
  paths?: {
    [key: string]: {
      [method: string]: any;
    };
  };
  [key: string]: any;
}

export default function ApiDocsDebugPage() {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔧 [DEBUG] Starting to fetch API docs...');
    
    fetch('/api/docs')
      .then(res => {
        console.log('🔧 [DEBUG] Response status:', res.status);
        console.log('🔧 [DEBUG] Response headers:', res.headers);
        return res.json();
      })
      .then(data => {
        console.log('🔧 [DEBUG] API docs data:', data);
        setSpec(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('🔧 [DEBUG] Error fetching API docs:', err);
        setError('Failed to load API documentation: ' + err.message);
        setLoading(false);
      });
  }, []);

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
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">API Documentation Debug</h1>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-2">API Spec Summary:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>OpenAPI Version:</strong> {spec?.openapi || 'N/A'}
            </div>
            <div>
              <strong>API Title:</strong> {spec?.info?.title || 'N/A'}
            </div>
            <div>
              <strong>API Version:</strong> {spec?.info?.version || 'N/A'}
            </div>
            <div>
              <strong>Total Paths:</strong> {spec?.paths ? Object.keys(spec.paths).length : 0}
            </div>
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-2">Available Endpoints:</h2>
          <div className="space-y-2">
            {spec?.paths ? Object.keys(spec.paths).map((path, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <strong>{path}</strong>
                <div className="mt-1 text-sm text-gray-600">
                  Methods: {Object.keys(spec.paths?.[path] || {}).join(', ').toUpperCase()}
                </div>
              </div>
            )) : (
              <div className="text-gray-500">No paths found</div>
            )}
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Full Spec (JSON):</h2>
          <pre className="bg-white p-4 rounded overflow-auto max-h-96 text-xs">
            {JSON.stringify(spec, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}