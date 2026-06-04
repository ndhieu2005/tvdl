'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PlusCircle, Search, Filter, Edit, Trash2, Eye, Download, Upload, BookOpen, FileText, Trash, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
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
  createdAt: string;
  updatedAt: string;
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

export default function BooksListPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    genre: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [goToPage, setGoToPage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBooks = async (page: number = 1, limit?: number) => {
    return fetchBooksWithFilters(page, limit, filters);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sách "${title}"?`)) {
      return;
    }

    try {
      setDeleting(id);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/books/${id}`, {
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

      // Refresh the list
      await fetchBooks(currentPage);
      alert('Xóa sách thành công!');
    } catch (error) {
      console.error('Error deleting book:', error);
      alert(error instanceof Error ? error.message : 'Lỗi khi xóa sách');
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBooks.length === 0) {
      alert('Vui lòng chọn ít nhất một sách để xóa');
      return;
    }

    // Get selected book titles for confirmation
    const selectedBookTitles = books
      .filter(book => selectedBooks.includes(book.id))
      .map(book => `• ${book.title} (${book.bookCode})`)
      .join('\n');

    const confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedBooks.length} sách sau?\n\n${selectedBookTitles}\n\nHành động này không thể hoàn tác!`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setBulkDeleting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/books', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedBooks })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Lỗi khi xóa sách');
      }

      if (result.success) {
        alert(result.message || `Đã xóa thành công ${result.data.deletedCount} sách`);
        setSelectedBooks([]);
        await fetchBooks(currentPage);
      } else {
        alert(`Xóa thất bại: ${result.error}`);
      }
    } catch (error) {
      console.error('Error bulk deleting books:', error);
      alert(error instanceof Error ? error.message : 'Lỗi khi xóa sách');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSelectBook = (bookId: string) => {
    setSelectedBooks(prev => {
      if (prev.includes(bookId)) {
        return prev.filter(id => id !== bookId);
      } else {
        return [...prev, bookId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedBooks.length === books.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(books.map(book => book.id));
    }
  };

  const isAllSelected = books.length > 0 && selectedBooks.length === books.length;
  const isIndeterminate = selectedBooks.length > 0 && selectedBooks.length < books.length;

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;
    
    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    console.log('🔄 Changing items per page:', {
      oldLimit: itemsPerPage,
      newLimit,
      currentPage,
      total: pagination.total
    });
    
    setItemsPerPage(newLimit);
    
    // Reset to page 1 when changing items per page for simplicity
    // This is the most common UX pattern
    setCurrentPage(1);
    fetchBooks(1, newLimit);
  };

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(goToPage);
    if (pageNum >= 1 && pageNum <= pagination.totalPages) {
      fetchBooks(pageNum);
      setGoToPage('');
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        ...(filters.status && { status: filters.status }),
        ...(filters.genre && { genre: filters.genre })
      });

      const response = await fetch(`/api/admin/books/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Lỗi khi export dữ liệu');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `danh-sach-sach-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      alert('Export thành công!');
    } catch (error) {
      console.error('Error exporting books:', error);
      alert(error instanceof Error ? error.message : 'Lỗi khi export dữ liệu');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/books/template', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Lỗi khi tải template');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-sach-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      alert('Tải template thành công!');
    } catch (error) {
      console.error('Error downloading template:', error);
      alert(error instanceof Error ? error.message : 'Lỗi khi tải template');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/books/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      console.log('Import result:', result);

      if (!response.ok) {
        // Show detailed error information
        let errorMessage = result.error || 'Lỗi khi import dữ liệu';
        
        if (result.details && Array.isArray(result.details) && result.details.length > 0) {
          errorMessage += '\n\nChi tiết lỗi:\n' + result.details.slice(0, 10).join('\n');
          if (result.details.length > 10) {
            errorMessage += `\n... và ${result.details.length - 10} lỗi khác`;
          }
        }
        
        alert(errorMessage);
        return;
      }

      if (result.success) {
        let successMessage = `Import thành công! ${result.data.imported}/${result.data.total} sách được thêm.`;
        
        if (result.data.duplicates > 0) {
          successMessage += `\n${result.data.duplicates} sách bị trùng lặp đã bỏ qua.`;
        }
        
        if (result.data.errors > 0) {
          successMessage += `\n${result.data.errors} dòng có lỗi đã bỏ qua.`;
        }
        
        // Show details if any
        if (result.details) {
          const allDetails = [
            ...result.details.duplicateBookCodes || [],
            ...result.details.duplicateISBNs || [],
            ...result.details.errors || []
          ];
          
          if (allDetails.length > 0) {
            successMessage += '\n\nChi tiết:\n' + allDetails.slice(0, 5).join('\n');
            if (allDetails.length > 5) {
              successMessage += `\n... và ${allDetails.length - 5} thông báo khác`;
            }
          }
        }
        
        alert(successMessage);
        await fetchBooks(1); // Refresh to first page
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        alert(`Import thất bại: ${result.error}`);
      }
    } catch (error) {
      console.error('Error importing books:', error);
      let errorMessage = 'Lỗi khi import dữ liệu';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    const clearedFilters = { search: '', status: '', genre: '' };
    setFilters(clearedFilters);
    // Fetch books with cleared filters immediately
    fetchBooksWithFilters(1, itemsPerPage, clearedFilters);
  };

  const fetchBooksWithFilters = async (page: number = 1, limit?: number, customFilters?: typeof filters) => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bạn cần đăng nhập để xem danh sách sách');
        return;
      }

      const currentLimit = limit || itemsPerPage;
      const currentFilters = customFilters || filters;
      
      console.log('📚 Fetching books with params:', {
        page,
        limit: currentLimit,
        filters: currentFilters
      });
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: currentLimit.toString(),
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.status && { status: currentFilters.status }),
        ...(currentFilters.genre && { genre: currentFilters.genre })
      });

      console.log('📚 API URL:', `/api/admin/books?${params.toString()}`);

      const response = await fetch(`/api/admin/books?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi khi tải danh sách sách');
      }

      const data: BooksResponse = await response.json();
      
      console.log('📚 API Response:', {
        success: data.success,
        booksCount: data.data?.length,
        pagination: data.pagination
      });
      
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Sync itemsPerPage with pagination.limit when data is loaded
  useEffect(() => {
    if (pagination.limit && pagination.limit !== itemsPerPage) {
      setItemsPerPage(pagination.limit);
    }
  }, [pagination.limit]);

  // Reset selection when page changes
  useEffect(() => {
    setSelectedBooks([]);
  }, [currentPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      // Ctrl/Cmd + A to select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && books.length > 0) {
        e.preventDefault();
        handleSelectAll();
      }
      // Delete key to bulk delete
      if (e.key === 'Delete' && selectedBooks.length > 0) {
        e.preventDefault();
        handleBulkDelete();
      }
      // Escape to clear selection
      if (e.key === 'Escape' && selectedBooks.length > 0) {
        e.preventDefault();
        setSelectedBooks([]);
      }
      // Arrow keys for pagination
      if (e.key === 'ArrowLeft' && pagination.hasPrev && !loading) {
        e.preventDefault();
        fetchBooks(currentPage - 1);
      }
      if (e.key === 'ArrowRight' && pagination.hasNext && !loading) {
        e.preventDefault();
        fetchBooks(currentPage + 1);
      }
      // Home/End for first/last page
      if (e.key === 'Home' && pagination.page > 1 && !loading) {
        e.preventDefault();
        fetchBooks(1);
      }
      if (e.key === 'End' && pagination.page < pagination.totalPages && !loading) {
        e.preventDefault();
        fetchBooks(pagination.totalPages);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [books, selectedBooks, pagination, currentPage, loading]);

  if (loading && books.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách sách...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Quản lý Sách
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý danh sách sách trong thư viện
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".xlsx,.xls"
            className="hidden"
          />
          {selectedBooks.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Trash className="h-4 w-4" />
              {bulkDeleting ? 'Đang xóa...' : `Xóa ${selectedBooks.length} mục`}
            </button>
          )}
          <button
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            {downloadingTemplate ? 'Đang tải...' : 'Tải Template'}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {importing ? 'Đang import...' : 'Import Excel'}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Đang export...' : 'Export Excel'}
          </button>
          <Link
            href="/admin/books/new"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <PlusCircle className="h-4 w-4" />
            Thêm sách mới
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sách, tác giả, mã sách..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="AVAILABLE">Có sẵn</option>
            <option value="UNAVAILABLE">Không có sẵn</option>
            <option value="MAINTENANCE">Bảo trì</option>
            <option value="LOST">Mất</option>
            <option value="DAMAGED">Hư hỏng</option>
          </select>
          <input
            type="text"
            placeholder="Thể loại"
            value={filters.genre}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Filter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Xóa bộ lọc
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Import Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Hướng dẫn Import Excel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</div>
            <div>
              <p className="font-medium">Tải Template</p>
              <p className="text-xs">Nhấn nút "Tải Template" để tải file Excel mẫu với định dạng chuẩn</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</div>
            <div>
              <p className="font-medium">Điền thông tin</p>
              <p className="text-xs">Mở file template và điền thông tin sách theo các cột. Các cột có (*) là bắt buộc</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</div>
            <div>
              <p className="font-medium">Import dữ liệu</p>
              <p className="text-xs">Lưu file và nhấn "Import Excel" để tải lên hệ thống</p>
            </div>
          </div>
        </div>
        <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
          <strong>💡 Mẹo:</strong> File template có 3 sheet - "Template Sách" để nhập dữ liệu, "Hướng dẫn" để xem chi tiết các trường, và "Lưu ý quan trọng" về quy tắc import
        </div>
      </div>

      {/* Selection Info */}
      {selectedBooks.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-purple-800">
              <span className="text-sm font-medium">
                Đã chọn {selectedBooks.length} sách
              </span>
              <div className="text-xs text-purple-600 hidden lg:flex items-center gap-3">
                <span>⌨️ Phím tắt:</span>
                <span><kbd className="px-1 py-0.5 bg-purple-100 rounded text-xs">Ctrl+A</kbd> Chọn tất cả</span>
                <span><kbd className="px-1 py-0.5 bg-purple-100 rounded text-xs">Delete</kbd> Xóa</span>
                <span><kbd className="px-1 py-0.5 bg-purple-100 rounded text-xs">Esc</kbd> Bỏ chọn</span>
                <span><kbd className="px-1 py-0.5 bg-purple-100 rounded text-xs">←→</kbd> Chuyển trang</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedBooks([])}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>
      )}

      {/* Books Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin sách
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã sách / ISBN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xuất bản
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {books.map((book) => (
                <tr 
                  key={book.id} 
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedBooks.includes(book.id) ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedBooks.includes(book.id)}
                      onChange={() => handleSelectBook(book.id)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-all"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {book.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        Tác giả: {book.author}
                      </div>
                      {book.genre && (
                        <div className="text-xs text-gray-400">
                          Thể loại: {book.genre}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{book.bookCode}</div>
                    {book.isbn && (
                      <div className="text-xs text-gray-500">ISBN: {book.isbn}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{book.publisher || 'N/A'}</div>
                    {book.publishYear && (
                      <div className="text-xs text-gray-500">Năm: {book.publishYear}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {book.availableQuantity}/{book.quantity}
                    </div>
                    <div className="text-xs text-gray-500">
                      Có sẵn/Tổng số
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(book.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/books/${book.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/books/${book.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(book.id, book.title)}
                        disabled={deleting === book.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Xóa"
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

        {books.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có sách nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              Bắt đầu bằng cách thêm sách mới hoặc import từ Excel.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/books/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Thêm sách mới
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            {/* Mobile pagination */}
            <button
              onClick={() => fetchBooks(currentPage - 1)}
              disabled={!pagination.hasPrev || loading}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => fetchBooks(currentPage + 1)}
              disabled={!pagination.hasNext || loading}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
                  Hiển thị:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700">mục/trang</span>
              </div>
              
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{' '}
                  <span className="font-medium">{((pagination.page - 1) * itemsPerPage) + 1}</span>
                  {' '}đến{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * itemsPerPage, pagination.total)}
                  </span>
                  {' '}trong tổng số{' '}
                  <span className="font-medium">{pagination.total}</span> sách
                </p>
                {pagination.totalPages > 1 && (
                  <div className="text-xs text-gray-500 mt-1 hidden lg:block">
                    ⌨️ <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">←→</kbd> Chuyển trang, 
                    <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs ml-1">Home/End</kbd> Trang đầu/cuối
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {/* First page button */}
                <button
                  onClick={() => fetchBooks(1)}
                  disabled={pagination.page === 1 || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Trang đầu"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                
                {/* Previous page button */}
                <button
                  onClick={() => fetchBooks(currentPage - 1)}
                  disabled={!pagination.hasPrev || loading}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {/* Page numbers */}
                {generatePageNumbers().map((pageNum, index) => (
                  pageNum === '...' ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => fetchBooks(pageNum as number)}
                      disabled={loading}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === pagination.page
                          ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {pageNum}
                    </button>
                  )
                ))}
                
                {/* Next page button */}
                <button
                  onClick={() => fetchBooks(currentPage + 1)}
                  disabled={!pagination.hasNext || loading}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Trang sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                {/* Last page button */}
                <button
                  onClick={() => fetchBooks(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Trang cuối"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </nav>
              
              {/* Go to page */}
              {pagination.totalPages > 5 && (
                <form onSubmit={handleGoToPage} className="ml-4 flex items-center gap-2">
                  <span className="text-sm text-gray-700">Đến trang:</span>
                  <input
                    type="number"
                    min="1"
                    max={pagination.totalPages}
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="1"
                  />
                  <button
                    type="submit"
                    disabled={!goToPage || loading}
                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Đi
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}