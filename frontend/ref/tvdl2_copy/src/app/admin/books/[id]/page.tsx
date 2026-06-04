'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, BookOpen, Calendar, MapPin, Package } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImage?: string;
  bookCode: string;
  isbn?: string;
  publisher?: string;
  publishYear?: number;
  genre?: string;
  pages?: number;
  quantity: number;
  availableQuantity: number;
  location?: string;
  status: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleting, setDeleting] = useState(false);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bạn cần đăng nhập để xem thông tin sách');
        return;
      }

      const response = await fetch(`/api/admin/books/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi khi tải thông tin sách');
      }

      const data = await response.json();
      
      if (data.success) {
        setBook(data.data);
      } else {
        setError('Lỗi khi tải thông tin sách');
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      setError(error instanceof Error ? error.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!book) return;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa sách "${book.title}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/books/${book.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi khi xóa sách');
      }

      alert('Xóa sách thành công!');
      router.push('/admin/books');
    } catch (error) {
      console.error('Error deleting book:', error);
      alert(error instanceof Error ? error.message : 'Lỗi khi xóa sách');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AVAILABLE: { label: 'Có sẵn', className: 'bg-green-100 text-green-800' },
      UNAVAILABLE: { label: 'Không có sẵn', className: 'bg-red-100 text-red-800' },
      MAINTENANCE: { label: 'Bảo trì', className: 'bg-yellow-100 text-yellow-800' },
      LOST: { label: 'Mất', className: 'bg-gray-100 text-gray-800' },
      DAMAGED: { label: 'Hư hỏng', className: 'bg-orange-100 text-orange-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.AVAILABLE;
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  useEffect(() => {
    if (params.id) {
      fetchBook();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin sách...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <div className="mt-4">
          <Link
            href="/admin/books"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách sách
          </Link>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-6">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy sách</h3>
          <p className="mt-1 text-sm text-gray-500">
            Sách bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/books"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/books"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Chi tiết sách
            </h1>
            <p className="text-gray-600 mt-1">
              Thông tin chi tiết về sách
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/books/${book.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Edit className="h-4 w-4" />
            Chỉnh sửa
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Book Cover */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Không có hình ảnh</p>
                </div>
              )}
            </div>
            <div className="text-center">
              {getStatusBadge(book.status)}
            </div>
          </div>
        </div>

        {/* Book Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Tên sách</label>
                <p className="mt-1 text-sm text-gray-900">{book.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Tác giả</label>
                <p className="mt-1 text-sm text-gray-900">{book.author}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Mã sách</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{book.bookCode}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">ISBN</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{book.isbn || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Thể loại</label>
                <p className="mt-1 text-sm text-gray-900">{book.genre || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Số trang</label>
                <p className="mt-1 text-sm text-gray-900">{book.pages || 'N/A'}</p>
              </div>
            </div>
            {book.description && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500">Mô tả</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{book.description}</p>
              </div>
            )}
          </div>

          {/* Publishing Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Thông tin xuất bản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Nhà xuất bản</label>
                <p className="mt-1 text-sm text-gray-900">{book.publisher || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Năm xuất bản</label>
                <p className="mt-1 text-sm text-gray-900">{book.publishYear || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Management Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Thông tin quản lý
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Tổng số lượng</label>
                <p className="mt-1 text-sm text-gray-900">{book.quantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Số lượng có sẵn</label>
                <p className="mt-1 text-sm text-gray-900">{book.availableQuantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Đã mượn</label>
                <p className="mt-1 text-sm text-gray-900">{book.quantity - book.availableQuantity}</p>
              </div>
            </div>
            {book.location && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Vị trí trong thư viện
                </label>
                <p className="mt-1 text-sm text-gray-900">{book.location}</p>
              </div>
            )}
          </div>

          {/* SEO Information */}
          {(book.metaTitle || book.metaDescription) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>
              <div className="space-y-4">
                {book.metaTitle && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Meta Title</label>
                    <p className="mt-1 text-sm text-gray-900">{book.metaTitle}</p>
                  </div>
                )}
                {book.metaDescription && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Meta Description</label>
                    <p className="mt-1 text-sm text-gray-900">{book.metaDescription}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hệ thống</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Ngày tạo</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(book.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(book.updatedAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">URL Slug</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{book.slug}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}