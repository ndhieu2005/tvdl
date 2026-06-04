import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ROOM_BOOKING_STATUS } from '@/app/api/services/room-booking/const';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!Object.values(ROOM_BOOKING_STATUS).includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Trạng thái không hợp lệ' },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.roomBooking.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Error updating room booking:', error);
    return NextResponse.json(
      { success: false, error: 'Có lỗi xảy ra khi cập nhật trạng thái' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete booking
    await prisma.roomBooking.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa đặt phòng thành công'
    });

  } catch (error) {
    console.error('Error deleting room booking:', error);
    return NextResponse.json(
      { success: false, error: 'Có lỗi xảy ra khi xóa đặt phòng' },
      { status: 500 }
    );
  }
}