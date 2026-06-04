'use client';

import React from 'react';
import { AlertTriangle, Shield } from 'lucide-react';
import { useCookieUtils } from '@/hooks/useCookieUtils';
import { useCookieConsent } from '@/contexts/CookieContext';

interface ConditionalAdBlockProps {
  children: React.ReactNode;
  adSlot?: string;
  format?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function ConditionalAdBlock({ 
  children, 
  adSlot, 
  format = 'auto',
  width,
  height,
  className = ''
}: ConditionalAdBlockProps) {
  const { canShowAds, getConsentStatus } = useCookieUtils();
  const { resetConsent } = useCookieConsent();
  const status = getConsentStatus();

  // If consent is pending (null), show placeholder
  if (status.isPending) {
    return (
      <div className={`bg-gray-100 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <Shield className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">
          Advertisement Space
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Ads will be personalized based on your cookie preferences
        </p>
      </div>
    );
  }

  // If user rejected cookies, show consent request
  if (status.isRejected) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-6 text-center ${className}`}>
        <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-3" />
        <p className="text-amber-800 text-sm font-medium mb-2">
          Personalized Ads Unavailable
        </p>
        <p className="text-amber-700 text-xs mb-3">
          We respect your privacy choice. You can enable personalized ads by accepting cookies.
        </p>
        <button
          onClick={resetConsent}
          className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded transition-colors"
        >
          Review Cookie Settings
        </button>
      </div>
    );
  }

  // If user accepted cookies, show the ad
  if (status.isAccepted) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  return null;
}

// Pre-built AdSense block component
export function AdSenseBlock({ 
  adSlot, 
  format = 'auto', 
  width, 
  height, 
  className = '' 
}: {
  adSlot: string;
  format?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <ConditionalAdBlock 
      adSlot={adSlot} 
      format={format} 
      width={width} 
      height={height} 
      className={className}
    >
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block',
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : 'auto'
        }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </ConditionalAdBlock>
  );
}