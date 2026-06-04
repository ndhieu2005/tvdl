'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Tag, ArrowRight } from 'lucide-react';
import { formatDateSafe } from '@/lib/utils';

// Define category types
type Category = 'TRENDING_NOW' | 'SOUNDS' | 'CHALLENGES' | 'CELEBRITIES' | 'TOP_LISTS' | 'FILTERS' | 'SOCIAL_MEDIA' | 'GUIDELINES';

// Category display mapping
const CATEGORY_DISPLAY: Record<Category, string> = {
  'TRENDING_NOW': 'Trending Now',
  'SOUNDS': 'Sounds',
  'CHALLENGES': 'Challenges',
  'CELEBRITIES': 'Celebrities',
  'TOP_LISTS': 'Top Lists',
  'FILTERS': 'Filters',
  'SOCIAL_MEDIA': 'Social Media',
  'GUIDELINES': 'Guidelines'
} as const;

// Category colors
const CATEGORY_COLORS: Record<Category, string> = {
  'TRENDING_NOW': 'bg-purple-100 text-purple-800',
  'SOUNDS': 'bg-blue-100 text-blue-800',
  'CHALLENGES': 'bg-green-100 text-green-800',
  'CELEBRITIES': 'bg-pink-100 text-pink-800',
  'TOP_LISTS': 'bg-orange-100 text-orange-800',
  'FILTERS': 'bg-indigo-100 text-indigo-800',
  'SOCIAL_MEDIA': 'bg-cyan-100 text-cyan-800',
  'GUIDELINES': 'bg-gray-100 text-gray-800'
} as const;

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  category: Category;
  tags?: string[];
  publishDate?: string;
  createdAt: string;
  viewCount: number;
  likeCount?: number;
  commentCount?: number;
  author?: {
    id: string;
    name: string;
  };
}

interface RelatedPostsGridProps {
  currentPostSlug: string;
  limit?: number;
  className?: string;
}

const RelatedPostsGrid: React.FC<RelatedPostsGridProps> = ({ 
  currentPostSlug, 
  limit = 3, 
  className = '' 
}) => {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchRelatedPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/posts/related/${currentPostSlug}?limit=${limit}`, {
          signal: abortController.signal
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch related posts');
        }
        
        const data = await response.json();
        
        // Check if component is still mounted before updating state
        if (!abortController.signal.aborted && isMountedRef.current) {
          if (data.success) {
            setRelatedPosts(data.data);
          } else {
            throw new Error(data.error || 'Failed to fetch related posts');
          }
        }
      } catch (err) {
        // Only update state if request wasn't aborted and component is mounted
        if (!abortController.signal.aborted && isMountedRef.current) {
          console.error('Error fetching related posts:', err);
          setError(err instanceof Error ? err.message : 'Something went wrong');
        }
      } finally {
        // Only update loading state if request wasn't aborted and component is mounted
        if (!abortController.signal.aborted && isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    if (currentPostSlug) {
      fetchRelatedPosts();
    }

    // Cleanup function to abort request if component unmounts
    return () => {
      isMountedRef.current = false;
      abortController.abort();
    };
  }, [currentPostSlug, limit]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={`skeleton-${i}`} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg">
          <p className="text-lg font-medium mb-2">Không thể tải bài viết liên quan</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center text-gray-500 bg-gray-50 p-6 rounded-lg">
          <p className="text-lg font-medium mb-2">Không tìm thấy bài viết liên quan</p>
          <p className="text-sm">Hãy thử khám phá các bài viết khác trên trang chủ.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((post) => {
          const categoryDisplay = CATEGORY_DISPLAY[post.category as Category] || post.category;
          const categoryColor = CATEGORY_COLORS[post.category as Category] || 'bg-gray-100 text-gray-800';
          const formattedDate = formatDateSafe(post.publishDate || post.createdAt, 'vi');
          
          return (
            <Link 
              key={post.id}
              href={`/post/${post.slug}`}
              className="block group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Featured Image */}
              <div className="relative h-48 overflow-hidden">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      // Handle image load errors gracefully
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Tag className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
                    {categoryDisplay}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-base leading-6 mb-2">
                  {post.title}
                </h3>
                
                {post.excerpt && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                
                {/* Meta info */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formattedDate}</span>
                  </div>
                  {post.author && (
                    <div className="flex items-center gap-1">
                      <span>By {post.author.name}</span>
                    </div>
                  )}
                </div>
                
                {/* Tags */}
                {(() => {
                  // Handle tags - could be string, array, or null
                  let tagsArray: string[] = [];
                  if (post.tags) {
                    if (Array.isArray(post.tags)) {
                      tagsArray = post.tags;
                    } else if (typeof post.tags === 'string') {
                      const tagsString = post.tags as string;
                      try {
                        const parsedTags = JSON.parse(tagsString);
                        if (Array.isArray(parsedTags)) {
                          tagsArray = parsedTags;
                        } else {
                          tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                        }
                      } catch {
                        tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                      }
                    }
                  }
                  
                  return tagsArray.length > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      <Tag className="h-3 w-3 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {tagsArray.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                        {tagsArray.length > 3 && (
                          <span className="text-xs text-gray-500">+{tagsArray.length - 3}</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
                
                {/* Navigation */}
                <div className="flex items-center justify-end text-xs text-gray-500">
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedPostsGrid;