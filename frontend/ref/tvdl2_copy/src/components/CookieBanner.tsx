'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cookie, X, Check, AlertTriangle } from 'lucide-react';
import { useCookieConsent } from '@/contexts/CookieContext';
import { Button } from '@/components/ui/button';

export default function CookieBanner() {
  const { showBanner, acceptCookies, rejectCookies, isHydrated } = useCookieConsent();
  const pathname = usePathname();

  // Don't render anything until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return null;
  }

  // Don't show banner on cookie policy page
  if (!showBanner || pathname === '/cookie-policy') {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Icon and Content */}
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 mt-1">
                <Cookie className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  We Use Cookies
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  This website uses cookies to improve your experience, analyze website traffic, 
                  and provide personalized content. By continuing to use our website, 
                  you consent to our use of cookies.
                </p>
                <Link 
                  href="/cookie-policy" 
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium underline mt-1 inline-block"
                >
                  Learn more about our cookie policy
                </Link>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={rejectCookies}
                variant="outline"
                size="sm"
                className="text-gray-600 border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={acceptCookies}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Component to display message when user rejects cookies
export function CookieRejectedMessage() {
  const { resetConsent, isHydrated } = useCookieConsent();

  // Don't render anything until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-amber-800 mb-4">
          Content Restricted
        </h2>
        <p className="text-amber-700 mb-6 leading-relaxed">
          To view the full content of this article, you need to accept our use of cookies. 
          Cookies help us provide the best experience and content tailored to you.
        </p>
        <div className="space-y-4">
          <Button
            onClick={resetConsent}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Cookie className="h-5 w-5 mr-2" />
            Review Cookie Options
          </Button>
          <div className="text-sm text-amber-600">
            <Link 
              href="/cookie-policy" 
              className="hover:text-amber-800 underline font-medium"
            >
              Learn more about our cookie policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}