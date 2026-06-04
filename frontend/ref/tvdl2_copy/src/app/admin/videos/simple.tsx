'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Video, Loader2, AlertCircle } from 'lucide-react';

export default function SimpleVideosPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        if (!token) {
          setError('No authentication token');
          setLoading(false);
          return;
        }

        console.log('Fetching videos with token:', token.substring(0, 20) + '...');

        const response = await fetch('/api/videos?page=1&limit=10', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('API result:', result);

        if (result.success) {
          setVideos(result.data || []);
        } else {
          setError(result.error || 'API returned error');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <div>
              <h3 className="font-semibold">Error Loading Videos</h3>
              <p className="mt-1">{error}</p>
              <div className="mt-3 text-sm">
                <p>Debug info:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Token: {token ? 'Present' : 'Missing'}</li>
                  <li>User: {user ? `${user.name} (${user.role})` : 'Not logged in'}</li>
                  <li>Environment: {process.env.NODE_ENV}</li>
                </ul>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Videos Management</h1>
        <div className="text-sm text-gray-500">
          Found {videos.length} videos
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
          <p className="text-gray-500">Try adding some videos or check your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video, index) => (
            <div key={video.id || index} className="bg-white rounded-lg shadow p-4">
              <div className="aspect-video bg-gray-200 rounded mb-3 flex items-center justify-center">
                <Video className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                {video.title || 'Untitled'}
              </h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {video.description || 'No description'}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{video.platform || 'Unknown'}</span>
                <span>{video.status || 'Unknown'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}