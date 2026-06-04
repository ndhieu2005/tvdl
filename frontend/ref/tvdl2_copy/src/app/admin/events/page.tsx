'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Users, FileText, Download, Plus, Edit, Trash2, MapPin, ChevronLeft, ChevronRight, Copy } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description?: string;
  location: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  maxParticipants?: number;
  currentParticipants: number;
  registrationRequired: boolean;
  status: 'DRAFT' | 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  featured: boolean;
  featuredImage?: string;
  color?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  publicNotes?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SCHEDULED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800'
};

const statusLabels = {
  DRAFT: 'Bản nháp',
  SCHEDULED: 'Đã lên lịch',
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Đã hoàn thành'
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [pageSize, setPageSize] = useState(10); // 10 events per page

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    duration: '',
    maxParticipants: '',
    registrationRequired: false,
    status: 'DRAFT',
    featured: false,
    featuredImage: '',
    color: '#033b93',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    publicNotes: ''
  });

  // Get auth token
  const getAuthToken = () => {
    // Try both 'token' and 'adminToken' keys for compatibility
    return localStorage.getItem('token') || localStorage.getItem('adminToken') || '';
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      
      const response = await fetch(`/api/services/events?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data);
        
        // Update pagination info
        setTotalEvents(data.total || data.data.length);
        setTotalPages(data.totalPages || Math.ceil((data.total || data.data.length) / pageSize));
      } else {
        setError(data.error || 'Lỗi khi tải dữ liệu');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  // Create event
  const createEvent = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Vui lòng đăng nhập lại để tiếp tục');
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch('/api/services/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowCreateDialog(false);
        resetForm();
        setCurrentPage(1); // Go to first page to see new event
        fetchEvents();
        alert('Tạo sự kiện thành công!');
      } else {
        if (response.status === 401 || response.status === 403) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          window.location.href = '/admin/login';
        } else {
          alert(data.error || 'Lỗi khi tạo sự kiện');
        }
      }
    } catch (err) {
      console.error('Create event error:', err);
      alert('Lỗi kết nối');
    }
  };

  // Update event
  const updateEvent = async () => {
    if (!editingEvent) return;

    try {
      const response = await fetch(`/api/services/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowEditDialog(false);
        setEditingEvent(null);
        resetForm();
        fetchEvents();
      } else {
        alert(data.error || 'Lỗi khi cập nhật sự kiện');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  // Update event status
  const updateEventStatus = async (eventId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/services/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchEvents();
      } else {
        alert(data.error || 'Lỗi khi cập nhật trạng thái');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  // Delete event
  const deleteEvent = async (eventId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) return;

    try {
      const response = await fetch(`/api/services/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchEvents();
      } else {
        alert(data.error || 'Lỗi khi xóa sự kiện');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);
      params.append('export', 'excel');
      
      const response = await fetch(`/api/services/events?${params.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `events-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        alert('Lỗi khi xuất file Excel');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      duration: '',
      maxParticipants: '',
      registrationRequired: false,
      status: 'DRAFT',
      featured: false,
      featuredImage: '',
      color: '#033b93',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      publicNotes: ''
    });
  };

  // Open edit dialog
  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      location: event.location,
      eventDate: new Date(event.eventDate).toISOString().split('T')[0],
      startTime: event.startTime,
      endTime: event.endTime || '',
      duration: event.duration?.toString() || '',
      maxParticipants: event.maxParticipants?.toString() || '',
      registrationRequired: event.registrationRequired,
      status: event.status,
      featured: event.featured,
      featuredImage: event.featuredImage || '',
      color: event.color || '#033b93',
      contactPerson: event.contactPerson || '',
      contactPhone: event.contactPhone || '',
      contactEmail: event.contactEmail || '',
      publicNotes: event.publicNotes || ''
    });
    setShowEditDialog(true);
  };

  // Duplicate event
  const duplicateEvent = (event: Event) => {
    // Get current date and time for the duplicated event
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    setFormData({
      title: `${event.title} (Bản sao)`,
      description: event.description || '',
      location: event.location,
      eventDate: currentDate, // Set to current date
      startTime: currentTime, // Set to current time
      endTime: event.endTime || '',
      duration: event.duration?.toString() || '',
      maxParticipants: event.maxParticipants?.toString() || '',
      registrationRequired: event.registrationRequired,
      status: 'DRAFT', // Always set to DRAFT for duplicated events
      featured: false, // Don't duplicate featured status
      featuredImage: event.featuredImage || '',
      color: event.color || '#033b93', // Keep the same color
      contactPerson: event.contactPerson || '',
      contactPhone: event.contactPhone || '',
      contactEmail: event.contactEmail || '',
      publicNotes: event.publicNotes || ''
    });
    setShowCreateDialog(true);
  };

  // Reset to page 1 when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, pageSize]);

  useEffect(() => {
    fetchEvents();
  }, [currentPage, searchTerm, statusFilter, dateFilter, pageSize]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 truncate">Quản lý sự kiện</h1>
            <p className="text-sm sm:text-base text-gray-600">Tạo và quản lý các sự kiện của thư viện</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm font-medium">
                <Plus className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Tạo sự kiện mới</span>
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay className="modal-overlay-blur data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-[95vw] max-w-lg sm:max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Tạo sự kiện mới</DialogTitle>
                <DialogDescription className="text-sm">
                  Điền thông tin để tạo sự kiện mới
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Title and Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">Tiêu đề sự kiện *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Nhập tiêu đề sự kiện"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium">Địa điểm *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Nhập địa điểm tổ chức"
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-sm font-medium">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Mô tả chi tiết về sự kiện"
                    rows={3}
                    className="text-sm"
                  />
                </div>

                {/* Date and Time */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="eventDate" className="text-sm font-medium">Ngày tổ chức *</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime" className="text-sm font-medium">Giờ bắt đầu *</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime" className="text-sm font-medium">Giờ kết thúc</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Max Participants and Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxParticipants" className="text-sm font-medium">Số người tối đa</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                      placeholder="Không giới hạn"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-sm font-medium">Trạng thái</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Bản nháp</SelectItem>
                        <SelectItem value="SCHEDULED">Đã lên lịch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactPerson" className="text-sm font-medium">Người liên hệ</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      placeholder="Tên người liên hệ"
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPhone" className="text-sm font-medium">SĐT liên hệ</Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                        placeholder="Số điện thoại"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail" className="text-sm font-medium">Email liên hệ</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                        placeholder="Email liên hệ"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Switches */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="registrationRequired"
                      checked={formData.registrationRequired}
                      onCheckedChange={(checked) => setFormData({...formData, registrationRequired: checked})}
                    />
                    <Label htmlFor="registrationRequired" className="text-sm">Yêu cầu đăng ký</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
                    />
                    <Label htmlFor="featured" className="text-sm">Sự kiện nổi bật</Label>
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <Label htmlFor="color" className="text-sm font-medium">Màu sắc sự kiện</Label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
                    <input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer flex-shrink-0"
                    />
                    <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2">
                        {['#033b93', '#fac300', '#EF4444', '#8B5CF6', '#1ba3f8', '#84CC16'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({...formData, color})}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:border-gray-500'
                          }`}
                          style={{ backgroundColor: color }}
                          title={`Chọn màu ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Chọn màu hiển thị cho sự kiện trên lịch</p>
                </div>

                {/* Public Notes */}
                <div>
                  <Label htmlFor="publicNotes" className="text-sm font-medium">Ghi chú công khai</Label>
                  <Textarea
                    id="publicNotes"
                    value={formData.publicNotes}
                    onChange={(e) => setFormData({...formData, publicNotes: e.target.value})}
                    placeholder="Ghi chú hiển thị công khai"
                    rows={2}
                    className="text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    className="w-full sm:w-auto text-sm"
                  >
                    Hủy
                  </Button>
                  <Button 
                    onClick={createEvent}
                    className="w-full sm:w-auto text-sm"
                  >
                    Tạo sự kiện
                  </Button>
                </div>
              </div>
              </DialogContent>
            </DialogPortal>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Row 1: Search and Status */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Tìm kiếm theo tiêu đề, mô tả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="DRAFT">Bản nháp</SelectItem>
                      <SelectItem value="SCHEDULED">Đã lên lịch</SelectItem>
                      <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                      <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Row 2: Date, Page Size and Export */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 sm:flex-initial sm:w-40">
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="flex-1 sm:flex-initial sm:w-40">
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Số lượng/trang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 / trang</SelectItem>
                      <SelectItem value="10">10 / trang</SelectItem>
                      <SelectItem value="20">20 / trang</SelectItem>
                      <SelectItem value="50">50 / trang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={exportToExcel} variant="outline" className="w-full sm:w-auto flex items-center justify-center space-x-2 text-sm font-medium">
                  <Download className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Xuất Excel</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Events List */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">Danh sách sự kiện ({totalEvents})</CardTitle>
            <CardDescription className="text-sm">
              Sắp xếp theo thời gian tạo gần nhất - Trang {currentPage} / {totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {events.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-500">Không có sự kiện nào</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {events.map((event, index) => (
                  <div key={event.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                              {event.title}
                            </h3>
                            {event.featured && (
                              <Badge className="self-start bg-yellow-100 text-yellow-800 text-xs">Nổi bật</Badge>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{new Date(event.eventDate).toLocaleDateString('vi-VN')}</span>
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{event.startTime} {event.endTime && `- ${event.endTime}`}</span>
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </span>
                            {event.maxParticipants && (
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{event.currentParticipants}/{event.maxParticipants}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <Badge className={`${statusColors[event.status]} text-xs whitespace-nowrap`}>
                          {statusLabels[event.status]}
                        </Badge>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => duplicateEvent(event)}
                            title="Nhân bản sự kiện"
                            className="text-green-600 hover:text-green-700 hover:border-green-300 p-2"
                          >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(event)}
                            title="Chỉnh sửa sự kiện"
                            className="p-2"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteEvent(event.id)}
                            title="Xóa sự kiện"
                            className="text-red-600 hover:text-red-700 hover:border-red-300 p-2"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {event.description && (
                      <div className="mb-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Mô tả: </span>
                        {event.description.length > 100 
                          ? `${event.description.substring(0, 100)}...` 
                          : event.description
                        }
                      </div>
                    )}

                    {/* Contact Info */}
                    {(event.contactPerson || event.contactPhone || event.contactEmail) && (
                      <div className="mb-3 text-sm text-gray-600">
                        <span className="font-medium">Liên hệ: </span>
                        {event.contactPerson && <span>{event.contactPerson}</span>}
                        {event.contactPhone && <span> - {event.contactPhone}</span>}
                        {event.contactEmail && <span> - {event.contactEmail}</span>}
                      </div>
                    )}

                    {/* Creation Date */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Tạo: {new Date(event.createdAt).toLocaleString('vi-VN')}</span>
                      <div className="flex space-x-1">
                        {event.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            onClick={() => updateEventStatus(event.id, 'SCHEDULED')}
                            className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-6"
                          >
                            Lên lịch
                          </Button>
                        )}
                        {event.status === 'SCHEDULED' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateEventStatus(event.id, 'COMPLETED')}
                              className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 h-6"
                            >
                              Hoàn thành
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateEventStatus(event.id, 'CANCELLED')}
                              className="text-xs px-2 py-1 h-6"
                            >
                              Hủy
                            </Button>
                          </>
                        )}
                        {event.status === 'CANCELLED' && (
                          <Button
                            size="sm"
                            onClick={() => updateEventStatus(event.id, 'SCHEDULED')}
                            className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-6"
                          >
                            Khôi phục
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-500">
                  Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalEvents)} trong tổng số {totalEvents} sự kiện
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Trước
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <Button
                          variant={1 === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(1)}
                        >
                          1
                        </Button>
                        {currentPage > 4 && <span className="text-gray-400">...</span>}
                      </>
                    )}
                    
                    {/* Pages around current page */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && <span className="text-gray-400">...</span>}
                        <Button
                          variant={totalPages === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogPortal>
            <DialogOverlay className="modal-overlay-blur data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-[95vw] max-w-lg sm:max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Chỉnh sửa sự kiện</DialogTitle>
              <DialogDescription className="text-sm">
                Cập nhật thông tin sự kiện
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Title and Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title" className="text-sm font-medium">Tiêu đề sự kiện *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Nhập tiêu đề sự kiện"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-location" className="text-sm font-medium">Địa điểm *</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Nhập địa điểm tổ chức"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="edit-description" className="text-sm font-medium">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Mô tả chi tiết về sự kiện"
                  rows={3}
                  className="text-sm"
                />
              </div>

              {/* Date and Time */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-eventDate" className="text-sm font-medium">Ngày tổ chức *</Label>
                  <Input
                    id="edit-eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-startTime" className="text-sm font-medium">Giờ bắt đầu *</Label>
                    <Input
                      id="edit-startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-endTime" className="text-sm font-medium">Giờ kết thúc</Label>
                    <Input
                      id="edit-endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Max Participants and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-maxParticipants" className="text-sm font-medium">Số người tối đa</Label>
                  <Input
                    id="edit-maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                    placeholder="Không giới hạn"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status" className="text-sm font-medium">Trạng thái</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Bản nháp</SelectItem>
                      <SelectItem value="SCHEDULED">Đã lên lịch</SelectItem>
                      <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                      <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-contactPerson" className="text-sm font-medium">Người liên hệ</Label>
                  <Input
                    id="edit-contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    placeholder="Tên người liên hệ"
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-contactPhone" className="text-sm font-medium">SĐT liên hệ</Label>
                    <Input
                      id="edit-contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                      placeholder="Số điện thoại"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-contactEmail" className="text-sm font-medium">Email liên hệ</Label>
                    <Input
                      id="edit-contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                      placeholder="Email liên hệ"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Switches */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-registrationRequired"
                    checked={formData.registrationRequired}
                    onCheckedChange={(checked) => setFormData({...formData, registrationRequired: checked})}
                  />
                  <Label htmlFor="edit-registrationRequired" className="text-sm">Yêu cầu đăng ký</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
                  />
                  <Label htmlFor="edit-featured" className="text-sm">Sự kiện nổi bật</Label>
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <Label htmlFor="edit-color" className="text-sm font-medium">Màu sắc sự kiện</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
                  <input
                    id="edit-color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer flex-shrink-0"
                  />
                  <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2">
                      {['#033b93', '#fac300', '#EF4444', '#8B5CF6', '#1ba3f8', '#84CC16'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({...formData, color})}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: color }}
                        title={`Chọn màu ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Chọn màu hiển thị cho sự kiện trên lịch</p>
              </div>

              {/* Public Notes */}
              <div>
                <Label htmlFor="edit-publicNotes" className="text-sm font-medium">Ghi chú công khai</Label>
                <Textarea
                  id="edit-publicNotes"
                  value={formData.publicNotes}
                  onChange={(e) => setFormData({...formData, publicNotes: e.target.value})}
                  placeholder="Ghi chú hiển thị công khai"
                  rows={2}
                  className="text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                  className="w-full sm:w-auto text-sm"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={updateEvent}
                  className="w-full sm:w-auto text-sm"
                >
                  Cập nhật
                </Button>
              </div>
            </div>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </div>
    </div>
  );
}