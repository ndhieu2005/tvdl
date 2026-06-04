'use client';

import { useEffect } from 'react';
import { useCookieConsent } from '@/contexts/CookieContext';

const Analytics: React.FC = () => {
  const { hasConsent, isHydrated } = useCookieConsent();

  useEffect(() => {
    // Only run if hydrated and user has consented to cookies
    if (!isHydrated || hasConsent !== true) {
      return;
    }

    // Only run on client-side and if GA ID is available
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      
      // Initialize dataLayer
      (window as any).dataLayer = (window as any).dataLayer || [];
      
      // Define gtag function
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      
      // Assign gtag to window for global access
      (window as any).gtag = gtag;
      
      // Initialize Google Analytics
      gtag('js', new Date());
      gtag('config', gaId, {
        page_title: document.title,
        page_location: window.location.href,
        // Optional: Enhanced ecommerce and user engagement tracking
        custom_map: {
          'dimension1': 'page_category',
          'dimension2': 'content_type'
        }
      });

      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      
      // Handle script loading
      script.onload = () => {
        console.log('Google Analytics loaded successfully');
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Analytics');
      };
      
      document.head.appendChild(script);

      // Track page view for SPA navigation
      const handleRouteChange = () => {
        gtag('config', gaId, {
          page_title: document.title,
          page_location: window.location.href,
        });
      };

      // Listen for route changes (for Next.js App Router)
      window.addEventListener('popstate', handleRouteChange);

      // Cleanup
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, [hasConsent, isHydrated]);

  return null;
};

export default Analytics;