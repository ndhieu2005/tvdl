import React from 'react';
import { notFound } from 'next/navigation';
import { Calendar, Clock, Tag, User } from 'lucide-react';
import { formatDateSafe } from '@/lib/utils';
import OptimizedImage from '@/components/OptimizedImage';
import OptimizedPostContent from '@/components/OptimizedPostContent';
import SmartImage from '@/components/SmartImage';
import VideoPlayer from '@/components/VideoPlayer';
import type { Metadata } from 'next';
import Script from 'next/script';
import { generatePostMetadata } from '@/lib/metadata';
import { getPostBySlug } from '@/lib/posts';

import RelatedPosts from '@/components/RelatedPosts';
import RelatedPostsGrid from '@/components/RelatedPostsGrid';
import ReadingTracker from '@/components/ReadingTracker';
import NoSSR from '@/components/NoSSR';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ArticleContentGuard, PublicContentGuard } from '@/components/ContentGuard';
import { parseTagsToArray } from '@/lib/tags-utils';

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

// Post type interface
interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  category: Category | {
    id: string;
    name: string;
    slug: string;
  };
  tags?: string[];
  publishDate?: string;
  createdAt: string;
  viewCount: number;
  likeCount?: number;
  shareCount: number;
  commentCount?: number;
  status: string;
  author?: {
    name: string;
  };
  // SEO fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  // Video fields
  videoUrl?: string;
  videoThumbnail?: string;
  videoPlatform?: string;
  videoTitle?: string;
  videoDescription?: string;
  videoMetadata?: {
    views?: number;
    likes?: number;
    duration?: string;
    [key: string]: any;
  };
}

async function getPost(slug: string, incrementView: boolean = false): Promise<Post | null> {
  try {
    const post = await getPostBySlug(slug, incrementView);
    if (!post) return null;
    
    // Convert null values to undefined to match TypeScript interface
    return {
      ...post,
      excerpt: post.excerpt ?? undefined,
      featuredImage: post.featuredImage ?? undefined,
      publishDate: post.publishDate?.toISOString() ?? undefined,
      tags: post.tags ? [post.tags] : undefined,
      likeCount: post.likeCount ?? undefined,
      commentCount: post.commentCount ?? undefined,
      seoTitle: post.seoTitle ?? undefined,
      seoDescription: post.seoDescription ?? undefined,
      seoKeywords: post.seoKeywords ? post.seoKeywords.split(',').map(k => k.trim()) : undefined,
      videoUrl: post.videoUrl ?? undefined,
      videoThumbnail: post.videoThumbnail ?? undefined,
      videoPlatform: post.videoPlatform ?? undefined,
      videoTitle: post.videoTitle ?? undefined,
      videoDescription: post.videoDescription ?? undefined,
      videoMetadata: post.videoMetadata as any ?? undefined,
      createdAt: post.createdAt.toISOString(),
      viewCount: post.viewCount,
      shareCount: post.shareCount,
      status: post.status,
      author: post.author ? {
        name: post.author.name
      } : undefined
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

// Generate metadata for SEO - DYNAMIC VERSION WITH POST DATA
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  console.log('🔍 generateMetadata called for slug:', slug);
  
  try {
    // Fetch post data
    const post = await getPost(slug);
    
    if (!post) {
      console.log('❌ Post not found in generateMetadata');
      return {
        title: 'Post Not Found | ViralPeek',
        description: 'The requested post could not be found.',
      };
    }
    
    console.log('✅ Post found in generateMetadata:', post.title);
    
    // Use the metadata helper function
    return await generatePostMetadata(post);
  } catch (error) {
    console.error('❌ Error in generateMetadata:', error);
    return {
      title: `Post: ${slug} | ViralPeek`,
      description: `Read about ${slug} on ViralPeek`,
    };
  }
}

export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  const post = await getPost(slug, true); // Increment view count for main page
  
  if (!post) {
    notFound();
  }
  
  const formattedDate = formatDateSafe(post.publishDate || post.createdAt, 'en');
  
  // Handle category display - could be string or object
  let categoryDisplay: string;
  let categoryColor: string;
  let categorySlug: string;
  
  if (typeof post.category === 'string') {
    categoryDisplay = CATEGORY_DISPLAY[post.category as Category] || post.category;
    categoryColor = CATEGORY_COLORS[post.category as Category] || 'bg-gray-100 text-gray-800';
    categorySlug = post.category.toLowerCase().replace(/_/g, '-');
  } else if (post.category && typeof post.category === 'object') {
    categoryDisplay = post.category.name;
    categoryColor = 'bg-gray-100 text-gray-800'; // Default color for dynamic categories
    categorySlug = post.category.slug;
  } else {
    categoryDisplay = 'Uncategorized';
    categoryColor = 'bg-gray-100 text-gray-800';
    categorySlug = 'uncategorized';
  }
  
  // Calculate estimated reading time
  const wordsPerMinute = 200;
  const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  
  // Create JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.seoDescription || `Read about ${post.title} on ViralPeek`,
    image: post.featuredImage || '/images/og-image.svg',
    datePublished: post.publishDate || post.createdAt,
    dateModified: post.createdAt,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'ViralPeek Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ViralPeek',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/images/logo.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/post/${slug}`,
    },
    keywords: post.seoKeywords || 'TikTok, viral, trending, entertainment, news, social media',
    articleSection: categoryDisplay,
    wordCount: post.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
    inLanguage: 'vi-VN',
    isAccessibleForFree: true,
  };

  return (
    <>
      {/* JSON-LD structured data - placed before interactive content */}
      <Script
        id="json-ld-structured-data"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Mobile Video Player - Show on top for mobile */}
      <div className="lg:hidden mb-8">
        {post.videoUrl && (
          <ArticleContentGuard>
            <ErrorBoundary>
              <VideoPlayer
                videoUrl={post.videoUrl}
                thumbnail={post.videoThumbnail || post.featuredImage}
                title={post.videoTitle || post.title}
                description={post.videoDescription}
                platform={post.videoPlatform}
                metadata={post.videoMetadata}
                showStats={true}
                compact={false}
              />
            </ErrorBoundary>
          </ArticleContentGuard>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Main Content (3/4 width) */}
        <div className="flex-1 lg:w-3/4">
          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Featured Image (only if no video) */}
            {!post.videoUrl && post.featuredImage && (
              <div className="relative h-64 md:h-80 w-full">
                <OptimizedImage
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover w-full h-full"
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                  category={typeof post.category === 'string' ? post.category : post.category?.name}
                />
              </div>
            )}
            
            {/* Content */}
            <div className="p-8">
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColor}`}>
                  {categoryDisplay}
                </span>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formattedDate}</span>
                </div>


                {post.author && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                    <span>By {post.author.name}</span>
                  </div>
                )}
              </div>
              
              {/* Title */}
              <h1 className="text-3xl font-bold mb-4 text-gray-900">
                {post.title}
              </h1>
              
              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              
              {/* Content - Protected by Cookie Consent */}
              <ArticleContentGuard>
                <OptimizedPostContent
                  content={post.content}
                  className="post-content prose max-w-none mb-8"
                  preloadImages={true}
                />
              </ArticleContentGuard>
              
              {/* Tags */}
              {(() => {
                const tagsArray = parseTagsToArray(post.tags);
                return tagsArray.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Tag className="h-4 w-4 mr-2" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tagsArray.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
              


            </div>
          </article>
          
          {/* Related Posts Section - Full width on mobile and desktop */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài viết liên quan</h2>
              <ArticleContentGuard>
                <RelatedPostsGrid currentPostSlug={slug} limit={3} />
              </ArticleContentGuard>
            </div>
          </div>
        </div>

        {/* Right Column - Video Player (1/4 width) */}
        <div className="lg:w-1/4">
          <div className="lg:sticky lg:top-8">
            {/* Desktop Video Player - Hide on mobile */}
            <div className="hidden lg:block">
              {post.videoUrl && (
                <ArticleContentGuard>
                  <div className="mb-6">
                    <ErrorBoundary>
                      <VideoPlayer
                        videoUrl={post.videoUrl}
                        thumbnail={post.videoThumbnail || post.featuredImage}
                        title={post.videoTitle || post.title}
                        description={post.videoDescription}
                        platform={post.videoPlatform}
                        metadata={post.videoMetadata}
                        showStats={true}
                        compact={true}
                        className="max-w-none"
                      />
                    </ErrorBoundary>
                  </div>
                </ArticleContentGuard>
              )}
            </div>
            

            
            {/* Related Posts */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <ArticleContentGuard>
                <RelatedPosts 
                  currentPostSlug={slug} 
                  limit={3}
                  className=""
                />
              </ArticleContentGuard>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reading Tracker */}
      <NoSSR>
        <ArticleContentGuard>
          <ReadingTracker
            postId={post.id}
            postSlug={slug}
            title={post.title}
            category={typeof post.category === 'string' ? post.category : post.category.name}
            contentSelector=".post-content"
            estimatedReadingTime={estimatedReadingTime}
          />
        </ArticleContentGuard>
      </NoSSR>
      </div>
    </>
  );
}