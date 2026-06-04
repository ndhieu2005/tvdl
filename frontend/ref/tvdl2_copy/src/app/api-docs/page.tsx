'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Import our custom wrapper
const SwaggerWrapper = dynamic(() => import('@/components/SwaggerWrapperSimple2'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center animate-pulse">Loading API Documentation...</div>
});

export default function ApiDocsPage() {
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
          <h1 className="text-3xl font-bold">ViralPeek API Documentation</h1>
          <p className="mt-2 text-blue-100">
            Comprehensive API documentation for ViralPeek entertainment news platform
          </p>
        </div>
      </div>

      {/* Swagger UI */}
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<div className="p-4 text-center animate-pulse">Loading API Documentation...</div>}>
          <SwaggerWrapper spec={spec} />
        </Suspense>
      </div>
    </div>
  );
}