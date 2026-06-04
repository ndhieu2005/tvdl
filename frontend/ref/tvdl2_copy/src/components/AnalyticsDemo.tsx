'use client';

import { 
  trackPostView, 
  trackVideoPlay, 
  trackSocialShare, 
  trackSearch,
  trackCategoryView,
  trackTimeOnPage,
  trackScrollDepth
} from '@/lib/analytics';

const AnalyticsDemo: React.FC = () => {
  const handlePostView = () => {
    trackPostView('post-123', 'Sample TikTok Trend Post', 'trending');
  };

  const handleVideoPlay = () => {
    trackVideoPlay('video-456', 'Viral TikTok Dance');
  };

  const handleSocialShare = (platform: string) => {
    trackSocialShare(platform, 'post-123');
  };

  const handleSearch = () => {
    trackSearch('tiktok trending dance');
  };

  const handleCategoryView = () => {
    trackCategoryView('trending-now');
  };

  const handleTimeOnPage = () => {
    trackTimeOnPage(120); // 2 minutes
  };

  const handleScrollDepth = () => {
    trackScrollDepth(50); // 50% scroll depth
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Analytics Demo</h3>
      <div className="space-y-2">
        <button 
          onClick={handlePostView}
          className="block w-full text-left px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Track Post View
        </button>
        
        <button 
          onClick={handleVideoPlay}
          className="block w-full text-left px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Track Video Play
        </button>
        
        <button 
          onClick={() => handleSocialShare('facebook')}
          className="block w-full text-left px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Track Facebook Share
        </button>
        
        <button 
          onClick={handleSearch}
          className="block w-full text-left px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Track Search
        </button>
        
        <button 
          onClick={handleCategoryView}
          className="block w-full text-left px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Track Category View
        </button>
        
        <button 
          onClick={handleTimeOnPage}
          className="block w-full text-left px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Track Time on Page
        </button>
        
        <button 
          onClick={handleScrollDepth}
          className="block w-full text-left px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
        >
          Track Scroll Depth
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDemo;