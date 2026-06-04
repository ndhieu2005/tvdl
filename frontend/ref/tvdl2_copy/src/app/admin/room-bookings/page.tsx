'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MapPin
} from 'lucide-react';
import { getRoomNameByType, ROOM_TYPE_OPTIONS, RoomType } from '@/app/services/room-booking/const';
import { ROOM_BOOKING_STATUS, ROOM_BOOKING_STATUS_COLORS, ROOM_BOOKING_STATUS_LABELS } from '@/app/api/services/room-booking/const';
import clsx from 'clsx';

interface RoomBooking {
  id: string;
  fullName: string;
  cardNumber: string;
  phone: string;
  email: string;
  roomType: RoomType;
  bookingDate: string;
  timeSlot: string;
  duration: number;
  purpose: string;
  participants: number;
  specialRequests?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function RoomBookingsPage() {
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpToPage, setJumpToPage] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [pagination.page, statusFilter, roomTypeFilter, itemsPerPage]);

  // Reset to page 1 when filters or items per page change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [statusFilter, roomTypeFilter, itemsPerPage]);

  // Keyboard navigation for pagination
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if no input is focused
      if (document.activeElement?.tagName === 'INPUT') return;
      
      if (e.key === 'ArrowLeft' && pagination.hasPrev) {
        e.preventDefault();
        goToPrevPage();
      } else if (e.key === 'ArrowRight' && pagination.hasNext) {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === 'Home' && pagination.page !== 1) {
        e.preventDefault();
        goToFirstPage();
      } else if (e.key === 'End' && pagination.page !== pagination.totalPages) {
        e.preventDefault();
        goToLastPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pagination.hasPrev, pagination.hasNext, pagination.page, pagination.totalPages]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: itemsPerPage.toString(),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(roomTypeFilter && roomTypeFilter !== 'all' && { roomType: roomTypeFilter })
      });

      const response = await fetch(`/api/services/room-booking?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination helpers
  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(pagination.totalPages);
  const goToPrevPage = () => goToPage(pagination.page - 1);
  const goToNextPage = () => goToPage(pagination.page + 1);

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpToPage);
    if (pageNum >= 1 && pageNum <= pagination.totalPages) {
      goToPage(pageNum);
      setJumpToPage('');
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const current = pagination.page;
    const total = pagination.totalPages;
    const delta = 2; // Number of pages to show on each side of current page
    
    let pages: (number | string)[] = [];
    
    if (total <= 7) {
      // Show all pages if total is small
      pages = Array.from({ length: total }, (_, i) => i + 1);
    } else {
      // Show first page
      pages.push(1);
      
      // Show dots if needed
      if (current > delta + 2) {
        pages.push('...');
      }
      
      // Show pages around current
      const start = Math.max(2, current - delta);
      const end = Math.min(total - 1, current + delta);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Show dots if needed
      if (current < total - delta - 1) {
        pages.push('...');
      }
      
      // Show last page
      if (total > 1) {
        pages.push(total);
      }
    }
    
    return pages;
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/room-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchBookings(); // Refresh the list
      } else {
        alert('Có lỗi xảy ra khi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đặt phòng</h1>
          <p className="text-gray-600">Quản lý các yêu cầu đặt phòng từ người dùng</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm theo tên, email, SĐT"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value={ROOM_BOOKING_STATUS.PENDING}>{ROOM_BOOKING_STATUS_LABELS.PENDING}</SelectItem>
                <SelectItem value={ROOM_BOOKING_STATUS.APPROVED}>{ROOM_BOOKING_STATUS_LABELS.APPROVED}</SelectItem>
                <SelectItem value={ROOM_BOOKING_STATUS.REJECTED}>{ROOM_BOOKING_STATUS_LABELS.REJECTED}</SelectItem>
                <SelectItem value={ROOM_BOOKING_STATUS.CANCELLED}>{ROOM_BOOKING_STATUS_LABELS.CANCELLED}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo loại phòng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại phòng</SelectItem>
                {ROOM_TYPE_OPTIONS.map((item) => (<SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>))}
              </SelectContent>
            </Select>

            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Số lượng / trang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / trang</SelectItem>
                <SelectItem value="20">20 / trang</SelectItem>
                <SelectItem value="50">50 / trang</SelectItem>
                <SelectItem value="100">100 / trang</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchBookings} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle>
              Danh sách đặt phòng
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                <span className="font-medium">{pagination.total}</span> kết quả
              </span>
              {pagination.totalPages > 1 && (
                <span>
                  Trang <span className="font-medium">{pagination.page}</span> / <span className="font-medium">{pagination.totalPages}</span>
                </span>
              )}
              <span>
                <span className="font-medium">{itemsPerPage}</span> / trang
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có đặt phòng nào</h3>
              <p className="mt-1 text-sm text-gray-500">
                Chưa có yêu cầu đặt phòng nào được tìm thấy.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md">
                  {/* Header với tên và trạng thái */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{`${booking.cardNumber} | ${booking.fullName}`}</h3>
                      <Badge className={clsx('pointer-events-none', ROOM_BOOKING_STATUS_COLORS[booking.status as keyof typeof ROOM_BOOKING_STATUS_COLORS])}>
                        {ROOM_BOOKING_STATUS_LABELS[booking.status as keyof typeof ROOM_BOOKING_STATUS_LABELS]}
                      </Badge>
                    </div>
                    
                    {/* Action buttons - responsive */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {booking.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(booking.id, ROOM_BOOKING_STATUS.APPROVED)}
                            className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Duyệt</span>
                            <span className="sm:hidden">✓</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(booking.id, ROOM_BOOKING_STATUS.REJECTED)}
                            className="text-xs sm:text-sm"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Từ chối</span>
                            <span className="sm:hidden">✗</span>
                          </Button>
                        </>
                      )}

                    </div>
                  </div>

                  {/* Main content grid - phân bố đều và responsive */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Cột 1: Thông tin đặt phòng */}
                    <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 text-sm uppercase tracking-wide border-b border-blue-200 pb-2">Thông tin đặt phòng</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">{getRoomNameByType(booking.roomType)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">{new Date(booking.bookingDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">{booking.timeSlot}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">{booking.participants} người</span>
                        </div>
                        {/* <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">{booking.duration || 'N/A'} giờ</span>
                        </div> */}
                      </div>
                    </div>

                    {/* Cột 2: Thông tin liên hệ */}
                    <div className="space-y-3 bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 text-sm uppercase tracking-wide border-b border-green-200 pb-2">Thông tin liên hệ</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-gray-500">Email:</span>
                          <p className="text-gray-900 font-medium">{booking.email}</p>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Số điện thoại:</span>
                          <p className="text-gray-900 font-medium">{booking.phone}</p>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Đăng ký lúc:</span>
                          <p className="text-gray-600">{new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Cột 3: Mục đích và yêu cầu */}
                    <div className="space-y-3 bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900 text-sm uppercase tracking-wide border-b border-purple-200 pb-2">Mục đích & Yêu cầu</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-gray-500">Mục đích:</span>
                          <p className="text-gray-900">{booking.purpose}</p>
                        </div>
                        {booking.specialRequests && (
                          <div className="text-sm">
                            <span className="text-gray-500">Yêu cầu đặc biệt:</span>
                            <p className="text-gray-900">{booking.specialRequests}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Results info */}
              <div className="text-sm text-gray-700">
                Hiển thị {((pagination.page - 1) * itemsPerPage) + 1} đến{' '}
                {Math.min(pagination.page * itemsPerPage, pagination.total)} trong tổng số{' '}
                <span className="font-medium">{pagination.total}</span> kết quả
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-1">
                {/* First page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={pagination.page === 1}
                  className="hidden sm:flex"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Trước</span>
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum, index) => (
                    <React.Fragment key={index}>
                      {pageNum === '...' ? (
                        <span className="px-2 py-1 text-gray-500">...</span>
                      ) : (
                        <Button
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum as number)}
                          className="min-w-[40px]"
                        >
                          {pageNum}
                        </Button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Next page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={!pagination.hasNext}
                >
                  <span className="hidden sm:inline mr-1">Sau</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={pagination.page === pagination.totalPages}
                  className="hidden sm:flex"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile-friendly page info */}
            <div className="sm:hidden text-center text-sm text-gray-500 mt-2">
              Trang {pagination.page} / {pagination.totalPages}
            </div>

            {/* Jump to page - only show if there are many pages */}
            {pagination.totalPages > 10 && (
              <div className="flex flex-col items-center gap-2 mt-4 pt-4 border-t">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-600">Đi đến trang:</span>
                  <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max={pagination.totalPages}
                      value={jumpToPage}
                      onChange={(e) => setJumpToPage(e.target.value)}
                      placeholder="Số trang"
                      className="w-20 h-8 text-center"
                    />
                    <Button type="submit" size="sm" variant="outline">
                      Đi
                    </Button>
                  </form>
                  <span className="text-sm text-gray-500">
                    (1-{pagination.totalPages})
                  </span>
                </div>
                
                {/* Keyboard shortcuts hint */}
                <div className="text-xs text-gray-400 text-center">
                  Phím tắt: ← → (Trước/Sau) | Home/End (Đầu/Cuối)
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}