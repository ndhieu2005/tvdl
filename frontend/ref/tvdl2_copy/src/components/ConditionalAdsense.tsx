'use client';

import { useEffect } from 'react';
import { useCookieUtils } from '@/hooks/useCookieUtils';

interface ConditionalAdsenseProps {
  adsenseId?: string | null;
}

export default function ConditionalAdsense({ adsenseId }: ConditionalAdsenseProps) {
  const { canShowAds, isHydrated, hasConsent } = useCookieUtils();

  useEffect(() => {
    // Only load AdSense if hydrated and user has consented to cookies
    if (!isHydrated || !canShowAds() || !adsenseId || adsenseId === 'ca-pub-XXXXXXXXXXXXXXXX' || !adsenseId.startsWith('ca-pub-')) {
      return;
    }

    // Check if AdSense is already loaded
    if (document.querySelector('script[src*="googlesyndication.com"]')) {
      return;
    }

    // Load AdSense script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      // Initialize AdSense
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({
        google_ad_client: adsenseId,
        enable_page_level_ads: true
      });
      console.log('Google AdSense loaded successfully');
    };
    
    script.onerror = () => {
      console.error('Failed to load Google AdSense');
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Remove script when component unmounts or consent changes
      const existingScript = document.querySelector('script[src*="googlesyndication.com"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [isHydrated, hasConsent, adsenseId]);

  return null;
}