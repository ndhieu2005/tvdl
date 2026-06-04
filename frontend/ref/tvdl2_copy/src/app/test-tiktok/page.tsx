import React from 'react';
import TikTokTestPage from '@/components/TikTokTestPage';

export default function TestTikTokPage() {
  return <TikTokTestPage />;
}

export const metadata = {
  title: 'TikTok Embed Test - ViralPeek',
  description: 'Test TikTok embed functionality',
  robots: 'noindex, nofollow', // Prevent indexing of test page
};