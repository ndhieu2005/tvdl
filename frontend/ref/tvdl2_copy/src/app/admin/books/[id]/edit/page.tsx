'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface BookFormData {
  title: string;
  author: string;
  description: string;
  coverImage: string;
  bookCode: string;
  isbn: string;
  publisher: string;
  publishYear: string;
  genre: string;
  pages: string;
  quantity: string;
  availableQuantity: string;
  location: string;
  status: string;
  metaTitle: string;
  metaDescription: string;
}

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
  metaTitle?: string;
  metaDescription?: string;
}

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    description: '',
    coverImage: '',
    bookCode: '',
    isbn: '',
    publisher: '',
    publishYear: '',
    genre: '',
    pages: '',
    quantity: '',
    availableQuantity: '',
    location: '',
    status: 'AVAILABLE',
    metaTitle: '',
    metaDescription: ''
  });

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bạn cần đăng nhập để chỉnh sửa sách');
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
        const book: Book = data.data;
        setFormData({
          title: book.title,
          author: book.author,
          description: book.description || '',
          coverImage: book.coverImage || '',
          bookCode: book.bookCode,
          isbn: book.isbn || '',
          publisher: book.publisher || '',
          publishYear: book.publishYear ? book.publishYear.toString() : '',
          genre: book.genre || '',
          pages: book.pages ? book.pages.toString() : '',
          quantity: book.quantity.toString(),
          availableQuantity: book.availableQuantity.toString(),
          location: book.location || '',
          status: book.status,
          metaTitle: book.metaTitle || '',
          metaDescription: book.metaDescription || ''
        });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.bookCode) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc: Tên sách, Tác giả, Mã sách');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bạn cần đăng nhập để cập nhật sách');
        return;
      }

      // Prepare data for API
      const bookData = {
        title: formData.title,
        author: formData.author,
        description: formData.description || null,
        coverImage: formData.coverImage || null,
        bookCode: formData.bookCode,
        isbn: formData.isbn || null,
        publisher: formData.publisher || null,
        publishYear: formData.publishYear ? parseInt(formData.publishYear) : null,
        genre: formData.genre || null,
        pages: formData.pages ? parseInt(formData.pages) : null,
        quantity: parseInt(formData.quantity) || 1,
        availableQuantity: parseInt(formData.availableQuantity) || 0,
        location: formData.location || null,
        status: formData.status,
        metaTitle: formData.metaTitle || null,
        metaDescription: formData.metaDescription || null
      };

      const response = await fetch(`/api/admin/books/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Lỗi khi cập nhật sách');
      }

      if (result.success) {
        alert('Cập nhật sách thành công!');
        router.push(`/admin/books/${params.id}`);
      } else {
        setError(result.error || 'Lỗi khi cập nhật sách');
      }
    } catch (error) {
      console.error('Error updating book:', error);
      setError(error instanceof Error ? error.message : 'Lỗi không xác định');
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/admin/books/${params.id}`}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Chỉnh sửa sách
          </h1>
          <p className="text-gray-600 mt-1">
            Cập nhật thông tin sách
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên sách <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tên sách"
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                  Tác giả <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tên tác giả"
                />
              </div>

              <div>
                <label htmlFor="bookCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Mã sách <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="bookCode"
                  name="bookCode"
                  value={formData.bookCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập mã sách (unique)"
                />
              </div>

              <div>
                <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
                  ISBN
                </label>
                <input
                  type="text"
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập ISBN"
                />
              </div>

              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                  Thể loại
                </label>
                <input
                  type="text"
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập thể loại sách"
                />
              </div>

              <div>
                <ImageUpload
                  value={formData.coverImage}
                  onChange={(url) => setFormData(prev => ({ ...prev, coverImage: url }))}
                  folder="books"
                  label="Hình ảnh bìa sách"
                  placeholder="Kéo thả hình ảnh hoặc chọn file"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả sách
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nhập mô tả về nội dung sách"
              />
            </div>
          </div>

          {/* Publishing Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin xuất bản</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-2">
                  Nhà xuất bản
                </label>
                <input
                  type="text"
                  id="publisher"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tên nhà xuất bản"
                />
              </div>

              <div>
                <label htmlFor="publishYear" className="block text-sm font-medium text-gray-700 mb-2">
                  Năm xuất bản
                </label>
                <input
                  type="number"
                  id="publishYear"
                  name="publishYear"
                  value={formData.publishYear}
                  onChange={handleInputChange}
                  min="1000"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="2024"
                />
              </div>

              <div>
                <label htmlFor="pages" className="block text-sm font-medium text-gray-700 mb-2">
                  Số trang
                </label>
                <input
                  type="number"
                  id="pages"
                  name="pages"
                  value={formData.pages}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="300"
                />
              </div>
            </div>
          </div>

          {/* Management Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin quản lý</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng số lượng
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="1"
                />
              </div>

              <div>
                <label htmlFor="availableQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng có sẵn
                </label>
                <input
                  type="number"
                  id="availableQuantity"
                  name="availableQuantity"
                  value={formData.availableQuantity}
                  onChange={handleInputChange}
                  min="0"
                  max={parseInt(formData.quantity) || 0}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="1"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Vị trí trong thư viện
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Kệ A1, Tầng 2"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="AVAILABLE">Có sẵn</option>
                  <option value="UNAVAILABLE">Không có sẵn</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                  <option value="LOST">Mất</option>
                  <option value="DAMAGED">Hư hỏng</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEO Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO (Tùy chọn)</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Tiêu đề SEO cho sách"
                />
              </div>

              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Mô tả SEO cho sách"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Link
              href={`/admin/books/${params.id}`}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Đang lưu...' : 'Cập nhật sách'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}