import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role, Status } from '@prisma/client';
import { hashPassword } from '@/lib/jwt';

export interface CreateUserRequest {
  name: string;
  email: string;
  role?: Role;
  status?: Status;
  location?: string;
  bio?: string;
  emailVerified?: boolean;
  avatar?: string;
}

export interface UserFromDB {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  location: string | null;
  bio: string | null;
  emailVerified: boolean;
  avatar: string | null;
  joinDate: Date;
  lastLogin: Date;
  posts: number;
  likes: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/users - Lấy danh sách users
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] GET /api/users called');
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') as Role | '';
    const status = searchParams.get('status') as Status | '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('📋 [API] Query params:', { search, role, status, page, limit });

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role && Object.values(Role).includes(role)) {
      where.role = role;
    }

    if (status && Object.values(Status).includes(status)) {
      where.status = status;
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          location: true,
          bio: true,
          emailVerified: true,
          avatar: true,
          joinDate: true,
          lastLogin: true,
          posts: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      prisma.user.count({ where })
    ]);

    // Get stats
    const [totalUsers, activeUsers, inactiveUsers, pendingUsers, adminUsers, editorUsers, regularUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: Status.ACTIVE } }),
      prisma.user.count({ where: { status: Status.INACTIVE } }),
      prisma.user.count({ where: { status: Status.PENDING } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.user.count({ where: { role: Role.EDITOR } }),
      prisma.user.count({ where: { role: Role.USER } })
    ]);

    // Transform data for response
    const transformedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
      location: user.location || '',
      bio: user.bio || '',
      emailVerified: user.emailVerified,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=fff`,
      joinDate: user.joinDate.toISOString().split('T')[0],
      lastLogin: user.lastLogin.toISOString(),
      stats: {
        posts: user.posts || 0
      }
    }));

    const responseData = {
      users: transformedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        pending: pendingUsers,
        admins: adminUsers,
        editors: editorUsers,
        regularUsers: regularUsers
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('❌ [API] Error fetching users:', error);
    console.error('❌ [API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Có lỗi xảy ra khi lấy danh sách users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/users - Tạo user mới
export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json();

    // Validation
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Tên và email là bắt buộc' },
        { status: 400 }
      );
    }

    // Chuyển đổi role và status thành chữ hoa để xử lý không phân biệt case
    const roleFromRequest = body.role ? body.role.toUpperCase() : undefined;
    const statusFromRequest = body.status ? body.status.toUpperCase() : undefined;

    // Validate role and status if provided
    if (body.role && roleFromRequest) {
      const validRoles = ['ADMIN', 'EDITOR', 'USER'];
      if (!validRoles.includes(roleFromRequest)) {
        return NextResponse.json(
          { error: 'Role không hợp lệ. Chỉ chấp nhận: ADMIN, EDITOR, USER' },
          { status: 400 }
        );
      }
    }

    if (body.status && statusFromRequest) {
      const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING'];
      if (!validStatuses.includes(statusFromRequest)) {
        return NextResponse.json(
          { error: 'Status không hợp lệ. Chỉ chấp nhận: ACTIVE, INACTIVE, PENDING' },
          { status: 400 }
        );
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được sử dụng' },
        { status: 400 }
      );
    }

    // Hash default password
    const hashedPassword = await hashPassword('temp_password_needs_reset');
    
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: (roleFromRequest as Role) || Role.USER,
        status: (statusFromRequest as Status) || Status.PENDING,
        location: body.location || '',
        bio: body.bio || '',
        emailVerified: body.emailVerified || false,
        avatar: body.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(body.name)}&background=7c3aed&color=fff`,
      }
    });

    // Transform response
    const transformedUser = {
      ...newUser,
      location: newUser.location || '',
      bio: newUser.bio || '',
      avatar: newUser.avatar || '',
      joinDate: newUser.joinDate.toISOString().split('T')[0],
      lastLogin: newUser.lastLogin.toISOString()
    };

    return NextResponse.json({
      message: 'Tạo user thành công',
      user: transformedUser
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo user' },
      { status: 500 }
    );
  }
}