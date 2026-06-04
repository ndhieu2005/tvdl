'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Import các wrapper khác nhau
const SwaggerWrapperNew2 = dynamic(() => import('@/components/SwaggerWrapperNew2'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading New2...</div>
});

const SwaggerWrapperSimplest = dynamic(() => import('@/components/SwaggerWrapperSimplest'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading Simplest...</div>
});

const SwaggerWrapperDirect = dynamic(() => import('@/components/SwaggerWrapperDirect'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading Direct...</div>
});

const SwaggerWrapperTest = dynamic(() => import('@/components/SwaggerWrapperTest'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading Test...</div>
});

const SwaggerWrapperFixed = dynamic(() => import('@/components/SwaggerWrapperFixed'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading Fixed...</div>
});

const SwaggerWrapperIframe = dynamic(() => import('@/components/SwaggerWrapperIframe'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading Iframe...</div>
});

export default function ApiDocsComparePage() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('iframe');

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const response = await fetch('/api/docs');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSpec(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load API documentation');
        setLoading(false);
      }
    };

    fetchSpec();
  }, []);

  const tabs = [
    { id: 'iframe', label: 'Iframe (best)', component: SwaggerWrapperIframe },
    { id: 'fixed', label: 'Fixed (async)', component: SwaggerWrapperFixed },
    { id: 'direct', label: 'Direct (unique ID)', component: SwaggerWrapperDirect },
    { id: 'test', label: 'Test (timeout)', component: SwaggerWrapperTest },
    { id: 'simplest', label: 'Simplest (iframe)', component: SwaggerWrapperSimplest }
  ];

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

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-purple-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">SwaggerUI Wrapper Comparison</h1>
          <p className="mt-2 text-purple-100">
            Testing different approaches to load SwaggerUI
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="py-4">
          {ActiveComponent && <ActiveComponent spec={spec} />}
        </div>
      </div>
    </div>
  );
}