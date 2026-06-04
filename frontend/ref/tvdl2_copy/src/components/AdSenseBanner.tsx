'use client';

import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

interface AdSenseBannerProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
}

export function AdSenseBanner({ 
  slot, 
  format = 'auto', 
  style = {}, 
  className = '' 
}: AdSenseBannerProps) {
  const { settings } = useSettings();

  useEffect(() => {
    try {
      // Only push ad if AdSense is loaded and we have a valid AdSense ID
      if (settings?.googleAdsenseId && 
          settings.googleAdsenseId.startsWith('ca-pub-') && 
          typeof window !== 'undefined' && 
          (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [settings?.googleAdsenseId]);

  // Don't render if no valid AdSense ID
  if (!settings?.googleAdsenseId || 
      !settings.googleAdsenseId.startsWith('ca-pub-') || 
      settings.googleAdsenseId === 'ca-pub-XXXXXXXXXXXXXXXX') {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center ${className}`} style={style}>
        <p className="text-gray-500 text-sm">AdSense Placeholder</p>
        <p className="text-xs text-gray-400">Configure AdSense ID in settings</p>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={settings.googleAdsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Predefined AdSense Banner Components
export function AdSenseRectangle({ slot, className }: { slot: string; className?: string }) {
  return (
    <AdSenseBanner
      slot={slot}
      format="rectangle"
      style={{ width: '300px', height: '250px' }}
      className={`adsense-rectangle ${className || ''}`}
    />
  );
}

export function AdSenseSkyscraper({ slot, className }: { slot: string; className?: string }) {
  return (
    <AdSenseBanner
      slot={slot}
      format="vertical"
      style={{ width: '160px', height: '600px' }}
      className={`adsense-skyscraper ${className || ''}`}
    />
  );
}

export function AdSenseLeaderboard({ slot, className }: { slot: string; className?: string }) {
  return (
    <AdSenseBanner
      slot={slot}
      format="horizontal"
      style={{ width: '728px', height: '90px' }}
      className={`adsense-banner ${className || ''}`}
    />
  );
}

export function AdSenseResponsive({ slot, className }: { slot: string; className?: string }) {
  return (
    <AdSenseBanner
      slot={slot}
      format="auto"
      style={{ display: 'block' }}
      className={`adsense-responsive ${className || ''}`}
    />
  );
}