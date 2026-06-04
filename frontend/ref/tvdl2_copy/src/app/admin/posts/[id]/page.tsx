'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { postAPI } from '@/lib/api';
import { IPost } from '@/lib/models/Post';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  User,
  Tag,
  Globe,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { formatDateSafe } from '@/lib/utils';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled';
  category: string;
  tags: string[];
  featuredImage?: string;
  publishDate?: string;
  seoTitle?: string;
  seoDescription?: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// Category display mapping
const CATEGORY_DISPLAY = {
  'trending-now': 'Trending Now',
  'sounds': 'Sounds',
  'challenges': 'Challenges',
  'celebrities': 'Celebrities',
  'top-lists': 'Top Lists',
  'filters': 'Filters',
  'social-media': 'Social Media',
  'guidelines': 'Guidelines',
  'uncategorized': 'Uncategorized'
};

// Status display mapping
const STATUS_DISPLAY = {
  'draft': 'Draft',
  'published': 'Published',
  'scheduled': 'Scheduled'
};

// Status colors
const STATUS_COLORS = {
  'draft': 'bg-gray-100 text-gray-800',
  'published': 'bg-green-100 text-green-800',
  'scheduled': 'bg-blue-100 text-blue-800'
};

// Convert Prisma enum to string
const convertStatus = (status: any): 'draft' | 'published' | 'scheduled' => {
  switch (status) {
    case 'DRAFT':
      return 'draft';
    case 'PUBLISHED':
      return 'published';
    case 'SCHEDULED':
      return 'scheduled';
    default:
      return 'draft';
  }
};

// Transform IPost to Post interface
const transformIPostToPost = (ipost: IPost): Post => {
  return {
    id: ipost.id,
    title: ipost.title,
    slug: ipost.slug,
    content: ipost.content,
    excerpt: ipost.excerpt || '',
    status: convertStatus(ipost.status),
    category: ipost.category?.name || ipost.category?.slug || 'uncategorized',
    tags: ipost.tags ? JSON.parse(ipost.tags) : [],
    featuredImage: ipost.featuredImage || undefined,
    publishDate: ipost.publishDate?.toString() || undefined,
    seoTitle: ipost.seoTitle || undefined,
    seoDescription: ipost.seoDescription || undefined,
    viewCount: ipost.viewCount || 0,
    likeCount: ipost.likeCount || 0,
    shareCount: 0, // Default value since not in IPost
    commentCount: 0, // Default value since not in IPost
    createdAt: ipost.createdAt?.toString() || '',
    updatedAt: ipost.updatedAt?.toString() || '',
    author: {
      id: typeof ipost.author === 'string' ? ipost.author : ipost.author?.toString() || '',
      name: 'Unknown', // Default since not populated
      email: 'Unknown', // Default since not populated
      role: 'Unknown' // Default since not populated
    }
  };
};

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchPost();
    }
  }, [resolvedParams?.id]);

  const fetchPost = async () => {
    if (!resolvedParams?.id) return;
    
    try {
      setLoading(true);
      const result = await postAPI.getPost(resolvedParams.id);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch post');
      }
      
      // Transform IPost to Post
      const transformedPost = transformIPostToPost(result.data);
      setPost(transformedPost);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    try {
      const result = await postAPI.deletePost(post.id);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete post');
      }

      router.push('/admin/posts');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Post not found'}</p>
          <button
            onClick={() => router.push('/admin/posts')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  const categoryDisplay = CATEGORY_DISPLAY[post.category as keyof typeof CATEGORY_DISPLAY] || post.category;
  const statusDisplay = STATUS_DISPLAY[post.status as keyof typeof STATUS_DISPLAY] || post.status;
  const statusColor = STATUS_COLORS[post.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/posts')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Posts</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Post Details</h1>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href={`/post/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
                <span>View Live</span>
              </a>
              <button
                onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative h-64 md:h-80">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                {statusDisplay}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {categoryDisplay}
              </span>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{formatDateSafe(post.createdAt, 'en')}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>{post.author.name}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold mb-4 text-gray-900">
              {post.title}
            </h1>

            {/* Slug */}
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                <Globe className="h-4 w-4 inline mr-1" />
                /post/{post.slug}
              </p>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Excerpt</h3>
                <p className="text-gray-700">{post.excerpt}</p>
              </div>
            )}

            {/* Content */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Content</h3>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{post.viewCount}</div>
                <div className="text-sm text-gray-500">Views</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{post.likeCount}</div>
                <div className="text-sm text-gray-500">Likes</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{post.shareCount}</div>
                <div className="text-sm text-gray-500">Shares</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{post.commentCount}</div>
                <div className="text-sm text-gray-500">Comments</div>
              </div>
            </div>

            {/* SEO Information */}
            {(post.seoTitle || post.seoDescription) && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">SEO Information</h3>
                <div className="space-y-4">
                  {post.seoTitle && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SEO Title
                      </label>
                      <p className="text-gray-900">{post.seoTitle}</p>
                    </div>
                  )}
                  {post.seoDescription && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SEO Description
                      </label>
                      <p className="text-gray-900">{post.seoDescription}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Publish Information */}
            <div className="pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Created:</span> {formatDateSafe(post.createdAt, 'en')}
                </div>
                <div>
                  <span className="font-medium">Updated:</span> {formatDateSafe(post.updatedAt, 'en')}
                </div>
                {post.publishDate && (
                  <div>
                    <span className="font-medium">Published:</span> {formatDateSafe(post.publishDate, 'en')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}