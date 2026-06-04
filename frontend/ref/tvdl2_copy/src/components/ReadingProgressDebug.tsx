'use client';

import { useState, useEffect } from 'react';
import { getSessionId } from '@/lib/session';

interface ReadingProgressDebugProps {
  postId: string;
  show?: boolean;
}

export default function ReadingProgressDebug({ postId, show = false }: ReadingProgressDebugProps) {
  const [sessionId, setSessionId] = useState<string>('');
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  const [currentProgress, setCurrentProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
  }, []);

  useEffect(() => {
    if (sessionId && show) {
      fetchReadingHistory();
    }
  }, [sessionId, show]);

  const fetchReadingHistory = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/posts/reading-progress?sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        setReadingHistory(data.data);
        const currentPost = data.data.find((item: any) => item.postId === postId);
        setCurrentProgress(currentPost);
      }
    } catch (error) {
      console.error('Error fetching reading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearReadingHistory = async () => {
    if (!sessionId) return;
    
    try {
      // Clear localStorage
      localStorage.removeItem('viralpeek_session_id');
      
      // Generate new session ID
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('viralpeek_session_id', newSessionId);
      setSessionId(newSessionId);
      
      // Reset state
      setReadingHistory([]);
      setCurrentProgress(null);
      
      alert('Reading history cleared! New session started.');
    } catch (error) {
      console.error('Error clearing reading history:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">📊 Reading Debug</h3>
        <button
          onClick={clearReadingHistory}
          className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded"
        >
          Clear History
        </button>
      </div>
      
      <div className="text-xs space-y-2">
        <div>
          <strong>Session ID:</strong> {sessionId.slice(-8)}...
        </div>
        
        <div>
          <strong>Current Post:</strong>
          {currentProgress ? (
            <div className="bg-gray-50 p-2 rounded mt-1">
              <div>Time: {formatTime(currentProgress.timeSpent)}</div>
              <div>Scroll: {(currentProgress.scrollDepth * 100).toFixed(1)}%</div>
              <div>Completed: {currentProgress.isCompleted ? '✅' : '❌'}</div>
            </div>
          ) : (
            <span className="text-gray-500"> No data</span>
          )}
        </div>
        
        <div>
          <strong>Total Read Posts:</strong> {readingHistory.length}
        </div>
        
        {readingHistory.length > 0 && (
          <div>
            <strong>Recent Posts:</strong>
            <div className="max-h-32 overflow-y-auto">
              {readingHistory.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="bg-gray-50 p-1 rounded text-xs mb-1">
                  <div className="font-medium">{item.post.title.slice(0, 30)}...</div>
                  <div className="text-gray-600">
                    {formatTime(item.timeSpent)} • {(item.scrollDepth * 100).toFixed(0)}%
                    {item.isCompleted && ' ✅'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button
          onClick={fetchReadingHistory}
          disabled={loading}
          className="w-full text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}