'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, User, Search, Loader2, Clock, Book } from 'lucide-react';

interface BookData {
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
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
}

interface BooksResponse {
  success: boolean;
  data: BookData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'title_asc', label: 'Tiêu đề A-Z' },
  { value: 'title_desc', label: 'Tiêu đề Z-A' },
  { value: 'author_asc', label: 'Tác giả A-Z' },
  { value: 'author_desc', label: 'Tác giả Z-A' }
];

const genreOptions = [
  'Văn học',
  'Khoa học',
  'Lịch sử',
  'Công nghệ',
  'Kinh tế',
  'Tâm lý',
  'Giáo dục',
  'Nghệ thuật',
  'Thể thao',
  'Du lịch'
];

export default function NewBooksPage() {
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch new books (created within last month)
  const fetchNewBooks = async (page: number = 1) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50', // Lấy nhiều hơn để lọc
        sort: sortBy,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedGenre && selectedGenre !== 'all' && { genre: selectedGenre })
      });

      const response = await fetch(`/api/public/books?${params}`);

      if (!response.ok) {
        throw new Error('Lỗi khi tải danh sách sách mới');
      }

      const data: BooksResponse = await response.json();

      if (data.success) {
        // Calculate date 1 month ago
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        // Filter books created within last month
        const newBooks = data.data.filter(book => {
          const bookCreatedAt = new Date(book.createdAt);
          return bookCreatedAt >= oneMonthAgo;
        });

        console.log('📚 Total books from API:', data.data.length);
        console.log('📚 Books created after:', oneMonthAgo.toISOString());
        console.log('📚 New books found:', newBooks.length);

        // Paginate the filtered results
        const startIndex = (page - 1) * 12;
        const endIndex = startIndex + 12;
        const paginatedBooks = newBooks.slice(startIndex, endIndex);

        setBooks(paginatedBooks);

        // Update pagination to reflect filtered results
        const filteredTotal = newBooks.length;
        const totalPages = Math.ceil(filteredTotal / 12);
        setPagination({
          page,
          limit: 12,
          total: filteredTotal,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        });
        setCurrentPage(page);
      } else {
        setError('Lỗi khi tải danh sách sách mới');
      }
    } catch (err) {
      console.error('Error fetching new books:', err);
      setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách sách mới');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewBooks(1);
  }, [searchQuery, selectedGenre, sortBy]);

  const handlePageChange = (page: number) => {
    fetchNewBooks(page);
  };

  const getGenreColor = (genre?: string) => {
    if (!genre) return 'bg-gray-100 text-gray-800';

    const colorMap: { [key: string]: string } = {
      'Văn học': 'bg-purple-100 text-purple-800',
      'Khoa học': 'bg-green-100 text-green-800',
      'Lịch sử': 'bg-yellow-100 text-yellow-800',
      'Công nghệ': 'bg-indigo-100 text-indigo-800',
      'Kinh tế': 'bg-blue-100 text-blue-800',
      'Tâm lý': 'bg-pink-100 text-pink-800',
      'Giáo dục': 'bg-orange-100 text-orange-800',
      'Nghệ thuật': 'bg-red-100 text-red-800',
      'Thể thao': 'bg-emerald-100 text-emerald-800',
      'Du lịch': 'bg-cyan-100 text-cyan-800'
    };

    return colorMap[genre] || 'bg-gray-100 text-gray-800';
  };



  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sách mới</h1>
          <p className="text-lg text-gray-600">
            Khám phá những bài viết giới thiệu về sách mới nhất của thư viện
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="text-red-800">
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Đang tải danh sách sách mới...</span>
          </div>
        )}

        {/* Filters and Search */}
        {!loading && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm sách theo tên, tác giả..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Genre Filter */}
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thể loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thể loại</SelectItem>
                  {genreOptions.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!loading && (
          <div className="mb-6">
            <p className="text-gray-600">
              Hiển thị {books.length} sách từ tổng số {pagination.total} sách mới (được thêm trong 1 tháng gần đây)
            </p>
          </div>
        )}

        {/* Books Grid */}
        {!loading && books.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-[3/4] bg-gradient-to-br from-blue-300 to-purple-400 flex items-center justify-center">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Book className="h-16 w-16 text-white opacity-70" />
                  )}
                </div>

                <CardHeader>
                  <div className="flex justify-between items-start mb-3">
                    {book.genre && (
                      <Badge className={getGenreColor(book.genre)}>
                        {book.genre}
                      </Badge>
                    )}
                    <div className={`${book.genre ? '' : 'ml-0'} flex items-center text-xs text-gray-500`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(book.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <CardTitle className="text-lg line-clamp-2">
                    <Link href={`/books/${book.slug}`} className="hover:text-blue-600 transition-colors">
                      {book.title}
                    </Link>
                  </CardTitle>

                  <CardDescription className="text-sm">
                    <div className="flex items-center mb-1">
                      <User className="h-3 w-3 mr-1" />
                      {book.author}
                    </div>
                    {book.publisher && (
                      <div className="text-xs text-gray-500">
                        NXB: {book.publisher} {book.publishYear && `(${book.publishYear})`}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {book.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {book.description}
                    </p>
                  )}

                  {/* Book Info */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {book.pages && (
                      <Badge variant="outline" className="text-xs">
                        {book.pages} trang
                      </Badge>
                    )}
                    {book.isbn && (
                      <Badge variant="outline" className="text-xs">
                        ISBN: {book.isbn}
                      </Badge>
                    )}
                  </div>

                  {/* Availability */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Còn {book.availableQuantity} cuốn
                    </div>
                    <div className="text-xs font-medium text-blue-600">
                      Mã: {book.bookCode}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/books/${book.slug}`}>
                        Xem chi tiết
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && books.length === 0 && (
          <div className="text-center py-12">
            <Book className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sách mới</h3>
            <p className="text-gray-600">
              Chưa có sách nào được thêm trong 1 tháng gần đây hoặc không khớp với bộ lọc. Thử thay đổi từ khóa tìm kiếm hoặc thể loại.
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mb-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              Trước
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              Sau
            </Button>
          </div>
        )}

        {/* Statistics */}
        {!loading && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {pagination.total}
                  </div>
                  <div className="text-sm text-gray-600">Sách mới</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {books.reduce((sum, book) => sum + book.availableQuantity, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Tổng số cuốn có sẵn</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {new Set(books.map(book => book.genre).filter(Boolean)).size}
                  </div>
                  <div className="text-sm text-gray-600">Thể loại</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}