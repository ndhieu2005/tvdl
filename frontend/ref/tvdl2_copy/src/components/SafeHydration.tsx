'use client';

import { ReactNode, useEffect, useState } from 'react';

interface SafeHydrationProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * SafeHydration component that prevents hydration mismatches
 * by delaying rendering until after hydration is complete
 */
export default function SafeHydration({ children, fallback = null }: SafeHydrationProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated ? <>{children}</> : <>{fallback}</>;
}