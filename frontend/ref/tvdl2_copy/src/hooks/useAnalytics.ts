'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { pageview } from '@/lib/analytics';

export const useAnalytics = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view when pathname changes
    if (pathname) {
      pageview(window.location.origin + pathname);
    }
  }, [pathname]);
};

export default useAnalytics;