'use client';

import { useState, useEffect } from 'react';

export const useIsMobile = (breakpoint: number = 640) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Initial check
    checkIsMobile();
    setIsHydrated(true);

    // Add event listener
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [breakpoint]);

  return { isMobile: isHydrated ? isMobile : false, isHydrated };
};