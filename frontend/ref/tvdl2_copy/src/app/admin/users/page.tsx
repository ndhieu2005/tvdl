'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  User, 
  UserPlus,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  Eye,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  UserX,
  Users,
  Crown,
  Activity,
  FileText,
  Share2,
  Clock,
  MapPin,
  Smartphone,
  X,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Key
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
  status: 'active' | 'inactive' | 'pending';
  location: string;
  bio: string;
  emailVerified: boolean;
  avatar: string;
  joinDate: string;
  lastLogin: string;
  stats: {
    posts: number;
  };
}

interface ApiResponse {
  users: UserData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    admins: number;
    editors: number;
    regularUsers: number;
  };
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    admins: 0,
    editors: 0,
    regularUsers: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter })
      });
      
      console.log('🔍 Fetching users with params:', params.toString());
      
      const response = await fetch(`/api/users?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ API Error:', errorData);
        throw new Error(`Không thể tải danh sách users (${response.status})`);
      }
      
      const data: ApiResponse = await response.json();
      console.log('✅ Users data received:', data);
      
      setUsers(data.users || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
      setStats(data.stats || { total: 0, active: 0, inactive: 0, pending: 0, admins: 0, editors: 0, regularUsers: 0 });
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải danh sách users');
    } finally {
      setIsLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm || roleFilter || statusFilter) {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchUsers();
      } else {
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter, statusFilter]);

  const filteredUsers = users;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          toast.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Users
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý người dùng, quyền hạn và hoạt động
          </p>
        </div>
        
        <Link
          href="/admin/users/new"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Thêm user</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Crown className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 sm:flex-none">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            <div className="flex space-x-4">
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Tất cả vai trò</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="user">User</option>
              </select>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="banned">Bị cấm</option>
                <option value="pending">Chờ duyệt</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header with refresh button */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Danh sách Users ({stats.total})
          </h2>
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Làm mới"
          >
            <Activity className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <span className="text-gray-600">Đang tải...</span>
            </div>
          </div>
        )}
        
        <div className="relative">
          {/* Mobile Cards View */}
          <div className="block lg:hidden">
            <div className="space-y-4 p-4">
              {isLoading ? (
                // Loading skeleton for mobile
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="flex justify-center space-x-2 pt-2 border-t border-gray-100">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    {/* User Info */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-12 w-12 rounded-full"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                          {user.emailVerified && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                        {user.location && (
                          <div className="text-xs text-gray-400 flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{user.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status and Role */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <span className="capitalize">{user.role}</span>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="capitalize">
                            {user.status === 'active' ? 'Hoạt động' : 
                             user.status === 'inactive' ? 'Không hoạt động' : 'Chờ duyệt'}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(user.joinDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3 w-3" />
                          <span>{user.stats.posts}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hoạt động
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate flex items-center space-x-2">
                              <Mail className="h-3 w-3" />
                              <span>{user.email}</span>
                              {user.emailVerified && (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <span className="capitalize">{user.role}</span>
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="capitalize">
                            {user.status === 'active' ? 'Hoạt động' : 
                             user.status === 'inactive' ? 'Không hoạt động' : 'Chờ duyệt'}
                          </span>
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(user.joinDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="h-3 w-3" />
                            <span>{user.stats.posts} posts</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            className="text-purple-600 hover:text-purple-900 p-1.5 rounded-full hover:bg-purple-50 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-900 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                            title="Xóa user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!isLoading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error ? 'Có lỗi xảy ra' : 'Không tìm thấy user'}
            </h3>
            <p className="text-gray-500 mb-6">
              {error ? 'Vui lòng kiểm tra kết nối và thử lại.' : 'Hãy thử thay đổi bộ lọc hoặc thêm user mới.'}
            </p>
            
            {/* Debug info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
              <h4 className="font-medium text-gray-900 mb-2">Debug Info:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Total users: {stats.total}</div>
                <div>Current page: {pagination.page}</div>
                <div>Search term: "{searchTerm}"</div>
                <div>Role filter: "{roleFilter}"</div>
                <div>Status filter: "{statusFilter}"</div>
                <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                <div>Error: {error || 'None'}</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={fetchUsers}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <Activity className="h-4 w-4" />
                <span>Thử lại</span>
              </button>
              <button
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    const response = await fetch('/api/admin/seed-users', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' }
                    });
                    const result = await response.json();
                    if (response.ok) {
                      showToast(result.message, 'success');
                      await fetchUsers();
                    } else {
                      showToast(result.error, 'error');
                    }
                  } catch (error) {
                    showToast('Có lỗi xảy ra khi tạo users mẫu', 'error');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Users className="h-4 w-4" />
                <span>Tạo users mẫu</span>
              </button>
              <Link
                href="/admin/users/new"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Thêm user mới</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}