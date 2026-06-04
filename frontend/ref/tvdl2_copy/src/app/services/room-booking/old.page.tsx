'use client';

import React, { useState, useRef } from 'react';
import { RecaptchaV3, useRecaptchaV3 } from '@/components/RecaptchaV3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, Users, MapPin, Phone, Mail, User, CheckCircle } from 'lucide-react';
import DevRecaptchaStatus from '@/components/DevRecaptchaStatus';

const roomTypes = [
  { value: 'READING_ROOM', label: 'Phòng đọc', icon: User }
];

// Base time slots - will be dynamically generated based on duration
const baseTimeSlots = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '13:00 - 15:00',
  '15:00 - 17:00',
  '17:00 - 19:00',
  '19:00 - 21:00'
];

// Generate time slots based on duration
const generateTimeSlots = (duration: number): string[] => {
  if (!duration || duration < 1) return baseTimeSlots;
  
  const slots: string[] = [];
  // More flexible start times - every hour from 8:00 to ensure maximum availability
  const possibleStartHours = [8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19];
  
  for (const startHour of possibleStartHours) {
    const endHour = startHour + duration;
    
    // Check if the slot fits within working hours (8:00 - 21:00)
    // Also avoid lunch break (12:00 - 13:00) - slots cannot cross lunch time
    if (endHour <= 21 && !(startHour <= 12 && endHour > 12)) {
      const startTime = `${startHour.toString().padStart(2, '0')}:00`;
      const endTime = `${endHour.toString().padStart(2, '0')}:00`;
      slots.push(`${startTime} - ${endTime}`);
    }
  }
  
  // If no slots available (e.g., duration too long), return base slots as fallback
  return slots.length > 0 ? slots : baseTimeSlots;
};

const benefits = [
  { icon: Calendar, text: 'Đặt trước tối đa 7 ngày' },
  { icon: Clock, text: 'Thời gian sử dụng linh hoạt' },
  { icon: Users, text: 'Phòng học nhóm và cá nhân' },
  { icon: MapPin, text: 'Trang thiết bị hiện đại' },
];

export default function RoomBookingPage() {
  const { executeRecaptcha } = useRecaptchaV3();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    cardNumber: '',
    roomType: '',
    bookingDate: '',
    timeSlot: '',
    duration: '', // Số giờ muốn mượn
    purpose: '',
    numberOfPeople: '',
    specialRequests: '',
    agreeTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [currentTimeSlots, setCurrentTimeSlots] = useState<string[]>(baseTimeSlots);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!formData.cardNumber.trim()) {
      errors.cardNumber = 'Vui lòng nhập số thẻ thư viện';
    } else if (!/^[0-9]+$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Số thẻ thư viện không hợp lệ';
    }

    if (!formData.roomType) {
      errors.roomType = 'Vui lòng chọn loại phòng';
    }

    if (!formData.bookingDate) {
      errors.bookingDate = 'Vui lòng chọn ngày đặt phòng';
    }

    if (!formData.timeSlot) {
      errors.timeSlot = 'Vui lòng chọn khung giờ';
    } else if (isTimeSlotDisabled(formData.timeSlot)) {
      errors.timeSlot = 'Khung giờ này đã được đặt, vui lòng chọn khung giờ khác';
    }

    if (!formData.purpose.trim()) {
      errors.purpose = 'Vui lòng nhập mục đích sử dụng';
    }

    if (!formData.numberOfPeople.trim()) {
      errors.numberOfPeople = 'Vui lòng nhập số người';
    }

    if (!formData.duration.trim()) {
      errors.duration = 'Vui lòng nhập số giờ muốn mượn';
    } else {
      const duration = parseInt(formData.duration);
      if (isNaN(duration) || duration < 1 || duration > 8) {
        errors.duration = 'Số giờ phải từ 1 đến 8 giờ';
      }
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = 'Vui lòng đồng ý với điều khoản sử dụng';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Khi thay đổi số giờ mượn, cập nhật time slots và reset time slot đã chọn
    if (field === 'duration') {
      const duration = parseInt(value as string);
      if (!isNaN(duration) && duration > 0) {
        const newTimeSlots = generateTimeSlots(duration);
        setCurrentTimeSlots(newTimeSlots);
        
        // Reset time slot đã chọn nếu không còn hợp lệ
        if (formData.timeSlot && !newTimeSlots.includes(formData.timeSlot)) {
          setFormData(prev => ({ ...prev, timeSlot: '' }));
        }
      }
    }
    
    // Khi thay đổi ngày hoặc loại phòng, fetch lại existing bookings
    if (field === 'bookingDate' || field === 'roomType') {
      if (formData.roomType && formData.bookingDate) {
        fetchExistingBookings(
          field === 'roomType' ? value as string : formData.roomType,
          field === 'bookingDate' ? value as string : formData.bookingDate
        );
      }
    }
  };

  // Format ngày thành dd/mm/yyyy
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Fetch existing bookings cho ngày và loại phòng cụ thể
  const fetchExistingBookings = async (roomType: string, bookingDate: string) => {
    if (!roomType || !bookingDate) return;
    
    setLoadingTimeSlots(true);
    try {
      const params = new URLSearchParams({
        roomType,
        date: bookingDate,
        status: 'APPROVED,CONFIRMED' // Chỉ lấy booking đã được duyệt
      });
      
      const response = await fetch(`/api/services/room-booking?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setExistingBookings(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching existing bookings:', error);
      setExistingBookings([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  // Check xem time slot có bị disable không
  const isTimeSlotDisabled = (timeSlot: string) => {
    return existingBookings.some(booking => booking.timeSlot === timeSlot);
  };

  // Fetch existing bookings khi có đủ thông tin
  React.useEffect(() => {
    if (formData.roomType && formData.bookingDate) {
      fetchExistingBookings(formData.roomType, formData.bookingDate);
    } else {
      setExistingBookings([]);
    }
  }, [formData.roomType, formData.bookingDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Thực hiện reCAPTCHA v3 trước khi submit
      let recaptchaToken = null;
      if (process.env.NODE_ENV === 'production') {
        recaptchaToken = await executeRecaptcha('room_booking');
        if (!recaptchaToken) {
          alert('Không thể xác minh reCAPTCHA. Vui lòng thử lại.');
          setIsSubmitting(false);
          return;
        }
      } else {
        recaptchaToken = 'dev-bypass';
      }

      const response = await fetch('/api/services/room-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        // Reset form
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          cardNumber: '',
          roomType: '',
          bookingDate: '',
          timeSlot: '',
          duration: '',
          purpose: '',
          numberOfPeople: '',
          specialRequests: '',
          agreeTerms: false
        });
        setExistingBookings([]);
      } else {
        alert(result.error || 'Có lỗi xảy ra khi gửi đăng ký');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Có lỗi xảy ra khi gửi đăng ký');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (7 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    return maxDate.toISOString().split('T')[0];
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Đăng ký thành công!
              </h2>
              <p className="text-gray-600 mb-6">
                Cảm ơn bạn đã đăng ký đặt phòng. Chúng tôi sẽ xem xét và phản hồi trong vòng 24 giờ.
              </p>
              <Button onClick={() => setIsSubmitted(false)}>
                Đăng ký thêm
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Đặt phòng học nhóm</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Đặt trước phòng học nhóm và phòng nghiên cứu cho các hoạt động học tập của bạn.
            Chúng tôi cung cấp không gian học tập hiện đại với đầy đủ tiện nghi.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Benefits */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-6 w-6 text-green-600" />
                  Ưu điểm dịch vụ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => {
                    const IconComponent = benefit.icon;
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">{benefit.text}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Lưu ý quan trọng</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Đặt phòng trước tối thiểu 1 ngày</li>
                    <li>• Mang theo giấy tờ tùy thân khi sử dụng</li>
                    <li>• Tuân thủ nội quy sử dụng phòng</li>
                    <li>• Thông báo hủy trước 2 giờ nếu có thay đổi</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đặt phòng</CardTitle>
                <CardDescription>
                  Vui lòng điền đầy đủ thông tin để đăng ký đặt phòng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Họ và tên *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={validationErrors.fullName ? 'border-red-500' : ''}
                      />
                      {validationErrors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={validationErrors.phone ? 'border-red-500' : ''}
                      />
                      {validationErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={validationErrors.email ? 'border-red-500' : ''}
                      />
                      {validationErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="cardNumber">Số thẻ thư viện *</Label>
                      <Input
                        id="cardNumber"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        className={validationErrors.cardNumber ? 'border-red-500' : ''}
                        placeholder="Nhập số thẻ thư viện"
                      />
                      {validationErrors.cardNumber && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.cardNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="roomType">Loại phòng *</Label>
                      <Select value={formData.roomType} onValueChange={(value) => handleInputChange('roomType', value)}>
                        <SelectTrigger className={validationErrors.roomType ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Chọn loại phòng" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validationErrors.roomType && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.roomType}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="numberOfPeople">Số người *</Label>
                      <Input
                        id="numberOfPeople"
                        type="number"
                        min="1"
                        max="20"
                        value={formData.numberOfPeople}
                        onChange={(e) => handleInputChange('numberOfPeople', e.target.value)}
                        className={validationErrors.numberOfPeople ? 'border-red-500' : ''}
                      />
                      {validationErrors.numberOfPeople && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.numberOfPeople}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="duration">Số giờ mượn *</Label>
                      <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                        <SelectTrigger className={validationErrors.duration ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Chọn số giờ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 giờ</SelectItem>
                          <SelectItem value="2">2 giờ</SelectItem>
                          <SelectItem value="3">3 giờ</SelectItem>
                          <SelectItem value="4">4 giờ</SelectItem>
                          <SelectItem value="5">5 giờ</SelectItem>
                          <SelectItem value="6">6 giờ</SelectItem>
                          <SelectItem value="7">7 giờ</SelectItem>
                          <SelectItem value="8">8 giờ</SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.duration && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.duration}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bookingDate">Ngày đặt phòng *</Label>
                      <Input
                        id="bookingDate"
                        type="date"
                        min={getMinDate()}
                        max={getMaxDate()}
                        value={formData.bookingDate}
                        onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                        className={validationErrors.bookingDate ? 'border-red-500' : ''}
                      />
                      {formData.bookingDate && (
                        <p className="text-sm text-gray-600 mt-1">
                          Ngày đã chọn: <span className="font-medium">{formatDateDisplay(formData.bookingDate)}</span>
                        </p>
                      )}
                      {validationErrors.bookingDate && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.bookingDate}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="timeSlot">Khung giờ *</Label>
                      <Select 
                        value={formData.timeSlot} 
                        onValueChange={(value) => handleInputChange('timeSlot', value)}
                        disabled={loadingTimeSlots}
                      >
                        <SelectTrigger className={validationErrors.timeSlot ? 'border-red-500' : ''}>
                          <SelectValue placeholder={loadingTimeSlots ? "Đang kiểm tra..." : "Chọn khung giờ"} />
                        </SelectTrigger>
                        <SelectContent>
                          {currentTimeSlots.map((slot) => {
                            const isDisabled = isTimeSlotDisabled(slot);
                            return (
                              <SelectItem 
                                key={slot} 
                                value={slot}
                                disabled={isDisabled}
                                className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{slot}</span>
                                  {isDisabled && (
                                    <span className="text-red-500 text-xs ml-2">(Đã đặt)</span>
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      
                      {/* Hiển thị thông tin về khung giờ đã đặt */}
                      {formData.roomType && formData.bookingDate && existingBookings.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                          <p className="text-yellow-800 font-medium">Khung giờ đã được đặt:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {existingBookings.map((booking, index) => (
                              <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                {booking.timeSlot}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Hiển thị thông tin về khung giờ được tạo dựa trên số giờ mượn */}
                      {formData.duration && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                          <p className="text-blue-800 font-medium">
                            Khung giờ có sẵn cho {formData.duration} giờ:
                          </p>
                          <p className="text-blue-700 text-xs mt-1">
                            Các khung giờ được tự động tạo dựa trên số giờ bạn chọn
                          </p>
                        </div>
                      )}
                      
                      {validationErrors.timeSlot && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.timeSlot}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="purpose">Mục đích sử dụng *</Label>
                    <Textarea
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                      placeholder="Ví dụ: Học nhóm môn Toán, họp dự án, nghiên cứu..."
                      className={validationErrors.purpose ? 'border-red-500' : ''}
                    />
                    {validationErrors.purpose && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.purpose}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="specialRequests">Yêu cầu đặc biệt</Label>
                    <Textarea
                      id="specialRequests"
                      value={formData.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      placeholder="Các yêu cầu về trang thiết bị, bố trí phòng..."
                    />
                  </div>

                  {/* Terms */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => handleInputChange('agreeTerms', checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="agreeTerms"
                        className="text-sm font-normal leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Tôi đồng ý với{' '}
                        <a href="/terms" className="text-blue-600 hover:underline">
                          điều khoản sử dụng
                        </a>{' '}
                        và{' '}
                        <a href="/privacy" className="text-blue-600 hover:underline">
                          chính sách bảo mật
                        </a>
                      </Label>
                      {validationErrors.agreeTerms && (
                        <p className="text-red-500 text-sm">{validationErrors.agreeTerms}</p>
                      )}
                    </div>
                  </div>

                  {/* reCAPTCHA v3 - Invisible, loaded automatically */}
                  <RecaptchaV3 
                    onToken={() => {}} 
                    action="room_booking"
                  />
                  
                  {/* Development notice */}
                  <DevRecaptchaStatus />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi đăng ký'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}