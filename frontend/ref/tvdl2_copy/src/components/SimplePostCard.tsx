import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock } from 'lucide-react';
import { SITE_CONTENT } from '@/lib/constants';

interface SimplePostCardProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    featuredImage?: string;
    publishedAt: string;
    category: string;
    readingTime?: number;
    tags?: string[];
  };
  variant?: 'default' | 'featured' | 'compact';
}

// Simple date formatting without locale dependencies
function formatSimpleDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  } catch (error) {
    return 'Recent';
  }
}

const SimplePostCard: React.FC<SimplePostCardProps> = ({ 
  post, 
  variant = 'default'
}) => {
  const formattedDate = formatSimpleDate(post.publishedAt);

  if (variant === 'featured') {
    return (
      <article className="relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <Link href={`/post/${post.slug}`}>
          <div className="relative h-64 md:h-80">
            {post.featuredImage ? (
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">No Image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="mb-2">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  {post.category}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 line-clamp-2">
                {post.title}
              </h2>
              <p className="text-gray-200 line-clamp-2 mb-4">
                {post.excerpt}
              </p>
              <div className="flex items-center text-sm text-gray-300">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="mr-4">{formattedDate}</span>
                {post.readingTime && (
                  <>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{post.readingTime} min read</span>
                  </>
                )}
              </div>
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
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">No Image</span>
                </div>
              )}
            </div>
            <div className="flex-1 p-4">
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                {post.title}
              </h3>
              <div className="flex items-center text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded-full mr-2">
                  {post.category}
                </span>
                <span>{formattedDate}</span>
              </div>
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
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-white text-lg font-bold">No Image</span>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              {post.category}
            </span>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-gray-600 line-clamp-3 mb-4">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between">
            {post.readingTime && (
              <div className="flex items-center text-sm text-gray-500">
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

export default SimplePostCard;