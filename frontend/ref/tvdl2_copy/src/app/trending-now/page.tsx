"use client";

import React, { useState, useEffect } from 'react';
import PostCard from '@/components/PostCard';
import { TrendingUp, Flame, Loader2 } from 'lucide-react';
import { SITE_CONTENT } from '@/lib/constants';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage?: string;
  publishDate?: string;
  publishedAt?: string;
  createdAt: string;
  category: string;
  tags: string[];
  author: {
    name: string;
  };
}

// Fallback mock posts if API fails
const mockTrendingPosts = [
  {
    slug: 'football-viral-celebration-2024',
    title: 'Viral Football Celebration Taking Over TikTok',
    excerpt: 'A new football celebration from the latest match has gone viral, with millions recreating the iconic move on TikTok.',
    featuredImage: 'https://picsum.photos/seed/sport27/400/300',
    publishedAt: '2024-01-15T10:00:00Z',
    category: 'Sport',
    readingTime: 3,
    tags: ['football', 'viral', 'celebration']
  },
  {
    slug: 'basketball-trick-shots-trending',
    title: 'Basketball Trick Shots Are Taking Over Social Media',
    excerpt: 'These incredible basketball trick shots are inspiring athletes and fans alike to get creative with their shots.',
    featuredImage: 'https://picsum.photos/seed/sport28/400/300',
    publishedAt: '2024-01-14T18:45:00Z',
    category: 'Sport',
    readingTime: 4,
    tags: ['basketball', 'tricks', 'sports']
  },
  {
    slug: 'tennis-serve-challenge',
    title: 'Tennis Serve Challenge Goes Viral on TikTok',
    excerpt: 'Professional tennis players are participating in this viral serve challenge, showcasing incredible accuracy and power.',
    featuredImage: 'https://picsum.photos/seed/sport29/400/300',
    publishedAt: '2024-01-13T22:30:00Z',
    category: 'Sport',
    readingTime: 2,
    tags: ['tennis', 'challenge', 'viral']
  },
  {
    slug: 'swimming-training-tips',
    title: 'Swimming Training Tips That Are Trending',
    excerpt: 'Olympic swimmers share their training secrets in these viral TikTok videos that are helping everyone improve.',
    featuredImage: 'https://picsum.photos/seed/sport30/400/300',
    publishedAt: '2024-01-12T16:20:00Z',
    category: 'Sport',
    readingTime: 3,
    tags: ['swimming', 'training', 'tips']
  },
  {
    slug: 'running-form-viral',
    title: 'Running Form Video Goes Viral for Right Reasons',
    excerpt: 'A running coach\'s video about proper running form has gone viral, helping thousands improve their technique.',
    featuredImage: 'https://picsum.photos/seed/sport31/400/300',
    publishedAt: '2024-01-11T14:15:00Z',
    category: 'Sport',
    readingTime: 5,
    tags: ['running', 'form', 'technique']
  },
  {
    slug: 'gym-workout-trends',
    title: 'New Gym Workout Trends Taking Over TikTok',
    excerpt: 'These innovative gym workouts are helping people achieve their fitness goals and are trending across social media.',
    featuredImage: 'https://picsum.photos/seed/sport32/400/300',
    publishedAt: '2024-01-10T11:30:00Z',
    category: 'Sport',
    readingTime: 4,
    tags: ['gym', 'workout', 'fitness']
  }
];

export default function TrendingNowPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching trending posts...');
      
      // Fetch posts with TRENDING_NOW category (includes published and scheduled posts that should be published)
      const response = await fetch('/api/posts/public?category=TRENDING_NOW&limit=10', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Response data:', data);
        
        if (data.success && data.data) {
          setPosts(data.data);
        } else {
          console.log('🔍 No posts found, using mock data');
          setPosts(mockTrendingPosts as any);
        }
      } else {
        console.log('🔍 Response not ok, using mock data');
        setPosts(mockTrendingPosts as any);
      }
    } catch (error) {
      console.error('🔍 Error fetching posts:', error);
      setError('Failed to load posts');
      setPosts(mockTrendingPosts as any);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading trending posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-red-500 p-2 rounded-full">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
         
          <Flame className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-lg text-gray-600">
          Discover what&apos;s hot and viral on TikTok right now
        </p>
        {/* Debug info */}
        <div className="mt-2 text-sm text-gray-500">
          Found {posts.length} posts
          {error && <span className="text-red-500 ml-2">({error})</span>}
        </div>
      </div>

      {/* AdSense Banner */}
      <section className="mb-8">
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm">AdSense Banner Placeholder</p>
          <p className="text-gray-400 text-xs mt-1">728x90 Banner Ad</p>
        </div>
      </section>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Featured Trending Post */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Flame className="h-6 w-6 text-red-500 mr-2" />
              Hottest Right Now
            </h2>
            {posts.length > 0 ? (
              <PostCard post={posts[0]} variant="featured" />
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-500">No trending posts available</p>
              </div>
            )}
          </section>

          {/* All Trending Posts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Trending Content</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {posts.length > 1 ? (
                posts.slice(1).map((post) => (
                  <PostCard key={post.slug || post.id} post={post} />
                ))
              ) : (
                <div className="col-span-2 bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No additional trending posts available</p>
                </div>
              )}
            </div>
          </section>

          {/* Load More Button */}
          <div className="text-center mt-8">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
              Load More Trending Posts
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Trending Categories */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Trending Categories</h3>
              <div className="space-y-2">
                {['Dance', 'Comedy', 'Food', 'Fashion', 'Education'].map((category) => (
                  <a
                    key={category}
                    href={`#${category.toLowerCase()}`}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    #{category}
                  </a>
                ))}
              </div>
            </section>

            {/* AdSense Sidebar */}
            <section>
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">AdSense Sidebar</p>
                <p className="text-gray-400 text-xs mt-1">300x600 Skyscraper</p>
              </div>
            </section>

            {/* Quick Stats */}
            <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Trending Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Videos Today</span>
                  <span className="text-sm font-medium">2.4M+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Top Hashtag</span>
                  <span className="text-sm font-medium">#viral2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Most Active</span>
                  <span className="text-sm font-medium">Gen Z</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}