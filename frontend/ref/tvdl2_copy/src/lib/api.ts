import { IPost } from './models/Post';

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PostData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  featuredVideo: string;
  videoUrl: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishDate: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
  // New video fields
  videoThumbnail?: string;
  videoPlatform?: string;
  videoTitle?: string;
  videoDescription?: string;
  videoMetadata?: {
    views?: number;
    likes?: number;
    duration?: string;
    [key: string]: any;
  };
}

export interface PostQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
}

class PostAPI {
  private baseUrl = `${API_BASE_URL}/api/posts`;

  // Helper method to get auth headers
  private getAuthHeaders(): HeadersInit {
    let token: string | null = null;
    
    // Try to get token from localStorage (client-side)
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }
    
    // Try to get token from cookie (fallback)
    if (!token && typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
      if (tokenCookie) {
        token = tokenCookie.split('=')[1];
      }
    }
    
    // Validate token type
    if (token && token.startsWith('vpk_')) {
      console.error('🚨 API Key detected in localStorage! This should be a JWT token.');
      console.error('🚨 Clearing corrupted token and redirecting to login...');
      
      // Clear corrupted token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('⚠️ Phát hiện API key thay vì JWT token. Vui lòng đăng nhập lại.');
        window.location.href = '/admin/login';
      }
      
      return {
        'Content-Type': 'application/json'
      };
    }
    
    // Debug logs only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 getAuthHeaders - Token exists:', !!token);
      console.log('🔑 getAuthHeaders - Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      console.log('🔑 getAuthHeaders - Token type:', token ? (token.includes('.') ? 'JWT' : 'Unknown') : 'None');
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async getPosts(params?: PostQueryParams): Promise<ApiResponse<IPost[]>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status) searchParams.append('status', params.status);
      if (params?.category) searchParams.append('category', params.category);
      if (params?.search) searchParams.append('search', params.search);

      const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching posts:', error);
      return {
        success: false,
        error: 'Failed to fetch posts'
      };
    }
  }

  async getPost(id: string): Promise<ApiResponse<IPost>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching post:', error);
      return {
        success: false,
        error: 'Failed to fetch post'
      };
    }
  }

  async getPostBySlug(slug: string): Promise<ApiResponse<IPost>> {
    try {
      const response = await fetch(`${this.baseUrl}/slug/${slug}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      return {
        success: false,
        error: 'Failed to fetch post'
      };
    }
  }

  async createPost(postData: PostData, token?: string): Promise<ApiResponse<IPost>> {
    try {
      const headers = token ? this.getAuthHeadersWithToken(token) : this.getAuthHeaders();
      console.log('📤 PostAPI.createPost - Headers:', headers);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(postData),
      });
      
      console.log('📤 PostAPI.createPost - Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('📤 PostAPI.createPost - Error response:', errorData);
        console.error('📤 PostAPI.createPost - Response status:', response.status);
        console.error('📤 PostAPI.createPost - Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Handle specific authentication errors
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        if (response.status === 403) {
          throw new Error('Bạn không có quyền thực hiện thao tác này.');
        }
        
        if (response.status >= 500) {
          throw new Error('Lỗi server. Vui lòng thử lại sau.');
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📤 PostAPI.createPost - Success:', result);
      return result;
    } catch (error) {
      console.error('📤 PostAPI.createPost - Exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create post'
      };
    }
  }

  // Helper method to get auth headers with a specific token
  private getAuthHeadersWithToken(token: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async updatePost(id: string, postData: Partial<PostData>, token?: string): Promise<ApiResponse<IPost>> {
    try {
      const headers = token ? this.getAuthHeadersWithToken(token) : this.getAuthHeaders();
      console.log('📤 PostAPI.updatePost - Headers:', headers);
      console.log('📤 PostAPI.updatePost - Post ID:', id);
      console.log('📤 PostAPI.updatePost - Post data:', postData);
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(postData),
      });
      
      console.log('📤 PostAPI.updatePost - Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('📤 PostAPI.updatePost - Error response:', errorData);
        console.error('📤 PostAPI.updatePost - Response status:', response.status);
        console.error('📤 PostAPI.updatePost - Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Handle specific authentication errors
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        if (response.status === 403) {
          throw new Error('Bạn không có quyền thực hiện thao tác này.');
        }
        
        if (response.status >= 500) {
          throw new Error('Lỗi server. Vui lòng thử lại sau.');
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📤 PostAPI.updatePost - Success:', result);
      return result;
    } catch (error) {
      console.error('📤 PostAPI.updatePost - Exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update post'
      };
    }
  }

  async deletePost(id: string): Promise<ApiResponse<null>> {
    try {
      console.log('🗑️ PostAPI.deletePost - Starting deletion for ID:', id);
      console.log('🗑️ PostAPI.deletePost - Request URL:', `${this.baseUrl}/${id}`);
      
      const headers = this.getAuthHeaders();
      console.log('🗑️ PostAPI.deletePost - Headers:', headers);
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: headers,
      });
      
      console.log('🗑️ PostAPI.deletePost - Response status:', response.status);
      console.log('🗑️ PostAPI.deletePost - Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error('🗑️ PostAPI.deletePost - Request failed with status:', response.status);
        
        let errorData;
        try {
          errorData = await response.json();
          console.error('🗑️ PostAPI.deletePost - Error response:', errorData);
        } catch (parseError) {
          console.error('🗑️ PostAPI.deletePost - Could not parse error response:', parseError);
          errorData = { error: `HTTP error! status: ${response.status}` };
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🗑️ PostAPI.deletePost - Success response:', result);
      return result;
    } catch (error) {
      console.error('🗑️ PostAPI.deletePost - Exception:', error);
      
      // Log additional error information
      if (error instanceof Error) {
        console.error('🗑️ PostAPI.deletePost - Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete post'
      };
    }
  }
}

export const postAPI = new PostAPI();

// Helper function to make authenticated API calls
export const apiClient = {
  // Helper method to get auth headers
  getAuthHeaders(): HeadersInit {
    let token: string | null = null;
    
    // Try to get token from localStorage (client-side)
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }
    
    // Try to get token from cookie (fallback)
    if (!token && typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
      if (tokenCookie) {
        token = tokenCookie.split('=')[1];
      }
    }
    
    // Debug logs only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 apiClient.getAuthHeaders - Token exists:', !!token);
      console.log('🔑 apiClient.getAuthHeaders - Token preview:', token ? token.substring(0, 20) + '...' : 'null');
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  },

  async fetch(url: string, options: RequestInit = {}) {
    const headers = this.getAuthHeaders();
    
    // Don't set Content-Type for FormData - let browser handle it
    const isFormData = options.body instanceof FormData;
    let finalHeaders: Record<string, string> = { ...headers as Record<string, string> };
    
    if (isFormData) {
      // Remove Content-Type for FormData - let browser handle it
      delete finalHeaders['Content-Type'];
    }
    
    return fetch(url, {
      ...options,
      headers: {
        ...finalHeaders,
        ...options.headers,
      },
    });
  }
};