// Google Analytics utility functions
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_location: url,
      page_title: document.title,
    });
  }
};

// Track custom events
export const event = (
  action: string,
  {
    event_category,
    event_label,
    value,
    ...otherParams
  }: {
    event_category?: string;
    event_label?: string;
    value?: number;
    [key: string]: any;
  } = {}
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category,
      event_label,
      value,
      ...otherParams,
    });
  }
};

// Track specific events for ViralPeek
export const trackPostView = (postId: string, postTitle: string, category: string) => {
  event('post_view', {
    event_category: 'engagement',
    event_label: postTitle,
    post_id: postId,
    content_type: category,
  });
};

export const trackVideoPlay = (videoId: string, videoTitle: string) => {
  event('video_play', {
    event_category: 'media',
    event_label: videoTitle,
    video_id: videoId,
  });
};

export const trackSocialShare = (platform: string, postId: string) => {
  event('share', {
    event_category: 'social',
    event_label: platform,
    post_id: postId,
  });
};

export const trackSearch = (searchTerm: string) => {
  event('search', {
    event_category: 'search',
    event_label: searchTerm,
  });
};

export const trackCategoryView = (category: string) => {
  event('category_view', {
    event_category: 'navigation',
    event_label: category,
  });
};

// Track user engagement
export const trackTimeOnPage = (duration: number) => {
  event('time_on_page', {
    event_category: 'engagement',
    value: Math.round(duration),
  });
};

export const trackScrollDepth = (percentage: number) => {
  event('scroll_depth', {
    event_category: 'engagement',
    value: percentage,
  });
};