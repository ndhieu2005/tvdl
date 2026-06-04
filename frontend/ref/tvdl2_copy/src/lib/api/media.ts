export interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  objectName: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  mimeType: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  url: string | null;
  uploadedBy: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export interface MediaResponse {
  files: MediaFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MediaUploadResponse {
  success: boolean;
  data?: MediaFile;
  error?: string;
}

export interface MediaListResponse {
  success: boolean;
  data?: MediaResponse;
  error?: string;
}

export const mediaAPI = {
  // Get media files list
  async getMediaFiles(
    params: {
      page?: number;
      limit?: number;
      type?: string;
      search?: string;
    } = {},
    token?: string
  ): Promise<MediaListResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.type) searchParams.append('type', params.type);
      if (params.search) searchParams.append('search', params.search);

      const response = await fetch(`/api/admin/media?${searchParams}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to fetch media files'
        };
      }

      const data: MediaResponse = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Upload media file
  async uploadFile(
    file: File,
    customName?: string,
    token?: string
  ): Promise<MediaUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (customName) {
        formData.append('name', customName);
      }

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to upload file'
        };
      }

      const data: MediaFile = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Delete media file
  async deleteFile(id: string, token?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to delete file'
        };
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Get media file URL
  getFileUrl(id: string): string {
    return `/api/media/${id}`;
  },

  // Get media file download URL
  getDownloadUrl(id: string): string {
    return `/api/media/${id}?download=true`;
  },

  // Get media file preview URL (for thumbnails)
  getPreviewUrl(id: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    return `/api/media/${id}/preview?size=${size}`;
  }
};