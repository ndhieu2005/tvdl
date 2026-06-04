import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách events công khai
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const status = searchParams.get('status') || 'SCHEDULED';

    // Build where clause
    const where: any = {
      status: status
    };

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      
      where.eventDate = {
        gte: startDate,
        lte: endDate
      };
    }

    const events = await prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        eventDate: true,
        startTime: true,
        endTime: true,
        maxParticipants: true,
        currentParticipants: true,
        registrationRequired: true,
        status: true,
        featured: true,
        featuredImage: true,
        color: true,
        contactPerson: true,
        contactPhone: true,
        contactEmail: true,
        publicNotes: true,
        slug: true,
        createdAt: true
      },
      orderBy: [
        { eventDate: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: events
    });

  } catch (error) {
    console.error('Error fetching public events:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải danh sách sự kiện' },
      { status: 500 }
    );
  }
}