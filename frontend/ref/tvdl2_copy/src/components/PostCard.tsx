'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import { formatDateSafe } from '@/lib/utils';
import { SITE_CONTENT } from '@/lib/constants';
import OptimizedImage from './OptimizedImage';
import SmartImage from './SmartImage';

interface PostCardProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    featuredImage?: string;
    publishedAt?: string;
    publishDate?: string;
    createdAt?: string;
    category: string;
    readingTime?: number;
    tags?: string[];
  };
  variant?: 'default' | 'featured' | 'compact' | 'optimized';
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  variant = 'default'
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Use safe date formatting to prevent hydration mismatch (English only)
  const dateToFormat = post.publishDate || post.publishedAt || post.createdAt || '';
  const formattedDate = formatDateSafe(dateToFormat, 'en');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (variant === 'featured') {
    return (
      <article className="relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <Link href={`/post/${post.slug}`}>
          <div className="relative h-64 md:h-80">
            {post.featuredImage ? (
              <OptimizedImage
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover w-full h-full"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                category={post.category}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">VP</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-purple-600 text-xs font-medium rounded">
                  {post.category}
                </span>
                <div className="flex items-center space-x-1 text-sm opacity-90">
                  <Calendar className="h-4 w-4" />
                  <span suppressHydrationWarning>{formattedDate}</span>
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-2 line-clamp-2">
                {post.title}
              </h2>
              <p className="text-gray-200 line-clamp-2">{post.excerpt}</p>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <Link href={`/post/${post.slug}`} className="block">
          <div className="flex">
            <div className="relative w-24 h-24 flex-shrink-0">
              {post.featuredImage ? (
                <OptimizedImage
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover w-full h-full"
                  sizes="(max-width: 640px) 96px, 96px"
                  category={post.category}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VP</span>
                </div>
              )}
            </div>
            <div className="flex-1 p-3">
              <h3 className="text-sm font-semibold line-clamp-2 mb-1">
                {post.title}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{post.category}</span>
                <span>•</span>
                <span suppressHydrationWarning>
                  {isHydrated ? formattedDate : '...'}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Optimized variant using SmartImage
  if (variant === 'optimized') {
    return (
      <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <Link href={`/post/${post.slug}`}>
          <div className="relative h-48">
            {post.featuredImage ? (
              <SmartImage
                src={post.featuredImage}
                alt={post.title}
                preset="card"
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">VP</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                {post.category}
              </span>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span suppressHydrationWarning>
                  {isHydrated ? formattedDate : '...'}
                </span>
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
              {post.title}
            </h2>
            <p className="text-gray-600 text-sm line-clamp-3 mb-3">{post.excerpt}</p>
            <div className="flex items-center justify-between">
              {post.readingTime && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{post.readingTime} min read</span>
                </div>
              )}
              <span className="text-purple-600 text-sm font-medium hover:underline">
                {SITE_CONTENT.post.readMore} →
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <Link href={`/post/${post.slug}`}>
        <div className="relative h-48">
          {post.featuredImage ? (
            <OptimizedImage
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover w-full h-full"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              category={post.category}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">VP</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
              {post.category}
            </span>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span suppressHydrationWarning>
                {isHydrated ? formattedDate : '...'}
              </span>
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
            {post.title}
          </h2>
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">{post.excerpt}</p>
          <div className="flex items-center justify-between">
            {post.readingTime && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{post.readingTime} min read</span>
              </div>
            )}
            <span className="text-purple-600 text-sm font-medium hover:underline">
              {SITE_CONTENT.post.readMore} →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default PostCard;