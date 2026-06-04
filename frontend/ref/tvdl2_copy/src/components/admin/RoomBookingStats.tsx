/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { ROOM_BOOKING_STATUS, ROOM_BOOKING_STATUS_COLORS, ROOM_BOOKING_STATUS_LABELS } from '@/app/api/services/room-booking/const';
import { getRoomNameByType, RoomType } from '@/app/services/room-booking/const';

interface RoomBookingStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byRoomType: { [key: string]: number };
  recentBookings: RecentBooking[];
}

interface RecentBooking {
  id: string;
  fullName: string;
  roomType: RoomType;
  bookingDate: string;
  timeSlot: string;
  status: string;
  createdAt: string;
}


export default function RoomBookingStats() {
  const [stats, setStats] = useState<RoomBookingStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    byRoomType: {},
    recentBookings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all bookings to calculate stats
      const response = await fetch('/api/services/room-booking?limit=1000');
      const data = await response.json();
      
      if (data.success) {
        const bookings = data.data;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const stats: RoomBookingStats = {
          total: bookings.length,
          pending: bookings.filter((b: any) => b.status === ROOM_BOOKING_STATUS.PENDING).length,
          approved: bookings.filter((b: any) => b.status === ROOM_BOOKING_STATUS.APPROVED).length,
          rejected: bookings.filter((b: any) => b.status === ROOM_BOOKING_STATUS.REJECTED).length,
          today: bookings.filter((b: any) => {
            const bookingDate = new Date(b.bookingDate);
            return bookingDate >= today && bookingDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          }).length,
          thisWeek: bookings.filter((b: any) => {
            const bookingDate = new Date(b.bookingDate);
            return bookingDate >= weekStart;
          }).length,
          thisMonth: bookings.filter((b: any) => {
            const bookingDate = new Date(b.bookingDate);
            return bookingDate >= monthStart;
          }).length,
          byRoomType: bookings.reduce((acc: any, booking: any) => {
            acc[booking.roomType] = (acc[booking.roomType] || 0) + 1;
            return acc;
          }, {}),
          recentBookings: bookings
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
        };
        
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching room booking stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng đặt phòng</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Chờ xử lý</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Đã duyệt</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Từ chối</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time-based Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Hôm nay</p>
                <p className="text-xl font-semibold text-gray-900">{stats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tuần này</p>
                <p className="text-xl font-semibold text-gray-900">{stats.thisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tháng này</p>
                <p className="text-xl font-semibold text-gray-900">{stats.thisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Room Type Distribution */}
 

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Đặt phòng gần đây
              </div>
              <Button asChild variant="outline" size="sm">
                <a href="/admin/room-bookings">Xem tất cả</a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{booking.fullName}</span>
                      <span className={`text-xs font-medium ${ROOM_BOOKING_STATUS_COLORS[booking.status as keyof typeof ROOM_BOOKING_STATUS_COLORS]}`}>
                        {ROOM_BOOKING_STATUS_LABELS[booking.status as keyof typeof ROOM_BOOKING_STATUS_LABELS]}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {getRoomNameByType(booking.roomType)} • {' '}
                      {new Date(booking.bookingDate).toLocaleDateString('vi-VN')} • {' '}
                      {booking.timeSlot}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(booking.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href="/admin/room-bookings">
                <Calendar className="h-4 w-4 mr-2" />
                Quản lý đặt phòng
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/admin/room-bookings/calendar">
                <Clock className="h-4 w-4 mr-2" />
                Xem lịch
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/admin/room-bookings?status=PENDING">
                <AlertCircle className="h-4 w-4 mr-2" />
                Chờ xử lý ({stats.pending})
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}