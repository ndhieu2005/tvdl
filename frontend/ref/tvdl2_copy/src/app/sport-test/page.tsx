"use client";

import React from 'react';
import { Trophy, Goal, Target, Dumbbell } from 'lucide-react';

// Simple test mock data
const testPosts = [
  {
    id: 'test-1',
    slug: 'football-test',
    title: 'Football Test Post',
    excerpt: 'This is a test football post to check if the page works.',
    featuredImage: 'https://picsum.photos/seed/football/400/300',
    category: 'Sport',
    tags: ['football', 'test'],
    publishedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'test-2', 
    slug: 'basketball-test',
    title: 'Basketball Test Post',
    excerpt: 'This is a test basketball post to check if the page works.',
    featuredImage: 'https://picsum.photos/seed/basketball/400/300',
    category: 'Sport',
    tags: ['basketball', 'test'],
    publishedAt: '2024-01-14T10:00:00Z'
  },
  {
    id: 'test-3',
    slug: 'fitness-test', 
    title: 'Fitness Test Post',
    excerpt: 'This is a test fitness post to check if the page works.',
    featuredImage: 'https://picsum.photos/seed/fitness/400/300',
    category: 'Sport',
    tags: ['fitness', 'test'],
    publishedAt: '2024-01-13T10:00:00Z'
  }
];

export default function SportTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold">
                Sport Test
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Testing sport posts display
            </p>
            <div className="mt-4 text-white/80">
              {testPosts.length} posts available
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Post */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Trophy className="h-6 w-6 mr-2" />
                Featured Sport Content
              </h2>
            </div>
            <div className="p-6">
              {testPosts.length > 0 && (
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <img 
                      src={testPosts[0].featuredImage} 
                      alt={testPosts[0].title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <div className="flex items-center mb-2">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs mr-2">
                        {testPosts[0].category}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(testPosts[0].publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {testPosts[0].title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {testPosts[0].excerpt}
                    </p>
                    <div className="flex gap-2">
                      {testPosts[0].tags.map((tag) => (
                        <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* All Posts */}
        <section>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">All Sport Content</h2>
              <p className="text-gray-600 mt-1">{testPosts.length} posts found</p>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testPosts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs mr-2">
                          {post.category}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {post.tags.map((tag) => (
                          <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Status */}
        <div className="mt-8 bg-green-100 border border-green-400 rounded-lg p-4">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">✅ Sport page is working! You can see {testPosts.length} test posts above.</p>
          </div>
        </div>
      </div>
    </div>
  );
}