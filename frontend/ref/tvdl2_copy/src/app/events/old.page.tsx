'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight, Plus, Star } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description?: string;
  location: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: string;
  featured?: boolean;
  color?: string;
  type: 'event';
}

interface RoomBooking {
  id: string;
  fullName: string;
  roomType: string;
  bookingDate: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  participants: number;
  purpose: string;
  status: string;
  type: 'booking';
}

type CalendarItem = Event | RoomBooking;

const monthNames = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export default function EventsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState<Event[]>([]);
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<CalendarItem[]>([]);
  
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Fetch events and room bookings
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch events
      const eventsResponse = await fetch(`/api/public/events?status=SCHEDULED&month=${currentMonth + 1}&year=${currentYear}`);
      const eventsData = await eventsResponse.json();
      
      // Fetch confirmed room bookings
      const bookingsResponse = await fetch(`/api/services/room-booking?status=CONFIRMED&month=${currentMonth + 1}&year=${currentYear}`);
      const bookingsData = await bookingsResponse.json();
      
      if (eventsData.success) {
        setEvents(eventsData.data.map((event: any) => ({ ...event, type: 'event' })));
      }
      
      if (bookingsData.success) {
        setRoomBookings(bookingsData.data.map((booking: any) => ({ ...booking, type: 'booking' })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Combine events and room bookings for current month
  const currentMonthItems: CalendarItem[] = [
    ...events.filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    }),
    ...roomBookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    })
  ];

  // Generate calendar days
  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getItemsForDay = (day: number): CalendarItem[] => {
    if (!day) return [];
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.eventDate).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
    
    const dayBookings = roomBookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate).toISOString().split('T')[0];
      return bookingDate === dateStr;
    });
    
    return [...dayEvents, ...dayBookings];
  };

  // Handle day click
  const handleDayClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayItems = getItemsForDay(day);
    
    setSelectedDate(dateStr);
    setSelectedItems(dayItems);
  };

  // Use effect to fetch data when month/year changes
  useEffect(() => {
    fetchData();
  }, [currentMonth, currentYear]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Lịch hoạt động</h1>
          <p className="text-lg text-gray-600">Theo dõi các sự kiện và hoạt động của thư viện</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-6 w-6 text-blue-600" />
                    {monthNames[currentMonth]} {currentYear}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={prevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                    <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendar().map((day, index) => {
                    const dayItems = day ? getItemsForDay(day) : [];
                    const dateStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                    const isSelected = selectedDate === dateStr;
                    
                    return (
                      <div 
                        key={index} 
                        className={`min-h-[80px] p-1 border rounded cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => day && handleDayClick(day)}
                      >
                        {day && (
                          <>
                            <div className={`text-sm font-medium mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                              {day}
                            </div>
                            {dayItems.map(item => (
                              <div 
                                key={`${item.type}-${item.id}`} 
                                className={`text-xs px-1 py-0.5 rounded mb-1 truncate flex items-center ${
                                  item.type === 'event' 
                                    ? 'text-white font-medium' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                                style={item.type === 'event' ? { 
                                  backgroundColor: (item as Event).color || '#3B82F6',
                                  border: (item as Event).featured ? '2px solid #F59E0B' : 'none'
                                } : {}}
                              >
                                {item.type === 'event' && (item as Event).featured && (
                                  <Star className="h-2 w-2 mr-1 text-yellow-300 fill-current" />
                                )}
                                {item.type === 'event' 
                                  ? (item as Event).title 
                                  : `Phòng: ${(item as RoomBooking).fullName}`
                                }
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events list */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {selectedDate 
                      ? `Sự kiện ngày ${new Date(selectedDate).toLocaleDateString('vi-VN')}` 
                      : 'Sự kiện tháng này'
                    }
                  </span>
                  {selectedDate && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedDate(null);
                        setSelectedItems([]);
                      }}
                    >
                      Xem tất cả
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Đang tải...</p>
                  </div>
                ) : (selectedDate ? selectedItems : currentMonthItems).length > 0 ? (
                  (selectedDate ? selectedItems : currentMonthItems).map(item => (
                    <div 
                      key={`${item.type}-${item.id}`} 
                      className={`border-l-4 pl-4 py-2 rounded-r-lg transition-all ${
                        item.type === 'event' 
                          ? (item as Event).featured 
                            ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-transparent shadow-md' 
                            : 'border-blue-500'
                          : 'border-yellow-500'
                      }`}
                      style={item.type === 'event' ? { 
                        borderLeftColor: (item as Event).color || '#3B82F6'
                      } : {}}
                    >
                      {item.type === 'event' ? (
                        // Event display
                        <>
                          <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                            {(item as Event).featured && (
                              <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
                            )}
                            {(item as Event).title}
                            {(item as Event).featured && (
                              <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">
                                Nổi bật
                              </span>
                            )}
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date((item as Event).eventDate).toLocaleDateString('vi-VN')} - {(item as Event).startTime}
                              {(item as Event).endTime && ` - ${(item as Event).endTime}`}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {(item as Event).location}
                            </div>
                            {(item as Event).maxParticipants && (
                              <div className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {(item as Event).currentParticipants}/{(item as Event).maxParticipants} người tham gia
                              </div>
                            )}
                          </div>
                          {(item as Event).description && (
                            <p className="text-sm text-gray-700 mt-2">{(item as Event).description}</p>
                          )}
                          <div className="mt-2">
                            <span 
                              className="inline-block px-2 py-1 text-xs rounded-full text-white font-medium"
                              style={{ backgroundColor: (item as Event).color || '#3B82F6' }}
                            >
                              Sự kiện
                            </span>
                          </div>
                        </>
                      ) : (
                        // Room booking display
                        <>
                          <h4 className="font-medium text-gray-900 mb-1">Đặt phòng: {(item as RoomBooking).fullName}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date((item as RoomBooking).bookingDate).toLocaleDateString('vi-VN')} - {(item as RoomBooking).timeSlot}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              Phòng {(item as RoomBooking).roomType}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {(item as RoomBooking).participants} người
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mt-2">Mục đích: {(item as RoomBooking).purpose}</p>
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              Đặt phòng
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Không có sự kiện hoặc đặt phòng nào trong tháng này</p>
                )}
              </CardContent>
            </Card>

            {/* Quick stats */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sự kiện tháng này:</span>
                    <span className="font-medium">{events.filter(e => {
                      const eventDate = new Date(e.eventDate);
                      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
                    }).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Đặt phòng tháng này:</span>
                    <span className="font-medium">{roomBookings.filter(b => {
                      const bookingDate = new Date(b.bookingDate);
                      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
                    }).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tổng hoạt động:</span>
                    <span className="font-medium">{currentMonthItems.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}