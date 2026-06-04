'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, BookOpen, Calendar, User, MapPin } from 'lucide-react';

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
  availableQuantity: number;
  slug: string;
  createdAt: string;
}

interface BooksResponse {
  success: boolean;
  data: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    sort: 'newest'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 18,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchBooks = async (page: number = 1) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '18',
        ...(filters.search && { search: filters.search }),
        ...(filters.genre && { genre: filters.genre }),
        ...(filters.sort && { sort: filters.sort })
      });

      console.log('Fetching books with URL:', `/api/public/books?${params}`);
      const response = await fetch(`/api/public/books?${params}`);

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Lỗi khi tải danh sách sách');
      }

      const data: BooksResponse = await response.json();
      console.log('Books data received:', data);
      
      if (data.success) {
        setBooks(data.data);
        setPagination(data.pagination);
        setCurrentPage(page);
      } else {
        setError('Lỗi khi tải danh sách sách');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setError(error instanceof Error ? error.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', genre: '', sort: 'newest' });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <BookOpen className="h-8 w-8 text-purple-600" />
              Thư viện sách
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Khám phá bộ sưu tập sách phong phú của chúng tôi
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên sách, tác giả..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <input
              type="text"
              placeholder="Thể loại"
              value={filters.genre}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="title_asc">Tên A-Z</option>
              <option value="title_desc">Tên Z-A</option>
              <option value="author_asc">Tác giả A-Z</option>
              <option value="author_desc">Tác giả Z-A</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Xóa bộ lọc
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && books.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải danh sách sách...</p>
            </div>
          </div>
        )}

        {/* Books Grid */}
        {!loading && books.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 mb-8">
            {books.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                <Link href={`/books/${book.slug}`}>
                  <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <BookOpen className="mx-auto h-10 w-10 text-gray-400" />
                        <p className="mt-1 text-xs text-gray-500">Không có hình ảnh</p>
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="p-2 sm:p-3">
                  <Link href={`/books/${book.slug}`}>
                    <h3 className="font-medium text-gray-900 mb-1 sm:mb-2 line-clamp-2 hover:text-purple-600 transition-colors text-xs sm:text-sm">
                      {book.title}
                    </h3>
                  </Link>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{book.author}</span>
                    </div>
                    
                    {book.genre && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{book.genre}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="text-green-600 font-medium text-xs">
                        Còn {book.availableQuantity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 sm:mt-3">
                    <Link
                      href={`/books/${book.slug}`}
                      className="inline-flex items-center justify-center w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 transition-colors"
                    >
                      <span className="hidden sm:inline">Xem chi tiết</span>
                      <span className="sm:hidden">Xem</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && books.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy sách nào</h3>
            <p className="mt-2 text-gray-600">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn.
            </p>
            <div className="mt-6">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {((pagination.page - 1) * pagination.limit) + 1} đến{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{' '}
              {pagination.total} sách
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchBooks(currentPage - 1)}
                disabled={!pagination.hasPrev || loading}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md">
                {pagination.page}
              </span>
              <button
                onClick={() => fetchBooks(currentPage + 1)}
                disabled={!pagination.hasNext || loading}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}