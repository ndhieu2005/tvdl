'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import { TagData } from '@/lib/tags';

interface TagManagerProps {
  onTagSelect?: (tag: TagData) => void;
  selectedTags?: string[];
  mode?: 'select' | 'manage';
}

export default function TagManager({ 
  onTagSelect, 
  selectedTags = [], 
  mode = 'manage' 
}: TagManagerProps) {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'normal'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'postCount' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTag, setEditingTag] = useState<TagData | null>(null);

  // Form states
  const [tagForm, setTagForm] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#8B5CF6',
    featured: false,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    metaTitle: '',
    metaDescription: '',
  });

  const loadTags = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder,
      });

      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (featuredFilter === 'featured') params.append('featured', 'true');
      if (featuredFilter === 'normal') params.append('featured', 'false');

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/tags?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success) {
        setTags(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, [currentPage, searchQuery, statusFilter, featuredFilter, sortBy, sortOrder]);

  const handleCreateTag = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(tagForm),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateForm(false);
        setTagForm({
          name: '',
          slug: '',
          description: '',
          color: '#8B5CF6',
          featured: false,
          status: 'ACTIVE',
          metaTitle: '',
          metaDescription: '',
        });
        loadTags();
      } else {
        alert(data.error || 'Lỗi khi tạo tag');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Lỗi khi tạo tag');
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/tags', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ id: editingTag.id, ...tagForm }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingTag(null);
        setTagForm({
          name: '',
          slug: '',
          description: '',
          color: '#8B5CF6',
          featured: false,
          status: 'ACTIVE',
          metaTitle: '',
          metaDescription: '',
        });
        loadTags();
      } else {
        alert(data.error || 'Lỗi khi cập nhật tag');
      }
    } catch (error) {
      console.error('Error updating tag:', error);
      alert('Lỗi khi cập nhật tag');
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tag này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/tags?id=${tagId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });

      const data = await response.json();
      if (data.success) {
        loadTags();
      } else {
        if (data.canForceDelete) {
          if (confirm(`${data.error}. Bạn có muốn xóa bắt buộc không?`)) {
            await handleForceDeleteTag(tagId);
          }
        } else {
          alert(data.error || 'Lỗi khi xóa tag');
        }
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('Lỗi khi xóa tag');
    }
  };

  const handleForceDeleteTag = async (tagId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/tags/${tagId}?force=true`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });

      const data = await response.json();
      if (data.success) {
        loadTags();
      } else {
        alert(data.error || 'Lỗi khi xóa tag');
      }
    } catch (error) {
      console.error('Error force deleting tag:', error);
      alert('Lỗi khi xóa tag');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTagIds.length === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedTagIds.length} tags đã chọn?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/tags/bulk', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          action: 'delete',
          ids: selectedTagIds,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedTagIds([]);
        loadTags();
      } else {
        if (data.canForceDelete) {
          if (confirm(`${data.error}. Bạn có muốn xóa bắt buộc không?`)) {
            await handleBulkForceDelete();
          }
        } else {
          alert(data.error || 'Lỗi khi xóa tags');
        }
      }
    } catch (error) {
      console.error('Error bulk deleting tags:', error);
      alert('Lỗi khi xóa tags');
    }
  };

  const handleBulkForceDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/tags/bulk', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          action: 'delete',
          ids: selectedTagIds,
          force: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedTagIds([]);
        loadTags();
      } else {
        alert(data.error || 'Lỗi khi xóa tags');
      }
    } catch (error) {
      console.error('Error bulk force deleting tags:', error);
      alert('Lỗi khi xóa tags');
    }
  };

  const handleBulkUpdate = async (updateData: any) => {
    if (selectedTagIds.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/tags/bulk', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          action: 'update',
          ids: selectedTagIds,
          data: updateData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedTagIds([]);
        loadTags();
      } else {
        alert(data.error || 'Lỗi khi cập nhật tags');
      }
    } catch (error) {
      console.error('Error bulk updating tags:', error);
      alert('Lỗi khi cập nhật tags');
    }
  };

  const startEdit = (tag: TagData) => {
    setEditingTag(tag);
    setTagForm({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      color: tag.color || '#8B5CF6',
      featured: tag.featured,
      status: tag.status,
      metaTitle: tag.metaTitle || '',
      metaDescription: tag.metaDescription || '',
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setTagForm(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Tags</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus size={20} />
          Tạo Tag
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Không hoạt động</option>
          </select>

          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="featured">Đặc biệt</option>
            <option value="normal">Thường</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name-asc">Tên A-Z</option>
            <option value="name-desc">Tên Z-A</option>
            <option value="postCount-desc">Nhiều bài viết nhất</option>
            <option value="postCount-asc">Ít bài viết nhất</option>
            <option value="createdAt-desc">Mới nhất</option>
            <option value="createdAt-asc">Cũ nhất</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedTagIds.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-md">
            <span className="text-sm font-medium">
              Đã chọn {selectedTagIds.length} tags
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkUpdate({ status: 'ACTIVE' })}
                className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
              >
                Kích hoạt
              </button>
              <button
                onClick={() => handleBulkUpdate({ status: 'INACTIVE' })}
                className="text-sm bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700"
              >
                Vô hiệu hóa
              </button>
              <button
                onClick={() => handleBulkUpdate({ featured: true })}
                className="text-sm bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700"
              >
                Đặc biệt
              </button>
              <button
                onClick={handleBulkDelete}
                className="text-sm bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tags List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedTagIds.length === tags.length && tags.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTagIds(tags.map(tag => tag.id));
                      } else {
                        setSelectedTagIds([]);
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bài viết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTagIds([...selectedTagIds, tag.id]);
                        } else {
                          setSelectedTagIds(selectedTagIds.filter(id => id !== tag.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {tag.name}
                          </span>
                          {tag.featured && (
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">/{tag.slug}</div>
                        {tag.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {tag.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tag.postCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tag.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tag.status === 'ACTIVE' ? (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Hoạt động
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Ẩn
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tag.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(tag)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Trang <span className="font-medium">{currentPage}</span> trên{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateForm || editingTag) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingTag ? 'Chỉnh sửa Tag' : 'Tạo Tag Mới'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Tag *
                </label>
                <input
                  type="text"
                  value={tagForm.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên tag..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={tagForm.slug}
                  onChange={(e) => setTagForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tag-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={tagForm.description}
                  onChange={(e) => setTagForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Mô tả tag..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu sắc
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={tagForm.color}
                    onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tagForm.color}
                    onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#8B5CF6"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tagForm.featured}
                    onChange={(e) => setTagForm(prev => ({ ...prev, featured: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Tag đặc biệt</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tagForm.status === 'ACTIVE'}
                    onChange={(e) => setTagForm(prev => ({ 
                      ...prev, 
                      status: e.target.checked ? 'ACTIVE' : 'INACTIVE' 
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Hoạt động</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={tagForm.metaTitle}
                  onChange={(e) => setTagForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="SEO title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  value={tagForm.metaDescription}
                  onChange={(e) => setTagForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="SEO description..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingTag ? handleUpdateTag : handleCreateTag}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
              >
                {editingTag ? 'Cập nhật' : 'Tạo Tag'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingTag(null);
                  setTagForm({
                    name: '',
                    slug: '',
                    description: '',
                    color: '#8B5CF6',
                    featured: false,
                    status: 'ACTIVE',
                    metaTitle: '',
                    metaDescription: '',
                  });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}