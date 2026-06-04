'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, User, MapPin, Package, Building, Hash } from 'lucide-react';

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
}

export default function BookDetailPage() {
  const params = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/public/books/${params.slug}`);

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
    if (params.slug) {
      fetchBook();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin sách...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
          <div className="mt-4">
            <Link
              href="/books"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy sách</h3>
            <p className="mt-2 text-gray-600">
              Sách bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <div className="mt-6">
              <Link
                href="/books"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách sách
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/books"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              Quay lại
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chi tiết sách</h1>
              <p className="text-gray-600 mt-1">Thông tin chi tiết về sách</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <BookOpen className="mx-auto h-20 w-20 text-gray-400" />
                    <p className="mt-3 text-sm text-gray-500">Không có hình ảnh</p>
                  </div>
                )}
              </div>
              
              <div className="text-center space-y-4">
                {getStatusBadge(book.status)}
                
                <div className="text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="font-medium text-green-600">
                      Còn {book.availableQuantity}/{book.quantity} cuốn
                    </span>
                  </div>
                </div>

                {book.location && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{book.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Book Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{book.title}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Tác giả</p>
                    <p className="font-medium text-gray-900">{book.author}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Mã sách</p>
                    <p className="font-mono text-gray-900">{book.bookCode}</p>
                  </div>
                </div>

                {book.genre && (
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Thể loại</p>
                      <p className="text-gray-900">{book.genre}</p>
                    </div>
                  </div>
                )}

                {book.pages && (
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Số trang</p>
                      <p className="text-gray-900">{book.pages} trang</p>
                    </div>
                  </div>
                )}
              </div>

              {book.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {book.description}
                  </p>
                </div>
              )}
            </div>

            {/* Publishing Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Thông tin xuất bản
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nhà xuất bản</p>
                  <p className="text-gray-900">{book.publisher || 'Không có thông tin'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Năm xuất bản</p>
                  <p className="text-gray-900">{book.publishYear || 'Không có thông tin'}</p>
                </div>
                {book.isbn && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">ISBN</p>
                    <p className="font-mono text-gray-900">{book.isbn}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Thông tin khác
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ngày thêm vào thư viện</p>
                  <p className="text-gray-900">
                    {new Date(book.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tình trạng</p>
                  <div className="mt-1">
                    {getStatusBadge(book.status)}
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}