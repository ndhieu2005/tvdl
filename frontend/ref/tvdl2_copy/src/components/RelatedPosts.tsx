'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Tag, ArrowRight } from 'lucide-react';
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
  author?: {
    id: string;
    name: string;
  };
}

interface RelatedPostsProps {
  currentPostSlug: string;
  limit?: number;
  className?: string;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ 
  currentPostSlug, 
  limit = 3, 
  className = '' 
}) => {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/posts/related/${currentPostSlug}?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch related posts');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setRelatedPosts(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch related posts');
        }
      } catch (err) {
        console.error('Error fetching related posts:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (currentPostSlug) {
      fetchRelatedPosts();
    }
  }, [currentPostSlug, limit]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Bài viết liên quan</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Bài viết liên quan</h3>
        </div>
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Bài viết liên quan</h3>
        </div>
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          Không tìm thấy bài viết liên quan nào.
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Bài viết liên quan</h3>
        <span className="text-sm text-gray-500">({relatedPosts.length} bài viết)</span>
      </div>
      
      <div className="space-y-4">
        {relatedPosts.map((post) => {
          const categoryDisplay = CATEGORY_DISPLAY[post.category as Category] || post.category;
          const categoryColor = CATEGORY_COLORS[post.category as Category] || 'bg-gray-100 text-gray-800';
          const formattedDate = formatDateSafe(post.publishDate || post.createdAt, 'vi');
          
          return (
            <Link 
              key={post.id}
              href={`/post/${post.slug}`}
              className="block group hover:bg-gray-50 rounded-lg p-3 transition-colors"
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                  {post.featuredImage ? (
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Tag className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm leading-5 mb-1">
                    {post.title}
                  </h4>
                  
                  {/* Meta info */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
                      {categoryDisplay}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                  
                  {/* Tags and views */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
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
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500 truncate max-w-24">
                              {tagsArray.slice(0, 2).join(', ')}
                              {tagsArray.length > 2 && '...'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye className="h-3 w-3" />
                      <span>{post.viewCount}</span>
                    </div>
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="flex items-center">
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

export default RelatedPosts;