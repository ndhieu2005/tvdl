'use client';

import { useState, useEffect } from 'react';
import { formatDateSafe } from '@/lib/utils';

/**
 * Hook to safely format dates and prevent hydration mismatches
 * Returns the formatted date after hydration is complete
 */
export function useSafeDate(dateInput: string | number, locale: string = 'vi') {
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Only format date after hydration is complete
    setIsHydrated(true);
    const formatted = formatDateSafe(dateInput, locale);
    setFormattedDate(formatted);
  }, [dateInput, locale]);

  return {
    formattedDate: isHydrated ? formattedDate : '',
    isHydrated
  };
}