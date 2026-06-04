'use client';

import React, { useState } from 'react';
import { Bug, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';
import { useCookieConsent } from '@/contexts/CookieContext';
import { useCookieUtils } from '@/hooks/useCookieUtils';

export default function CookieTestWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { hasConsent, acceptCookies, rejectCookies, resetConsent } = useCookieConsent();
  const {
    canUseAnalytics,
    canShowAds,
    canUsePersonalization,
    canShowFullContent,
    canUseSocialFeatures,
    getConsentStatus
  } = useCookieUtils();

  // Only show in development or staging
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const status = getConsentStatus();

  const getStatusIcon = (canUse: boolean) => {
    return canUse ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getConsentIcon = () => {
    if (status.isPending) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    if (status.isAccepted) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status.isRejected) return <XCircle className="h-5 w-5 text-red-500" />;
    return <AlertCircle className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg transition-colors"
        title="Cookie Test Widget"
      >
        <Bug className="h-5 w-5" />
      </button>

      {/* Widget Panel */}
      {isOpen && (
        <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              {getConsentIcon()}
              <span className="ml-2">Cookie Test Widget</span>
            </h3>
            <p className="text-xs text-gray-600">
              Development tool to test cookie functionality
            </p>
          </div>

          {/* Current Status */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Current Status</h4>
            <div className="space-y-1 text-xs">
              <div>Consent: <span className="font-mono">{JSON.stringify(hasConsent)}</span></div>
              <div>Is Decided: <span className="font-mono">{status.isDecided.toString()}</span></div>
              <div>Is Accepted: <span className="font-mono">{status.isAccepted.toString()}</span></div>
              <div>Is Rejected: <span className="font-mono">{status.isRejected.toString()}</span></div>
            </div>
          </div>

          {/* Feature Tests */}
          <div className="mb-4">
            <h4 className="font-medium text-sm mb-2">Feature Availability</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Analytics</span>
                {getStatusIcon(canUseAnalytics())}
              </div>
              <div className="flex items-center justify-between">
                <span>Ads</span>
                {getStatusIcon(canShowAds())}
              </div>
              <div className="flex items-center justify-between">
                <span>Personalization</span>
                {getStatusIcon(canUsePersonalization())}
              </div>
              <div className="flex items-center justify-between">
                <span>Full Content</span>
                {getStatusIcon(canShowFullContent())}
              </div>
              <div className="flex items-center justify-between">
                <span>Social Features</span>
                {getStatusIcon(canUseSocialFeatures())}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="space-y-2">
            <button
              onClick={acceptCookies}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded transition-colors"
            >
              Accept Cookies
            </button>
            <button
              onClick={rejectCookies}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded transition-colors"
            >
              Reject Cookies
            </button>
            <button
              onClick={resetConsent}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Reset Consent
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}