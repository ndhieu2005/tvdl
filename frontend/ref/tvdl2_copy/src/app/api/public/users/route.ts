import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth } from '@/lib/middleware/api-auth';

// GET: Lấy danh sách users với API key
export const GET = withApiKeyAuth('user', 'read', async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const role = url.searchParams.get('role'); // ADMIN, EDITOR, USER
    const status = url.searchParams.get('status'); // ACTIVE, INACTIVE, PENDING
    const search = url.searchParams.get('search');
    
    console.log('👥 Public API - Getting users with params:', {
      page,
      limit,
      role,
      status,
      search
    });

    const { prisma } = await import('@/lib/prisma');
    
    // Build where clause
    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ]);
    
    console.log('👥 Public API - Users found:', users.length);
    
    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('👥 Public API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách users' },
      { status: 500 }
    );
  }
});

// POST: Tạo user với API key
export const POST = withApiKeyAuth('user', 'create', async (req: NextRequest) => {
  try {
    const body = await req.json();
    console.log('👥 Public API - Creating user with data:', body);

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name và email là bắt buộc' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã tồn tại' },
        { status: 400 }
      );
    }

    // Hash password if provided
    let hashedPassword = 'temp_password_needs_reset';
    if (body.password) {
      const { hashPassword } = await import('@/lib/jwt-server');
      hashedPassword = await hashPassword(body.password);
    }

    const userData = {
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: body.role || 'USER',
      status: body.status || 'PENDING',
      location: body.location || null,
      bio: body.bio || null,
      emailVerified: body.emailVerified || false,
      avatar: body.avatar || null,
      joinDate: new Date(),
      lastLogin: new Date()
    };

    const result = await prisma.user.create({
      data: userData,
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
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log('👥 Public API - User created:', result.id);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: 'User đã được tạo thành công'
    });

  } catch (error) {
    console.error('👥 Public API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo user' },
      { status: 500 }
    );
  }
});

// PUT: Update user với API key
export const PUT = withApiKeyAuth('user', 'update', async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('id');
    const body = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID là bắt buộc' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User không tồn tại' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.role) updateData.role = body.role;
    if (body.status) updateData.status = body.status;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.emailVerified !== undefined) updateData.emailVerified = body.emailVerified;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;

    // Hash password if provided
    if (body.password) {
      const { hashPassword } = await import('@/lib/jwt-server');
      updateData.password = await hashPassword(body.password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User đã được cập nhật thành công'
    });

  } catch (error) {
    console.error('👥 Public API - Update Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật user' },
      { status: 500 }
    );
  }
});

// DELETE: Xóa user với API key
export const DELETE = withApiKeyAuth('user', 'delete', async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID là bắt buộc' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User không tồn tại' },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      success: true,
      message: 'User đã được xóa thành công'
    });

  } catch (error) {
    console.error('👥 Public API - Delete Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa user' },
      { status: 500 }
    );
  }
});