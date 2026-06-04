'use client';

import { useSettingsContext } from '@/contexts/SettingsContext';

export default function DynamicHomeTitle() {
  const { homePageTitle, homePageSubtitle, loading } = useSettingsContext();

  // Only show loading if we truly don't have content (not even default)
  if (loading && (!homePageTitle || homePageTitle === 'ViralPeek')) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        {homePageTitle}
      </h1>
      <h2 className="text-2xl text-gray-600 mb-8">
        {homePageSubtitle}
      </h2>
    </>
  );
}