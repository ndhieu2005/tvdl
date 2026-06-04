export interface ApiKeyData {
  id: string;
  userId: string;
  key: string;
  name: string;
  permissions: string[];
  status: 'active' | 'revoked' | 'expired';
  createdAt: Date;
  expiresAt: Date | null;
  lastUsed: Date | null;
  requestCount: number;
  description?: string;
}

export interface ApiKeyPermission {
  id: string;
  name: string;
  category: string;
  description: string;
}

export const API_KEY_PERMISSIONS: ApiKeyPermission[] = [
  // Posts permissions
  { id: 'post:read', name: 'Xem bài viết', category: 'Bài viết', description: 'Xem danh sách, chi tiết bài viết' },
  { id: 'post:create', name: 'Tạo bài viết', category: 'Bài viết', description: 'Tạo bài viết mới' },
  { id: 'post:update', name: 'Sửa bài viết', category: 'Bài viết', description: 'Cập nhật bài viết' },
  { id: 'post:delete', name: 'Xóa bài viết', category: 'Bài viết', description: 'Xóa bài viết' },
  
  // Files permissions
  { id: 'file:read', name: 'Xem tệp tin', category: 'Tệp tin', description: 'Tải hoặc duyệt danh sách file' },
  { id: 'file:upload', name: 'Tải lên tệp tin', category: 'Tệp tin', description: 'Upload video, ảnh, tài liệu' },
  { id: 'file:update', name: 'Sửa tệp tin', category: 'Tệp tin', description: 'Đổi tên, cập nhật metadata' },
  { id: 'file:delete', name: 'Xóa tệp tin', category: 'Tệp tin', description: 'Xóa file đã upload' },
  
  // Categories permissions
  { id: 'category:read', name: 'Xem danh mục', category: 'Danh mục', description: 'Xem danh sách danh mục' },
  { id: 'category:create', name: 'Tạo danh mục', category: 'Danh mục', description: 'Tạo danh mục mới' },
  { id: 'category:update', name: 'Sửa danh mục', category: 'Danh mục', description: 'Cập nhật danh mục' },
  { id: 'category:delete', name: 'Xóa danh mục', category: 'Danh mục', description: 'Xóa danh mục' },
  
  // Tags permissions
  { id: 'tag:read', name: 'Xem thẻ tag', category: 'Thẻ tag', description: 'Xem danh sách thẻ tag' },
  { id: 'tag:create', name: 'Tạo thẻ tag', category: 'Thẻ tag', description: 'Tạo thẻ tag mới' },
  { id: 'tag:update', name: 'Sửa thẻ tag', category: 'Thẻ tag', description: 'Cập nhật thẻ tag' },
  { id: 'tag:delete', name: 'Xóa thẻ tag', category: 'Thẻ tag', description: 'Xóa thẻ tag' },
  
  // Users permissions
  { id: 'user:read', name: 'Xem người dùng', category: 'Người dùng', description: 'Xem danh sách người dùng' },
  { id: 'user:create', name: 'Tạo người dùng', category: 'Người dùng', description: 'Tạo người dùng mới' },
  { id: 'user:update', name: 'Sửa người dùng', category: 'Người dùng', description: 'Cập nhật thông tin người dùng' },
  { id: 'user:delete', name: 'Xóa người dùng', category: 'Người dùng', description: 'Xóa người dùng' },
  
  // Settings permissions
  { id: 'settings:read', name: 'Xem cài đặt', category: 'Cài đặt', description: 'Xem cài đặt hệ thống' },
  { id: 'settings:update', name: 'Sửa cài đặt', category: 'Cài đặt', description: 'Cập nhật cài đặt hệ thống' },
];

export const API_KEY_CATEGORIES = [
  'Bài viết',
  'Tệp tin',
  'Danh mục',
  'Thẻ tag',
  'Người dùng',
  'Cài đặt'
];

export interface CreateApiKeyRequest {
  name: string;
  permissions: string[];
  expiresAt?: Date;
  description?: string;
}

export interface UpdateApiKeyRequest {
  name?: string;
  permissions?: string[];
  status?: 'active' | 'revoked' | 'expired';
  expiresAt?: Date;
  description?: string;
}