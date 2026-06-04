// Reading history management using localStorage

export interface ReadingRecord {
  postId: string;
  postSlug: string;
  title: string;
  timeSpent: number; // in seconds
  scrollDepth: number; // 0-1
  isCompleted: boolean;
  readAt: string; // ISO timestamp
  category: string;
}

const STORAGE_KEY = 'viralpeek_reading_history';
const MAX_HISTORY_ITEMS = 100; // Limit to prevent localStorage bloat

// Get all reading history from localStorage
export function getReadingHistory(): ReadingRecord[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const history: ReadingRecord[] = JSON.parse(stored);
    return history.sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime());
  } catch (error) {
    console.error('Error reading history from localStorage:', error);
    return [];
  }
}

// Add or update reading record
export function updateReadingRecord(record: Omit<ReadingRecord, 'readAt'>) {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getReadingHistory();
    const existingIndex = history.findIndex(r => r.postId === record.postId);
    
    const newRecord: ReadingRecord = {
      ...record,
      readAt: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      // Update existing record
      history[existingIndex] = newRecord;
    } else {
      // Add new record
      history.unshift(newRecord);
    }
    
    // Limit history size
    const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Error updating reading history:', error);
  }
}

// Check if post was read
export function isPostRead(postId: string): boolean {
  const history = getReadingHistory();
  const record = history.find(r => r.postId === postId);
  return record ? record.isCompleted : false;
}

// Check if post was started (partially read)
export function isPostStarted(postId: string): boolean {
  const history = getReadingHistory();
  const record = history.find(r => r.postId === postId);
  return record ? record.timeSpent > 30 || record.scrollDepth > 0.1 : false;
}

// Get reading record for specific post
export function getPostReadingRecord(postId: string): ReadingRecord | null {
  const history = getReadingHistory();
  return history.find(r => r.postId === postId) || null;
}

// Clear all reading history
export function clearReadingHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Clear old reading history (older than N days)
export function clearOldHistory(daysToKeep: number = 30) {
  if (typeof window === 'undefined') return;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const history = getReadingHistory();
  const filteredHistory = history.filter(record => 
    new Date(record.readAt) > cutoffDate
  );
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
}

// Get reading statistics
export function getReadingStats() {
  const history = getReadingHistory();
  const completedPosts = history.filter(r => r.isCompleted);
  const totalTimeSpent = history.reduce((sum, r) => sum + r.timeSpent, 0);
  
  // Category preferences
  const categoryStats: Record<string, number> = {};
  completedPosts.forEach(record => {
    categoryStats[record.category] = (categoryStats[record.category] || 0) + 1;
  });
  
  const preferredCategories = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)
    .map(([category]) => category);
  
  return {
    totalPosts: history.length,
    completedPosts: completedPosts.length,
    totalTimeSpent: Math.round(totalTimeSpent / 60), // in minutes
    preferredCategories,
    categoryStats
  };
}

// Calculate priority score for posts based on reading history
export function calculatePostPriority(post: any): number {
  const history = getReadingHistory();
  const stats = getReadingStats();
  
  let score = 0;
  
  // Base score from view count
  score += Math.log(post.viewCount || 1) * 5;
  
  // Recent posts bonus
  const daysSincePublished = post.publishDate ? 
    (Date.now() - new Date(post.publishDate).getTime()) / (1000 * 60 * 60 * 24) : 999;
  
  if (daysSincePublished <= 7) {
    score += (7 - daysSincePublished) * 3;
  }
  
  // Category preference bonus
  const categoryIndex = stats.preferredCategories.indexOf(post.category);
  if (categoryIndex >= 0) {
    score += (5 - categoryIndex) * 2; // Higher bonus for preferred categories
  }
  
  // Check reading history for this post
  const readingRecord = history.find(r => r.postId === post.id);
  if (readingRecord) {
    if (readingRecord.isCompleted) {
      score *= 0.1; // Dramatically reduce priority for completed posts
    } else if (readingRecord.scrollDepth > 0.5) {
      score *= 0.3; // Reduce priority for partially read posts
    } else if (readingRecord.timeSpent > 30) {
      score *= 0.6; // Slight penalty for posts user started but didn't engage much
    }
  }
  
  return Math.max(0, score);
}

// Sort posts by priority
export function sortPostsByPriority(posts: any[]): any[] {
  return posts
    .map(post => ({
      ...post,
      priorityScore: calculatePostPriority(post),
      isRead: isPostRead(post.id),
      isStarted: isPostStarted(post.id)
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}