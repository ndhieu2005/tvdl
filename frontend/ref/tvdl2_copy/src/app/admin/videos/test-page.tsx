'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestVideosPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const testFetch = async () => {
      try {
        console.log('Testing videos API...');
        console.log('Token:', token ? 'exists' : 'missing');
        console.log('User:', user);

        if (!token) {
          setError('No token available');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/videos?page=1&limit=5', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response data:', result);

        if (response.ok) {
          setData(result);
        } else {
          setError(result.error || 'API call failed');
        }
      } catch (err) {
        console.error('Test fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      testFetch();
    } else {
      setLoading(false);
    }
  }, [token, user]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Videos API Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Auth Status:</h2>
          <p>Token: {token ? '✅ Present' : '❌ Missing'}</p>
          <p>User: {user ? `✅ ${user.name} (${user.role})` : '❌ Not logged in'}</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h3 className="font-semibold">Error:</h3>
            <p>{error}</p>
          </div>
        )}

        {data && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <h3 className="font-semibold">Success:</h3>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}