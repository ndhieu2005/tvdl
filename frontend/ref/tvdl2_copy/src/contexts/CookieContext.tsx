'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface CookieContextType {
  hasConsent: boolean | null; // null = chưa quyết định, true = đồng ý, false = từ chối
  acceptCookies: () => void;
  rejectCookies: () => void;
  resetConsent: () => void;
  showBanner: boolean;
  isHydrated: boolean; // Track hydration state to prevent server/client mismatch
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

const COOKIE_CONSENT_KEY = 'viralpeek_cookie_consent';

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated first to prevent hydration mismatch
    setIsHydrated(true);
    
    // Kiểm tra consent đã có trong localStorage chưa
    if (typeof window !== 'undefined') {
      const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (savedConsent !== null) {
        const consent = savedConsent === 'true';
        setHasConsent(consent);
        setShowBanner(false);
      } else {
        // Chưa có consent, hiển thị banner sau 1 giây
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const acceptCookies = () => {
    setHasConsent(true);
    setShowBanner(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    }
  };

  const rejectCookies = () => {
    setHasConsent(false);
    setShowBanner(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'false');
    }
  };

  const resetConsent = () => {
    setHasConsent(null);
    setShowBanner(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
    }
  };

  const contextValue: CookieContextType = {
    hasConsent,
    acceptCookies,
    rejectCookies,
    resetConsent,
    showBanner,
    isHydrated,
  };

  return (
    <CookieContext.Provider value={contextValue}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieProvider');
  }
  return context;
}