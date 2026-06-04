import Script from 'next/script';
import { usePublicSettings } from '@/hooks/usePublicSettings';

// Static Google Analytics component that always renders
export function GoogleAnalytics({ gaId }: { gaId?: string }) {
  // Use provided GA ID or default
  const analyticsId = gaId || 'G-KFD6SWYG83';
  
  // Don't render if invalid GA ID
  if (!analyticsId || analyticsId === 'GA_MEASUREMENT_ID' || !analyticsId.startsWith('G-')) {
    return null;
  }

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${analyticsId}');
        `}
      </Script>
    </>
  );
}

// Dynamic component that fetches settings on client-side
export function DynamicGoogleAnalytics() {
  return <GoogleAnalytics />;
}

// Hook for tracking events
export function useGoogleAnalytics() {
  const { settings } = usePublicSettings();
  const gaId = settings?.googleAnalyticsId;

  const trackEvent = (eventName: string, parameters?: any) => {
    if (typeof window !== 'undefined' && window.gtag && gaId && gaId.startsWith('G-')) {
      window.gtag('event', eventName, parameters);
    }
  };

  const trackPageView = (url: string) => {
    if (typeof window !== 'undefined' && window.gtag && gaId && gaId.startsWith('G-')) {
      window.gtag('config', gaId, {
        page_path: url,
      });
    }
  };

  return {
    trackEvent,
    trackPageView,
    isEnabled: !!(gaId && gaId.startsWith('G-')),
  };
}