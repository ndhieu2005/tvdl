'use client';

import React, { useState, useEffect } from 'react';
import { useCookieConsent } from '@/contexts/CookieContext';

export default function CookieStatusIndicator() {
  const { hasConsent, resetConsent, isHydrated } = useCookieConsent();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  // Don't render anything until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return null;
  }

  // Auto-hide after 5 seconds to reduce visual clutter
  useEffect(() => {
    if (hasConsent === true) {
      const fadeTimer = setTimeout(() => {
        setIsVisible(false);
      }, 4000); // Start fading after 4 seconds
      
      const removeTimer = setTimeout(() => {
        setShouldRender(false);
      }, 5000); // Remove from DOM after 5 seconds
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [hasConsent]);

  // Only show if user has accepted cookies (reduce visual clutter)
  if (hasConsent !== true || !shouldRender) {
    return null;
  }

  // Since we only render when hasConsent === true, we can use static values

  return (
    <div className={`fixed bottom-2 right-2 z-30 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Optimized Cookie Status - Minimal, transparent, italic text */}
      <div className="bg-transparent">
        <div 
          className="cursor-pointer group"
          onClick={() => {
            setIsExpanded(!isExpanded);
            // Show again if clicked
            setIsVisible(true);
            setShouldRender(true);
          }}
        >
          <span className="text-xs italic font-medium text-green-700/80 hover:text-green-700 transition-colors duration-200 select-none">
            Cookies Accepted
          </span>
        </div>
        
        {isExpanded && (
          <div className="absolute bottom-full right-0 mb-2 p-3 rounded-lg backdrop-blur-sm border bg-green-50/90 border-green-200/70 text-green-800 shadow-lg min-w-[280px]">
            <p className="text-xs mb-2">
              You have accepted our cookie policy. Analytics and personalization features are enabled.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetConsent();
                setIsExpanded(false);
              }}
              className="text-xs underline hover:no-underline opacity-75 hover:opacity-100 transition-opacity"
            >
              Change Cookie Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}