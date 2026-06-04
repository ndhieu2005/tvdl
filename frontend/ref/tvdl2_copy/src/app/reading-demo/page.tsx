import React from 'react';
import SmartPostGrid from '@/components/SmartPostGrid';
import { ReadingHistoryTrigger } from '@/components/ReadingHistoryWidget';
import NoSSR from '@/components/NoSSR';

// Mock posts data for demo
const mockPosts = [
  {
    id: 'post1',
    slug: 'viral-tiktok-dance-2024',
    title: 'Top 10 Viral TikTok Dances Taking Over 2024',
    excerpt: 'From the latest dance challenges to trending moves, discover the TikTok dances that are dominating social media this year.',
    featuredImage: 'https://picsum.photos/400/300?random=1',
    category: 'TRENDING_NOW',
    publishDate: '2024-01-05T10:00:00Z',
    createdAt: '2024-01-05T10:00:00Z',
    viewCount: 15420,
    readingTime: 5,
    author: { name: 'Sarah Johnson' },
    tags: ['dance', 'viral', 'trending']
  },
  {
    id: 'post2',
    slug: 'celebrity-tiktok-moments',
    title: 'Celebrity TikTok Moments That Broke the Internet',
    excerpt: 'The most memorable celebrity TikTok moments that had everyone talking and sharing across social media platforms.',
    featuredImage: 'https://picsum.photos/400/300?random=2',
    category: 'CELEBRITIES',
    publishDate: '2024-01-04T14:30:00Z',
    createdAt: '2024-01-04T14:30:00Z',
    viewCount: 8750,
    readingTime: 4,
    author: { name: 'Mike Chen' },
    tags: ['celebrity', 'viral', 'entertainment']
  },
  {
    id: 'post3',
    slug: 'tiktok-music-trends-2024',
    title: 'TikTok Music Trends: Songs That Define 2024',
    excerpt: 'Explore the music tracks that became TikTok sensations and dominated the platform throughout the year.',
    featuredImage: 'https://picsum.photos/400/300?random=3',
    category: 'SOUNDS',
    publishDate: '2024-01-03T09:15:00Z',
    createdAt: '2024-01-03T09:15:00Z',
    viewCount: 12300,
    readingTime: 6,
    author: { name: 'Emma Wilson' },
    tags: ['music', 'trending', 'audio']
  },
  {
    id: 'post4',
    slug: 'tiktok-challenges-safety',
    title: 'TikTok Challenge Safety: What Parents Need to Know',
    excerpt: 'Important safety information about popular TikTok challenges and how to keep teens safe while participating.',
    featuredImage: 'https://picsum.photos/400/300?random=4',
    category: 'GUIDELINES',
    publishDate: '2024-01-02T16:45:00Z',
    createdAt: '2024-01-02T16:45:00Z',
    viewCount: 5680,
    readingTime: 8,
    author: { name: 'Dr. Lisa Park' },
    tags: ['safety', 'parents', 'guidelines']
  },
  {
    id: 'post5',
    slug: 'tiktok-filter-effects',
    title: 'Amazing TikTok Filter Effects You Need to Try',
    excerpt: 'Discover the coolest and most creative TikTok filters that will make your videos stand out from the crowd.',
    featuredImage: 'https://picsum.photos/400/300?random=5',
    category: 'FILTERS',
    publishDate: '2024-01-01T11:20:00Z',
    createdAt: '2024-01-01T11:20:00Z',
    viewCount: 9840,
    readingTime: 3,
    author: { name: 'Alex Rodriguez' },
    tags: ['filters', 'effects', 'creativity']
  },
  {
    id: 'post6',
    slug: 'social-media-influencer-tips',
    title: 'How to Become a Social Media Influencer in 2024',
    excerpt: 'Step-by-step guide to building your social media presence and becoming a successful influencer.',
    featuredImage: 'https://picsum.photos/400/300?random=6',
    category: 'SOCIAL_MEDIA',
    publishDate: '2023-12-31T08:00:00Z',
    createdAt: '2023-12-31T08:00:00Z',
    viewCount: 18750,
    readingTime: 7,
    author: { name: 'Jennifer Lee' },
    tags: ['influencer', 'marketing', 'tips']
  }
];

export default function ReadingDemoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📚 Smart Post Grid Demo
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          This page demonstrates the smart post grid with priority-based sorting based on your reading history.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click on any post to read it and track your reading progress</li>
            <li>• Posts you've completed will appear dimmed and marked as "Read"</li>
            <li>• Posts you've started but not finished will be marked as "Started"</li>
            <li>• The system prioritizes unread posts and your preferred categories</li>
            <li>• Your reading history is saved in browser localStorage</li>
          </ul>
        </div>
      </div>

      {/* Demo with Priority Disabled */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📝 Regular Post Grid (No Priority)
        </h2>
        <SmartPostGrid 
          initialPosts={mockPosts}
          limit={6}
          usePriority={false}
          showLoadMore={false}
        />
      </section>

      {/* Demo with Priority Enabled */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          🎯 Smart Post Grid (Priority-based)
        </h2>
        <NoSSR>
          <SmartPostGrid 
            initialPosts={mockPosts}
            limit={6}
            usePriority={true}
            showLoadMore={false}
          />
        </NoSSR>
      </section>

      {/* Instructions */}
      <section className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          🧪 Testing Instructions
        </h3>
        <ol className="text-sm text-gray-700 space-y-2">
          <li>1. Click on several posts above to simulate reading them</li>
          <li>2. Scroll down on post pages to simulate reading progress</li>
          <li>3. Return to this page to see how the priority sorting changes</li>
          <li>4. Use the reading history button (bottom left) to view your reading stats</li>
          <li>5. Clear history to reset and test different scenarios</li>
        </ol>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> In development mode, you'll see debug information showing reading statistics 
            and priority scores. This helps understand how the algorithm works.
          </p>
        </div>
      </section>
    </div>
  );
}