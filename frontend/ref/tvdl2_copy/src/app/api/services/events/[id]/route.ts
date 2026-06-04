import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt-server';

// GET - Lấy thông tin event theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id: id }
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy sự kiện' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải thông tin sự kiện' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Không có token xác thực' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'EDITOR')) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền truy cập' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      location,
      eventDate,
      startTime,
      endTime,
      duration,
      maxParticipants,
      registrationRequired,
      status,
      featured,
      featuredImage,
      color,
      contactPerson,
      contactPhone,
      contactEmail,
      publicNotes,
      notes
    } = body;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: id }
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy sự kiện' },
        { status: 404 }
      );
    }

    // Update slug if title changed
    let slug = existingEvent.slug;
    if (title && title !== existingEvent.title) {
      const newSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      // Check if new slug exists
      const slugExists = await prisma.event.findFirst({
        where: {
          slug: newSlug,
          id: { not: id }
        }
      });

      slug = slugExists ? `${newSlug}-${Date.now()}` : newSlug;
    }

    const event = await prisma.event.update({
      where: { id: id },
      data: {
        title,
        description,
        location,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        startTime,
        endTime,
        duration: duration ? parseInt(duration) : null,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        registrationRequired,
        status,
        featured,
        featuredImage,
        color,
        contactPerson,
        contactPhone,
        contactEmail,
        publicNotes,
        notes,
        slug,
        updatedBy: decoded.userId
      }
    });

    return NextResponse.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật sự kiện' },
      { status: 500 }
    );
  }
}

// PATCH - Cập nhật trạng thái event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Không có token xác thực' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'EDITOR')) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền truy cập' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, notes } = body;

    const event = await prisma.event.update({
      where: { id: id },
      data: {
        status,
        notes,
        updatedBy: decoded.userId
      }
    });

    return NextResponse.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Error updating event status:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật trạng thái sự kiện' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Không có token xác thực' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Không có quyền truy cập' },
        { status: 403 }
      );
    }

    await prisma.event.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: 'Đã xóa sự kiện thành công'
    });

  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa sự kiện' },
      { status: 500 }
    );
  }
}