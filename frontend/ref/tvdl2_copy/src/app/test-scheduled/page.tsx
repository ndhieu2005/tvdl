'use client';

import { useState } from 'react';

export default function TestScheduledPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testScheduledPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/posts/update-scheduled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const testPublicPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/posts/public?category=TRENDING_NOW&limit=10');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const testPostBySlug = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/posts/slug/tiu-2');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Test Scheduled Posts</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testScheduledPosts}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Test Update Scheduled Posts'}
        </button>
        
        <button
          onClick={testPublicPosts}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          {loading ? 'Loading...' : 'Test Public Posts API'}
        </button>
        
        <button
          onClick={testPostBySlug}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 ml-4"
        >
          {loading ? 'Loading...' : 'Test Post by Slug'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Result:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}