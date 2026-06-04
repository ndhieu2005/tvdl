import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/jwt';
import { Role, Status } from '@prisma/client';

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    role: Role.ADMIN,
    status: Status.ACTIVE,
    location: 'Hà Nội, Việt Nam',
    bio: 'Quản trị viên hệ thống',
    emailVerified: true,
  },
  {
    name: 'Editor User',
    email: 'editor@example.com',
    role: Role.EDITOR,
    status: Status.ACTIVE,
    location: 'TP. Hồ Chí Minh, Việt Nam',
    bio: 'Biên tập viên nội dung',
    emailVerified: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    role: Role.USER,
    status: Status.ACTIVE,
    location: 'Đà Nẵng, Việt Nam',
    bio: 'Người dùng thường',
    emailVerified: true,
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: Role.USER,
    status: Status.ACTIVE,
    location: 'Cần Thơ, Việt Nam',
    bio: 'Người dùng thường',
    emailVerified: false,
  },
  {
    name: 'Pending User',
    email: 'pending@example.com',
    role: Role.USER,
    status: Status.PENDING,
    location: 'Hải Phòng, Việt Nam',
    bio: 'Tài khoản chờ duyệt',
    emailVerified: false,
  },
  {
    name: 'Inactive User',
    email: 'inactive@example.com',
    role: Role.USER,
    status: Status.INACTIVE,
    location: 'Nha Trang, Việt Nam',
    bio: 'Tài khoản không hoạt động',
    emailVerified: true,
  },
];

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting user seeding...');
    
    // Check if users already exist
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: sampleUsers.map(u => u.email)
        }
      }
    });

    if (existingUsers.length > 0) {
      return NextResponse.json({
        message: 'Sample users already exist',
        existingUsers: existingUsers.map(u => ({ id: u.id, email: u.email }))
      });
    }

    // Hash password for all users
    const hashedPassword = await hashPassword('password123');
    
    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=7c3aed&color=fff`,
          posts: Math.floor(Math.random() * 20), // Random post count
        }
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email}`);
    }

    console.log(`🎉 Successfully created ${createdUsers.length} sample users`);

    return NextResponse.json({
      message: `Successfully created ${createdUsers.length} sample users`,
      users: createdUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status
      }))
    });

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    return NextResponse.json(
      { error: 'Failed to seed users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Deleting sample users...');
    
    // Delete sample users
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          in: sampleUsers.map(u => u.email)
        }
      }
    });

    console.log(`🗑️ Deleted ${deletedUsers.count} sample users`);

    return NextResponse.json({
      message: `Successfully deleted ${deletedUsers.count} sample users`,
      count: deletedUsers.count
    });

  } catch (error) {
    console.error('❌ Error deleting sample users:', error);
    return NextResponse.json(
      { error: 'Failed to delete sample users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}