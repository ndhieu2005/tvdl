'use client';

import { useEffect, useRef, useState } from 'react';
import { updateReadingRecord, getPostReadingRecord } from '@/lib/reading-history';

interface ReadingTrackerProps {
  postId: string;
  postSlug: string;
  title: string;
  category: string;
  contentSelector?: string; // CSS selector for content element
  estimatedReadingTime?: number; // in minutes
  onReadingProgress?: (progress: {
    timeSpent: number;
    scrollDepth: number;
    isCompleted: boolean;
  }) => void;
}

export default function ReadingTracker({
  postId,
  postSlug,
  title,
  category,
  contentSelector = '.post-content',
  estimatedReadingTime = 3,
  onReadingProgress
}: ReadingTrackerProps) {
  const [startTime, setStartTime] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [scrollDepth, setScrollDepth] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Initialize from existing reading record
  useEffect(() => {
    const existingRecord = getPostReadingRecord(postId);
    if (existingRecord) {
      setTimeSpent(existingRecord.timeSpent);
      setScrollDepth(existingRecord.scrollDepth);
      setIsCompleted(existingRecord.isCompleted);
    }
    setStartTime(Date.now());
  }, [postId]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const contentElement = document.querySelector(contentSelector);
      if (!contentElement) return;

      const contentRect = contentElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Calculate scroll depth based on content element
      const contentTop = contentRect.top + scrollTop;
      const contentHeight = contentRect.height;
      const scrolledIntoContent = Math.max(0, scrollTop - contentTop);
      const depth = Math.min(1, Math.max(0, scrolledIntoContent / contentHeight));

      setScrollDepth(depth);

      // Mark as completed if scrolled > 80% or spent enough time
      if (depth > 0.8 || timeSpent >= estimatedReadingTime * 60) {
        setIsCompleted(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [contentSelector, timeSpent, estimatedReadingTime]);

  // Track visibility (pause timer when tab is not active)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Update time spent
  useEffect(() => {
    if (isVisible && postId) {
      intervalRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible, postId]);

  // Update localStorage with reading progress
  useEffect(() => {
    if (!postId || timeSpent === 0) return;

    const shouldUpdate = 
      timeSpent % 10 === 0 || // Every 10 seconds
      isCompleted || 
      scrollDepth > lastUpdateRef.current + 0.1; // Every 10% scroll

    if (shouldUpdate) {
      const progress = {
        timeSpent,
        scrollDepth,
        isCompleted
      };

      // Update localStorage
      updateReadingRecord({
        postId,
        postSlug,
        title,
        category,
        timeSpent,
        scrollDepth,
        isCompleted
      });

      // Call callback if provided
      if (onReadingProgress) {
        onReadingProgress(progress);
      }

      lastUpdateRef.current = scrollDepth;
    }
  }, [timeSpent, scrollDepth, isCompleted, postId, postSlug, title, category, onReadingProgress]);

  // Save final progress when component unmounts
  useEffect(() => {
    return () => {
      if (postId && timeSpent > 0) {
        updateReadingRecord({
          postId,
          postSlug,
          title,
          category,
          timeSpent,
          scrollDepth,
          isCompleted
        });
      }
    };
  }, [postId, postSlug, title, category, timeSpent, scrollDepth, isCompleted]);

  // This component doesn't render anything visible
  return null;
}