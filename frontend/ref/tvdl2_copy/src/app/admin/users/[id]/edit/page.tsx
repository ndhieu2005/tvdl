'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft,
  User,
  Mail,
  Shield,
  MapPin,
  FileText,
  Save,
  Eye,
  EyeOff,
  Crown,
  ShieldCheck,
  Users,
  Loader2
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  location: string;
  bio: string;
  emailVerified: boolean;
  avatar: string;
  joinDate: string;
  lastLogin: string;
  stats: {
    posts: number;
    likes: number;
    comments: number;
  };
}

interface EditUserForm {
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  location: string;
  bio: string;
  emailVerified: boolean;
}

export default function EditUserPage() {
  const params = useParams();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
          if (resolved && typeof resolved.id === 'string') {
        setResolvedParams({ id: resolved.id });
      } else {
        setResolvedParams(null);
      }

    };
    resolveParams();
  }, [params]);

  const userId = resolvedParams?.id || "";
  
  const [user, setUser] = useState<UserData | null>(null);
  const [form, setForm] = useState<EditUserForm>({
    name: '',
    email: '',
    role: 'USER',
    status: 'ACTIVE',
    location: '',
    bio: '',
    emailVerified: true
  });

  const [errors, setErrors] = useState<Partial<EditUserForm>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Không thể tải thông tin user');
        }
        
        const data = await response.json();
        const userData = data.user;
        
        setUser(userData);
        setForm({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          status: userData.status,
          location: userData.location,
          bio: userData.bio,
          emailVerified: userData.emailVerified
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        alert('Không thể tải thông tin user');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof EditUserForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<EditUserForm> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Tên là bắt buộc';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Không thể cập nhật user');
      }
      
      const data = await response.json();
      console.log('User updated:', data);
      
      // Redirect back to users list
      window.location.href = '/admin/users';
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get role color and icon
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { 
          color: 'text-purple-600', 
          bgColor: 'bg-purple-50',
          icon: <Crown className="h-4 w-4" />
        };
      case 'EDITOR':
        return { 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-50',
          icon: <ShieldCheck className="h-4 w-4" />
        };
      case 'USER':
        return { 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-50',
          icon: <Users className="h-4 w-4" />
        };
      default:
        return { 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-50',
          icon: <Users className="h-4 w-4" />
        };
    }
  };

  const roleInfo = getRoleInfo(form.role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy user</h2>
          <Link 
            href="/admin/users"
            className="text-purple-600 hover:text-purple-800"
          >
            Quay lại danh sách users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/users"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Quay lại
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa User
            </h1>
            <p className="text-gray-600 mt-1">
              Cập nhật thông tin cho {user.name}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Thông tin cơ bản
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đầy đủ *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên đầy đủ"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="user@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role and Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Vai trò và trạng thái
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò
                </label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                  >
                    <option value="USER">User - Người dùng thường</option>
                    <option value="EDITOR">Editor - Biên tập viên</option>
                    <option value="ADMIN">Admin - Quản trị viên</option>
                  </select>
                  <div className={`absolute right-12 top-1/2 transform -translate-y-1/2 ${roleInfo.color}`}>
                    {roleInfo.icon}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                  <option value="PENDING">Chờ duyệt</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Thông tin bổ sung
            </h3>
            
            <div className="space-y-4">
              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm
                </label>
                <div className="relative">
                  <MapPin className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Thành phố, Quốc gia"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiểu sử
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Mô tả ngắn về người dùng..."
                />
              </div>

              {/* Email Verified */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailVerified"
                  name="emailVerified"
                  checked={form.emailVerified}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="emailVerified" className="ml-2 block text-sm text-gray-700">
                  Email đã được xác thực
                </label>
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Thống kê
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">{user.stats.posts}</div>
                <div className="text-sm text-gray-600">Bài viết</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <Link
              href="/admin/users"
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Đang cập nhật...' : 'Cập nhật User'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}