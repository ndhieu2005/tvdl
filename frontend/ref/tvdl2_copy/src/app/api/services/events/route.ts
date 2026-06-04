import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt-server';
import * as XLSX from 'xlsx';

// GET - Lấy danh sách events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const date = searchParams.get('date') || '';
    const month = searchParams.get('month') || '';
    const year = searchParams.get('year') || '';
    const export_format = searchParams.get('export');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } }
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.eventDate = {
        gte: targetDate,
        lt: nextDay
      };
    } else if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      
      where.eventDate = {
        gte: startDate,
        lte: endDate
      };
    }

    // For export, get all events without pagination
    if (export_format === 'excel') {
      const events = await prisma.event.findMany({
        where,
        orderBy: [
          { createdAt: 'desc' },
          { eventDate: 'desc' }
        ]
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(
        events.map(event => ({
          'Tiêu đề': event.title,
          'Mô tả': event.description || '',
          'Địa điểm': event.location,
          'Ngày tổ chức': new Date(event.eventDate).toLocaleDateString('vi-VN'),
          'Giờ bắt đầu': event.startTime,
          'Giờ kết thúc': event.endTime || '',
          'Số người tối đa': event.maxParticipants || '',
          'Đã đăng ký': event.currentParticipants,
          'Trạng thái': event.status,
          'Người liên hệ': event.contactPerson || '',
          'SĐT liên hệ': event.contactPhone || '',
          'Email liên hệ': event.contactEmail || '',
          'Ngày tạo': new Date(event.createdAt).toLocaleDateString('vi-VN')
        }))
      );

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Events');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=events-${new Date().toISOString().split('T')[0]}.xlsx`
        }
      });
    }

    // Get total count for pagination
    const totalCount = await prisma.event.count({ where });
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated events
    const events = await prisma.event.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' },
        { eventDate: 'desc' }
      ],
      skip,
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: events,
      total: totalCount,
      totalPages,
      currentPage: page,
      pageSize: limit
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải danh sách sự kiện' },
      { status: 500 }
    );
  }
}

// POST - Tạo event mới
export async function POST(request: NextRequest) {
  try {
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
      publicNotes
    } = body;

    // Validate required fields
    if (!title || !location || !eventDate || !startTime) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Check if slug exists
    const existingEvent = await prisma.event.findUnique({
      where: { slug }
    });

    const finalSlug = existingEvent ? `${slug}-${Date.now()}` : slug;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        eventDate: new Date(eventDate),
        startTime,
        endTime,
        duration: duration ? parseInt(duration) : null,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        registrationRequired: registrationRequired || false,
        status: status || 'DRAFT',
        featured: featured || false,
        featuredImage,
        color: color || '#033b93',
        contactPerson,
        contactPhone,
        contactEmail,
        publicNotes,
        slug: finalSlug,
        createdBy: decoded.userId
      }
    });

    return NextResponse.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo sự kiện' },
      { status: 500 }
    );
  }
}