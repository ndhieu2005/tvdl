import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE - Xóa tất cả bookings test (chỉ dùng trong development)
export async function DELETE(request: NextRequest) {
  try {
    // Chỉ cho phép trong development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Not allowed in production' },
        { status: 403 }
      );
    }

    // Xóa tất cả room bookings
    const result = await prisma.roomBooking.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} bookings`,
      count: result.count
    });

  } catch (error) {
    console.error('Error clearing bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear bookings' },
      { status: 500 }
    );
  }
}