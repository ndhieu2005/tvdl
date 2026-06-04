"use client";

import React from 'react';
import PostCard from '@/components/PostCard';
import { Filter, Sparkles, Eye } from 'lucide-react';
import { SITE_CONTENT } from '@/lib/constants';

const filterPosts = [
  {
    slug: 'ai-filter-revolution-2024',
    title: 'AI-Powered Filters Are Changing TikTok Forever',
    excerpt: 'The latest AI filters are creating mind-blowing content. Here\'s everything you need to know about this game-changing technology.',
    featuredImage: 'https://picsum.photos/seed/media10/400/300',
    publishedAt: '2024-01-15T10:00:00Z',
    category: 'Filters',
    readingTime: 4,
    tags: ['AI', 'filters', 'technology']
  },
  {
    slug: 'beauty-filter-trends',
    title: 'Top Beauty Filters Everyone\'s Using Right Now',
    excerpt: 'From subtle glow-ups to dramatic transformations, these beauty filters are dominating TikTok feeds worldwide.',
    featuredImage: 'https://picsum.photos/seed/viral11/400/300',
    publishedAt: '2024-01-14T15:30:00Z',
    category: 'Filters',
    readingTime: 3,
    tags: ['beauty', 'filters', 'trending']
  },
  {
    slug: 'creative-ar-filters',
    title: 'Creative AR Filters That Push the Boundaries',
    excerpt: 'Artists and developers are creating mind-bending AR experiences. These filters will change how you see reality.',
    featuredImage: 'https://picsum.photos/seed/trend12/400/300',
    publishedAt: '2024-01-13T12:15:00Z',
    category: 'Filters',
    readingTime: 5,
    tags: ['AR', 'creative', 'innovation']
  }
];

export default function FiltersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-green-500 p-2 rounded-full">
            <Filter className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
Filters
          </h1>
          <Sparkles className="h-6 w-6 text-green-500" />
        </div>
        <p className="text-lg text-gray-600">
          Discover the most amazing filters and AR effects on TikTok
        </p>
      </div>

      {/* Featured Filter Section */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Sparkles className="h-6 w-6 mr-2" />
                Filter of the Week
              </h2>
              <p className="text-green-100 mb-4">
                "AI Beauty Pro" - The filter that's breaking beauty standards
              </p>
              <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Try Filter</span>
              </button>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">3.2M</div>
              <div className="text-green-100 text-sm">Uses This Week</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <PostCard post={filterPosts[0]} variant="featured" />
          
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {filterPosts.slice(1).map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2 text-green-500" />
                Popular Filter Categories
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Beauty Enhancement', count: '2.1M' },
                  { name: 'AR Effects', count: '1.8M' },
                  { name: 'Face Distortion', count: '1.5M' },
                  { name: 'Background Change', count: '1.2M' },
                  { name: 'Color Grading', count: '900K' }
                ].map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{category.count}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-green-500" />
                Filter Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">New Filters Today</span>
                  <span className="text-sm font-medium">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Most Popular Type</span>
                  <span className="text-sm font-medium">Beauty</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Uses</span>
                  <span className="text-sm font-medium">2.8B</span>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">AdSense Sidebar</p>
                <p className="text-gray-400 text-xs mt-1">300x600 Skyscraper</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}