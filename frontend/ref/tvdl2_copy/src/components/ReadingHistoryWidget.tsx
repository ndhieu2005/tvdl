'use client';

import React, { useState, useEffect } from 'react';
import { getReadingHistory, getReadingStats, clearReadingHistory } from '@/lib/reading-history';
import { shouldShowReadingHistory, logEnvironmentVariables } from '@/lib/env-debug';
import { Book, Clock, TrendingUp, X } from 'lucide-react';

interface ReadingHistoryWidgetProps {
  show?: boolean;
  onClose?: () => void;
}

export default function ReadingHistoryWidget({ show = false, onClose }: ReadingHistoryWidgetProps) {
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  const [readingStats, setReadingStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (show && isHydrated) {
      loadReadingData();
    }
  }, [show, isHydrated]);

  const loadReadingData = () => {
    setLoading(true);
    try {
      const history = getReadingHistory();
      const stats = getReadingStats();
      setReadingHistory(history);
      setReadingStats(stats);
    } catch (error) {
      console.error('Error loading reading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all reading history?')) {
      clearReadingHistory();
      setReadingHistory([]);
      setReadingStats(null);
      if (onClose) onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!show || !isHydrated) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <Book className="w-5 h-5 mr-2" />
            Reading History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        {readingStats && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{readingStats.totalPosts}</div>
                <div className="text-sm text-gray-600">Posts Read</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{readingStats.completedPosts}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{readingStats.totalTimeSpent}</div>
                <div className="text-sm text-gray-600">Minutes Read</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {readingStats.preferredCategories.length > 0 ? readingStats.preferredCategories[0] : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Top Category</div>
              </div>
            </div>
          </div>
        )}

        {/* Reading History List */}
        <div className="overflow-y-auto max-h-96 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : readingHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Book className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No reading history yet</p>
              <p className="text-sm">Start reading some posts to see your history here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {readingHistory.map((record, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    record.isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : record.scrollDepth > 0.5 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                        {record.title}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(record.timeSpent)}
                        </span>
                        <span className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {(record.scrollDepth * 100).toFixed(0)}%
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                          {record.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-4">
                      <div className="text-xs text-gray-500">
                        {formatDate(record.readAt)}
                      </div>
                      {record.isCompleted && (
                        <div className="text-green-600 text-xs mt-1">✓ Completed</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              Clear History
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple trigger component
export function ReadingHistoryTrigger() {
  const [showWidget, setShowWidget] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    // Debug environment variables
    logEnvironmentVariables();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    const loadStats = () => {
      try {
        const readingStats = getReadingStats();
        setStats(readingStats);
      } catch (error) {
        console.error('Error loading reading stats:', error);
      }
    };

    loadStats();
    
    // Update stats when localStorage changes
    const handleStorageChange = () => loadStats();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isHydrated]);

  // Don't show in production environment - using utility function
  if (!shouldShowReadingHistory()) return null;
  
  if (!isHydrated || !stats || stats.totalPosts === 0) return null;

  return (
    <>
      <button
        onClick={() => setShowWidget(true)}
        className="fixed bottom-4 left-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        title="View Reading History"
      >
        <Book className="w-5 h-5" />
        {stats.totalPosts > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {stats.totalPosts > 9 ? '9+' : stats.totalPosts}
          </span>
        )}
      </button>

      <ReadingHistoryWidget
        show={showWidget}
        onClose={() => setShowWidget(false)}
      />
    </>
  );
}