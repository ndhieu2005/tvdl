'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { sortPostsByPriority, getReadingStats, isPostRead, isPostStarted } from '@/lib/reading-history';
import { SITE_CONTENT } from '@/lib/constants';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  featuredImage?: string;
  publishDate?: string;
  publishedAt?: string;
  createdAt: string;
  category: string;
  tags?: string[];
  author?: {
    name: string;
  };
  readingTime?: number;
  viewCount?: number;
  priorityScore?: number;
  hasReadingHistory?: boolean;
  isRead?: boolean;
  isStarted?: boolean;
}

interface SmartPostGridProps {
  initialPosts: Post[];
  limit?: number;
  usePriority?: boolean;
  showLoadMore?: boolean;
  category?: string;
  className?: string;
}

// Function to get category display name
function getCategoryDisplayName(category: string): string {
  const categoryMap: Record<string, string> = {
    'TRENDING_NOW': 'Trending Now',
    'SOUNDS': 'Sounds',
    'CHALLENGES': 'Challenges',
    'CELEBRITIES': 'Celebrities',
    'TOP_LISTS': 'Top Lists',
    'FILTERS': 'Filters',
    'SOCIAL_MEDIA': 'Social Media',
    'GUIDELINES': 'Guidelines',
    'SPORT': 'Sport'
  };
  return categoryMap[category] || category;
}

export default function SmartPostGrid({
  initialPosts,
  limit = 6,
  usePriority = false,
  showLoadMore = false,
  category,
  className = ''
}: SmartPostGridProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [readingStats, setReadingStats] = useState<any>(null);

  // Apply priority sorting when component mounts or reading history changes
  useEffect(() => {
    if (usePriority && initialPosts.length > 0) {
      const prioritizedPosts = sortPostsByPriority(initialPosts);
      setPosts(prioritizedPosts);
      setReadingStats(getReadingStats());
    } else {
      setPosts(initialPosts);
    }
  }, [initialPosts, usePriority]);

  // Re-sort posts when reading history might have changed
  useEffect(() => {
    const handleStorageChange = () => {
      if (usePriority) {
        const prioritizedPosts = sortPostsByPriority(posts);
        setPosts(prioritizedPosts);
        setReadingStats(getReadingStats());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [posts, usePriority]);

  // Load more posts from API
  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: nextPage.toString()
      });

      if (category) {
        params.append('category', category);
      }

      const response = await fetch(`/api/posts/public?${params}`);
      const data = await response.json();

      if (data.success) {
        let newPosts = data.data;
        
        // Apply priority sorting to new posts if enabled
        if (usePriority) {
          const allPosts = [...posts, ...newPosts];
          const prioritizedPosts = sortPostsByPriority(allPosts);
          setPosts(prioritizedPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }
        
        setPage(nextPage);
        setHasMore(data.pagination?.hasNext || false);
      } else {
        console.error('Failed to load more posts:', data.error);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, limit, category, usePriority, posts]);



  if (posts.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">
          No posts available at the moment
        </div>
        <p className="text-gray-400">
          New posts will appear here once they are published
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Debug info for development */}
      {usePriority && readingStats && process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
          <div className="font-semibold mb-2">📊 Reading Stats:</div>
          <div>Using Priority: {usePriority ? 'Yes' : 'No'}</div>
          <div>Total Posts: {posts.length}</div>
          <div>Read Posts: {readingStats.completedPosts}</div>
          <div>Total Reading Time: {readingStats.totalTimeSpent} mins</div>
          <div>Started Posts: {posts.filter(p => p.isStarted && !p.isRead).length}</div>
          <div>Completed Posts: {posts.filter(p => p.isRead).length}</div>
          {readingStats.preferredCategories.length > 0 && (
            <div>Preferred Categories: {readingStats.preferredCategories.slice(0, 3).join(', ')}</div>
          )}
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <article 
            key={post.id} 
            className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${
              post.isRead ? 'opacity-60 border-l-4 border-green-300' : 
              post.isStarted ? 'opacity-80 border-l-4 border-yellow-300' : ''
            }`}
          >
            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title}
                className="w-full h-48 object-cover"
                loading={index < 3 ? 'eager' : 'lazy'}
              />
            )}
            <div className="p-6">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-2">
                    {getCategoryDisplayName(post.category)}
                  </span>
                  <span>{post.readingTime || 3} min read</span>
                </div>
                
                {/* Priority indicators */}
                {usePriority && (
                  <div className="flex items-center space-x-2">
                    {post.viewCount && post.viewCount > 0 && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                        {post.viewCount} views
                      </span>
                    )}
                    {post.isRead && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                        ✓ Read
                      </span>
                    )}
                    {post.isStarted && !post.isRead && (
                      <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
                        ⏳ Started
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <h4 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                {post.title}
              </h4>
              
              {post.excerpt && (
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <a 
                  href={`/post/${post.slug}`}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                >
                  {SITE_CONTENT.post.readMore} →
                </a>
                
                {/* Priority score for debugging */}
                {usePriority && post.priorityScore && process.env.NODE_ENV === 'development' && (
                  <span className="text-xs text-gray-400">
                    Score: {post.priorityScore.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Load More Button */}
      {showLoadMore && hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMorePosts}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              'Load More Posts'
            )}
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading && posts.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-300"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}