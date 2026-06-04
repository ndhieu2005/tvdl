'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugVideosPage() {
  const { token, user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    setDebugInfo({
      token: token ? 'Present' : 'Missing',
      user: user ? `${user.name} (${user.role})` : 'Not logged in',
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      location: typeof window !== 'undefined' ? window.location.href : 'Server'
    });
  }, [token, user]);

  const testApiCall = async () => {
    try {
      if (!token) {
        alert('No token available');
        return;
      }

      const response = await fetch('/api/videos?page=1&limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('API Response:', result);
      alert(`API Response: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error('API Error:', error);
      alert(`API Error: ${error}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Videos Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Debug Information:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="space-x-4">
          <button
            onClick={testApiCall}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test API Call
          </button>
          
          <button
            onClick={() => window.location.href = '/admin/videos'}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Go to Videos Page
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reload Page
          </button>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-semibold">Instructions:</h3>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Check if you're logged in and have a valid token</li>
            <li>Test the API call to see if it works</li>
            <li>Check browser console for any errors</li>
            <li>Try going to the main videos page</li>
          </ol>
        </div>
      </div>
    </div>
  );
}