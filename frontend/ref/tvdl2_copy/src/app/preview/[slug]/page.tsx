import React from 'react';
import { notFound } from 'next/navigation';
import { Calendar, Clock, Share2, Tag, Eye, User, AlertCircle, Heart, MessageCircle } from 'lucide-react';
import { formatDateSafe } from '@/lib/utils';
import Image from 'next/image';
import VideoPlayer from '@/components/VideoPlayer';
import { getPostBySlugForPreview } from '@/lib/posts';

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

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  category: Category;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  tags: string[];
  authorId: string;
  createdBy: string;
  publishDate?: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
  };
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

async function getPostForPreview(slug: string): Promise<Post | null> {
  try {
    const rawPost = await getPostBySlugForPreview(slug);
    
    if (!rawPost) {
      return null;
    }

    // Parse tags from JSON string to array if needed
    let tags: string[] = [];
    if (rawPost.tags && typeof rawPost.tags === 'string') {
      try {
        tags = JSON.parse(rawPost.tags);
      } catch (e) {
        console.warn('Failed to parse tags JSON:', rawPost.tags);
        tags = [];
      }
    } else if (!rawPost.tags) {
      tags = [];
    }
    
    // Ensure seoKeywords is also an array
    let seoKeywords: string[] = [];
    if (rawPost.seoKeywords && typeof rawPost.seoKeywords === 'string') {
      try {
        seoKeywords = JSON.parse(rawPost.seoKeywords);
      } catch (e) {
        console.warn('Failed to parse seoKeywords JSON:', rawPost.seoKeywords);
        seoKeywords = [];
      }
    } else if (!rawPost.seoKeywords) {
      seoKeywords = [];
    }
    
    // Transform the post to match the expected interface
    const post: Post = {
      id: rawPost.id,
      title: rawPost.title,
      slug: rawPost.slug,
      content: rawPost.content,
      excerpt: rawPost.excerpt || '',
      featuredImage: rawPost.featuredImage ?? undefined,
      category: rawPost.category?.name as Category || 'TRENDING_NOW',
      status: rawPost.status,
      tags,
      authorId: rawPost.authorId,
      createdBy: rawPost.createdBy,
      publishDate: rawPost.publishDate?.toISOString(),
      viewCount: rawPost.viewCount,
      likeCount: rawPost.likeCount,
      shareCount: rawPost.shareCount,
      commentCount: rawPost.commentCount,
      seoTitle: rawPost.seoTitle || '',
      seoDescription: rawPost.seoDescription || '',
      seoKeywords,
      createdAt: rawPost.createdAt.toISOString(),
      updatedAt: rawPost.updatedAt.toISOString(),
      author: rawPost.author ? {
        name: rawPost.author.name
      } : undefined,
      videoUrl: rawPost.videoUrl ?? undefined,
      videoThumbnail: rawPost.videoThumbnail ?? undefined,
      videoPlatform: rawPost.videoPlatform ?? undefined,
      videoTitle: rawPost.videoTitle ?? undefined,
      videoDescription: rawPost.videoDescription ?? undefined,
      videoMetadata: rawPost.videoMetadata as any ?? undefined
    };
    
    return post;
  } catch (error) {
    console.error('Error fetching post for preview:', error);
    return null;
  }
}

export default async function PostPreviewPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const post = await getPostForPreview(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = formatDateSafe(post.publishDate || post.createdAt, 'en');
  const categoryDisplay = CATEGORY_DISPLAY[post.category as Category] || post.category;
  const categoryColor = CATEGORY_COLORS[post.category as Category] || 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Banner */}
      <div className="bg-yellow-500 text-black px-4 py-2 text-center font-medium">
        <div className="flex items-center justify-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>🔍 PREVIEW MODE - This post is not yet published</span>
          <div className="bg-black/10 px-2 py-1 rounded text-sm">
            Status: {post.status}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile Video Player - Show on top for mobile */}
        <div className="lg:hidden mb-8">
          {post.videoUrl && (
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
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Main Content (3/4 width) */}
          <div className="flex-1 lg:w-3/4">
            <article className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Featured Image (only if no video) */}
              {!post.videoUrl && post.featuredImage && (
                <div className="relative h-64 md:h-80">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
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
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Eye className="h-4 w-4" />
                    <span>{post.viewCount} views</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Heart className="h-4 w-4" />
                    <span>{post.likeCount} likes</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.commentCount} comments</span>
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
                
                {/* Content */}
                <div 
                  className="prose max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                
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
                
                {/* Engagement Stats */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Heart className="h-5 w-5" />
                        <span className="font-semibold">{post.likeCount}</span>
                        <span className="text-sm">likes</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MessageCircle className="h-5 w-5" />
                        <span className="font-semibold">{post.commentCount}</span>
                        <span className="text-sm">comments</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Share2 className="h-5 w-5" />
                        <span className="font-semibold">{post.shareCount}</span>
                        <span className="text-sm">shares</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Post ID: {post.id}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Right Column - Video Player & Info (1/4 width) */}
          <div className="lg:w-1/4">
            <div className="lg:sticky lg:top-8">
              {/* Desktop Video Player - Hide on mobile */}
              <div className="hidden lg:block">
                {post.videoUrl && (
                  <div className="mb-6">
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
                  </div>
                )}
              </div>
              
              {/* Preview Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">Preview Information</h3>
                    <div className="mt-2 text-sm text-blue-700 space-y-1">
                      <p><strong>Status:</strong> {post.status}</p>
                      <p><strong>Slug:</strong> {post.slug}</p>
                      {post.publishDate && (
                        <p><strong>Publish Date:</strong> {formatDateSafe(post.publishDate)}</p>
                      )}
                      <p><strong>Last Updated:</strong> {formatDateSafe(post.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Stats Card */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Thống kê tương tác</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Lượt xem</span>
                    </div>
                    <span className="font-semibold text-gray-900">{post.viewCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-600">Lượt thích</span>
                    </div>
                    <span className="font-semibold text-gray-900">{post.likeCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Bình luận</span>
                    </div>
                    <span className="font-semibold text-gray-900">{post.commentCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Share2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Chia sẻ</span>
                    </div>
                    <span className="font-semibold text-gray-900">{post.shareCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}