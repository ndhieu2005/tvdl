import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const sampleBookings = [
      {
        fullName: 'Nguyễn Văn A',
        phone: '0123456789',
        email: 'nguyenvana@email.com',
        cardNumber: 'TV001234',
        roomType: 'group-small',
        bookingDate: new Date('2024-12-16'),
        timeSlot: '09:00 - 11:00',
        startTime: '09:00',
        endTime: '11:00',
        duration: 2,
        participants: 4,
        purpose: 'group-study',
        specialRequests: 'Cần máy chiếu',
        status: 'APPROVED' as const,
        agreeTerms: true
      },
      {
        fullName: 'Trần Thị B',
        phone: '0987654321',
        email: 'tranthib@email.com',
        cardNumber: 'TV005678',
        roomType: 'private',
        bookingDate: new Date('2024-12-18'),
        timeSlot: '14:00 - 16:00',
        startTime: '14:00',
        endTime: '16:00',
        duration: 2,
        participants: 1,
        purpose: 'research',
        specialRequests: null,
        status: 'APPROVED' as const,
        agreeTerms: true
      },
      {
        fullName: 'Lê Văn C',
        phone: '0369852147',
        email: 'levanc@email.com',
        cardNumber: 'TV009012',
        roomType: 'group-large',
        bookingDate: new Date('2024-12-22'),
        timeSlot: '10:00 - 12:00',
        startTime: '10:00',
        endTime: '12:00',
        duration: 2,
        participants: 8,
        purpose: 'meeting',
        specialRequests: 'Cần bảng viết',
        status: 'APPROVED' as const,
        agreeTerms: true
      },
      {
        fullName: 'Phạm Thị D',
        phone: '0147258369',
        email: 'phamthid@email.com',
        cardNumber: 'TV003456',
        roomType: 'seminar',
        bookingDate: new Date('2025-01-10'),
        timeSlot: '15:00 - 17:00',
        startTime: '15:00',
        endTime: '17:00',
        duration: 2,
        participants: 15,
        purpose: 'presentation',
        specialRequests: 'Cần micro và loa',
        status: 'APPROVED' as const,
        agreeTerms: true
      }
    ];

    // Create bookings
    const createdBookings = await Promise.all(
      sampleBookings.map(booking => 
        prisma.roomBooking.create({ data: booking })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Created ${createdBookings.length} sample bookings`,
      data: createdBookings
    });

  } catch (error) {
    console.error('Error creating sample bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sample bookings' },
      { status: 500 }
    );
  }
}