import { Metadata } from 'next';
import { generateCategoryMetadata } from '@/lib/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return await generateCategoryMetadata({
    category: 'Trending',
    categoryTitle: 'Trending Now',
    categoryDescription: `Discover what's trending right now on TikTok! Get the latest viral videos, trending sounds, viral challenges, and hot social media content that everyone is talking about.`,
    categoryKeywords: 'trending now, viral videos, hot trends, latest viral, trending TikTok, viral challenges, trending sounds, what\'s viral',
    path: '/trending-now'
  });
}

export default function TrendingNowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}