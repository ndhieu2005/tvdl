import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check if admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    const sampleEvents = [
      {
        title: 'Hội thảo Kỹ năng tìm kiếm thông tin',
        description: 'Trang bị kỹ năng tìm kiếm và đánh giá thông tin hiệu quả trong thời đại số.',
        location: 'Phòng hội thảo A',
        eventDate: new Date('2024-12-15'),
        startTime: '14:00',
        endTime: '16:00',
        maxParticipants: 50,
        registrationRequired: true,
        status: 'PUBLISHED' as const,
        featured: true,
        contactPerson: 'Thư viện Dương Liễu',
        contactPhone: '0123456789',
        contactEmail: 'contact@library.com',
        publicNotes: 'Vui lòng mang theo giấy tờ tùy thân khi tham gia.',
        slug: 'hoi-thao-ky-nang-tim-kiem-thong-tin',
        createdBy: adminUser.id
      },
      {
        title: 'Triển lãm sách Văn học Việt Nam',
        description: 'Giới thiệu những tác phẩm văn học Việt Nam từ cổ điển đến hiện đại.',
        location: 'Khu triển lãm chính',
        eventDate: new Date('2024-12-20'),
        startTime: '09:00',
        endTime: '17:00',
        maxParticipants: 200,
        registrationRequired: false,
        status: 'PUBLISHED' as const,
        featured: true,
        contactPerson: 'Ban tổ chức',
        contactPhone: '0123456789',
        contactEmail: 'event@library.com',
        publicNotes: 'Sự kiện miễn phí, mở cửa cho tất cả mọi người.',
        slug: 'trien-lam-sach-van-hoc-viet-nam',
        createdBy: adminUser.id
      },
      {
        title: 'Câu lạc bộ đọc sách tháng 12',
        description: 'Thảo luận về cuốn sách "Sapiens: Lược sử loài người" của Yuval Noah Harari.',
        location: 'Phòng sinh hoạt',
        eventDate: new Date('2024-12-25'),
        startTime: '19:00',
        endTime: '21:00',
        maxParticipants: 30,
        registrationRequired: true,
        status: 'PUBLISHED' as const,
        featured: false,
        contactPerson: 'CLB Đọc sách',
        contactPhone: '0123456789',
        contactEmail: 'bookclub@library.com',
        publicNotes: 'Vui lòng đọc sách trước khi tham gia.',
        slug: 'cau-lac-bo-doc-sach-thang-12',
        createdBy: adminUser.id
      },
      {
        title: 'Workshop Viết CV và thư xin việc',
        description: 'Hướng dẫn cách viết CV và thư xin việc hiệu quả cho sinh viên.',
        location: 'Phòng đào tạo B',
        eventDate: new Date('2024-12-10'),
        startTime: '15:30',
        endTime: '17:30',
        maxParticipants: 40,
        registrationRequired: true,
        status: 'COMPLETED' as const,
        featured: false,
        contactPerson: 'Phòng Hướng nghiệp',
        contactPhone: '0123456789',
        contactEmail: 'career@library.com',
        publicNotes: 'Mang theo laptop cá nhân.',
        slug: 'workshop-viet-cv-va-thu-xin-viec',
        createdBy: adminUser.id
      },
      {
        title: 'Buổi giao lưu với tác giả',
        description: 'Gặp gỡ và trò chuyện với tác giả nổi tiếng về cuộc sống và sáng tác.',
        location: 'Sảnh chính',
        eventDate: new Date('2025-01-15'),
        startTime: '16:00',
        endTime: '18:00',
        maxParticipants: 100,
        registrationRequired: true,
        status: 'PUBLISHED' as const,
        featured: true,
        contactPerson: 'Ban văn hóa',
        contactPhone: '0123456789',
        contactEmail: 'culture@library.com',
        publicNotes: 'Có phiên ký tặng sách sau buổi giao lưu.',
        slug: 'buoi-giao-luu-voi-tac-gia',
        createdBy: adminUser.id
      }
    ];

    // Create events
    const createdEvents = await Promise.all(
      sampleEvents.map(event => 
        prisma.event.create({ data: event })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Created ${createdEvents.length} sample events`,
      data: createdEvents
    });

  } catch (error) {
    console.error('Error creating sample events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sample events' },
      { status: 500 }
    );
  }
}