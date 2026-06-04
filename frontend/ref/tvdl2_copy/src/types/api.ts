// API Types for Posts
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
export type PostCategory = 'TRENDING_NOW' | 'SOUNDS' | 'CHALLENGES' | 'CELEBRITIES' | 'TOP_LISTS' | 'FILTERS' | 'SOCIAL_MEDIA' | 'GUIDELINES';

// Frontend format (kebab-case)
export type FrontendCategory = 'trending-now' | 'sounds' | 'challenges' | 'celebrities' | 'top-lists' | 'filters' | 'social-media' | 'guidelines';
export type FrontendStatus = 'draft' | 'published' | 'scheduled';

// Post input từ frontend
export interface PostInput {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  category?: FrontendCategory;
  status?: FrontendStatus;
  tags?: string[];
  featuredImage?: string;
  publishDate?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  // Video fields
  videoUrl?: string;
  videoThumbnail?: string;
  videoPlatform?: string;
  videoTitle?: string;
  videoDescription?: string;
  videoMetadata?: any;
}

// Post data trong database
export interface PostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  category: PostCategory;
  status: PostStatus;
  tags: string[];
  authorId: string;
  createdBy: string;
  publishDate?: Date;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  // Video fields
  videoUrl?: string;
  videoThumbnail?: string;
  videoPlatform?: string;
  videoTitle?: string;
  videoDescription?: string;
  videoMetadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Paginated response
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

// Video update input
export interface VideoUpdateInput {
  videoUrl: string;
  autoExtract?: boolean;
  videoTitle?: string;
  videoDescription?: string;
  videoThumbnail?: string;
  videoPlatform?: string;
  videoMetadata?: any;
}