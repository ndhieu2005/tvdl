import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Check if we're on the client side
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

// Safe client-side only operation
export function safeClientOperation<T>(operation: () => T, fallback: T): T {
  if (isClient()) {
    try {
      return operation();
    } catch (error) {
      console.warn('Client operation failed:', error);
      return fallback;
    }
  }
  return fallback;
}

export function formatDate(input: string | number): string {
  try {
    const date = new Date(input);
    // Use consistent formatting to avoid hydration mismatch
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  } catch (error) {
    console.warn('Failed to format date:', error);
    return String(input);
  }
}

export function formatDateVi(input: string | number): string {
  try {
    const date = new Date(input);
    // Use consistent formatting to avoid hydration mismatch
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric", 
      year: "numeric",
      timeZone: "UTC"
    };
    return new Intl.DateTimeFormat("vi-VN", options).format(date);
  } catch (error) {
    console.warn('Failed to format date:', error);
    return String(input);
  }
}

// Alternative safer date formatting that avoids locale differences
export function formatDateSafe(input: string | number, locale: string = 'vi'): string {
  try {
    const date = new Date(input);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    
    if (locale === 'vi') {
      return `${day} tháng ${month}, ${year}`;
    } else {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${monthNames[month - 1]} ${day}, ${year}`;
    }
  } catch (error) {
    console.warn('Failed to format date safely:', error);
    return String(input);
  }
}