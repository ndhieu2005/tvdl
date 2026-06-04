import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRecaptcha, isRecaptchaRequired } from '@/lib/recaptcha';
import { ROOM_BOOKING_STATUS } from './const';
import { hhmmToMinutesNumber } from '@/lib/time';
import { getRoomNameByType, RoomType } from '@/app/services/room-booking/const';
import { BookingStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  const VOLUNTEER_CARD_NUMBER_MAX_VALUE = 300;
  try {
    const body = await request.json();
    const {
      fullName,
      phone,
      email,
      cardNumber,
      roomType,
      bookingDate,
      startTime,
      endTime,
      numberOfPeople,
      note,
      recaptchaToken
    } = body;

    // Validate required fields
    if (!fullName || !phone || !email || !cardNumber || !roomType || !bookingDate || !startTime || !endTime || !numberOfPeople || !note) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA v3 - only in production
    if (isRecaptchaRequired()) {
      if (!recaptchaToken || recaptchaToken === 'dev-bypass') {
        return NextResponse.json(
          { success: false, error: 'Thiếu token reCAPTCHA' },
          { status: 400 }
        );
      }

      const isValidRecaptcha = await verifyRecaptcha(
        recaptchaToken,
        'room_booking', // Expected action
        0.5 // Minimum score
      );
      if (!isValidRecaptcha) {
        return NextResponse.json(
          { success: false, error: 'Xác thực reCAPTCHA không hợp lệ' },
          { status: 400 }
        );
      }
    } else {
      // Development mode - log bypass
      console.log('🔧 Development mode: reCAPTCHA verification bypassed');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại không hợp lệ' },
        { status: 400 }
      );
    }

    // Validate card number format
    if (Number(cardNumber.split('-')[1]) > VOLUNTEER_CARD_NUMBER_MAX_VALUE) {
      return NextResponse.json(
        { success: false, error: 'Số thẻ thư viện không hợp lệ' },
        { status: 400 }
      );
    }

    // Validate booking date (must be in the future and within 30 days)
    const bookingDateTime = new Date(bookingDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);

    if (bookingDateTime < now) {
      return NextResponse.json(
        { success: false, error: 'Ngày đặt phòng phải là ngày trong tương lai' },
        { status: 400 }
      );
    }

    if (bookingDateTime > maxDate) {
      return NextResponse.json(
        { success: false, error: 'Chỉ có thể đặt phòng trong vòng 30 ngày tới' },
        { status: 400 }
      );
    }

    const timeSlot = `${startTime} - ${endTime}`;
    const timeSlotMatch = timeSlot.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
    if (!timeSlotMatch) {
      return NextResponse.json(
        { success: false, error: 'Định dạng khung giờ không hợp lệ. Vui lòng sử dụng định dạng HH:MM - HH:MM' },
        { status: 400 }
      );
    }

    const numberStart = hhmmToMinutesNumber(startTime);
    const numberEnd = hhmmToMinutesNumber(endTime);
    if (numberStart >= numberEnd) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn giờ kết thúc lớn hơn giờ bắt đầu.' },
        { status: 400 }
      );
    }

    // Check for existing booking overlap
    const existingBooking = await prisma.roomBooking.findFirst({
      where: {
        roomType,
        bookingDate: bookingDateTime,
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: startTime,
        },
        status: {
          in: [ROOM_BOOKING_STATUS.PENDING as BookingStatus, ROOM_BOOKING_STATUS.APPROVED as BookingStatus]
        }
      }
    });

    if (existingBooking) {
      const msg = `${getRoomNameByType(existingBooking.roomType as RoomType).toUpperCase()} đã được mượn trong khung giờ ${existingBooking.timeSlot}. Vui lòng chọn khung giờ khác.`;
      return NextResponse.json(
        { success: false, error: msg },
        { status: 400 }
      );
    }

    // Create room booking
    const roomBooking = await prisma.roomBooking.create({
      data: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        cardNumber: cardNumber.trim(),
        roomType,
        bookingDate: bookingDateTime,
        timeSlot,
        startTime,
        endTime,
        duration: 1,
        participants: parseInt(numberOfPeople),
        purpose: note.trim(),
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Đăng ký đặt phòng thành công',
      data: {
        id: roomBooking.id,
        bookingDate: roomBooking.bookingDate,
        timeSlot: roomBooking.timeSlot,
        roomType: roomBooking.roomType
      }
    });

  } catch (error) {
    console.error('Error creating room booking:', error);
    return NextResponse.json(
      { success: false, error: 'Có lỗi xảy ra khi xử lý đăng ký' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const roomType = searchParams.get('roomType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const date = searchParams.get('date'); // Ngày cụ thể

    const skip = (page - 1) * limit;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) {
      // Hỗ trợ multiple status (APPROVED,CONFIRMED)
      if (status.includes(',')) {
        where.status = { in: status.split(',') };
      } else {
        where.status = status;
      }
    }

    if (roomType) {
      where.roomType = roomType;
    }

    if (date) {
      // Filter theo ngày cụ thể
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      where.bookingDate = {
        gte: startOfDay,
        lte: endOfDay
      };
    } else if (startDate || endDate) {
      where.bookingDate = {};
      if (startDate) {
        where.bookingDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.bookingDate.lte = new Date(endDate);
      }
    }

    // Get bookings with pagination
    const [bookings, total] = await Promise.all([
      prisma.roomBooking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.roomBooking.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching room bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Có lỗi xảy ra khi tải danh sách đặt phòng' },
      { status: 500 }
    );
  }
}