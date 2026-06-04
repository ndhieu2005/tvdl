import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/jwt';

/**
 * Debug API để kiểm tra và sửa admin user
 */
export async function GET(req: NextRequest) {
  try {
    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { role: 'ADMIN' },
          { email: 'admin@trendiefox.com' }
        ]
      },
    });
    
    if (!adminUser) {
      return NextResponse.json({
        message: 'Không tìm thấy admin user',
        adminExists: false
      });
    }
    
    const { password, ...userWithoutPassword } = adminUser;
    
    return NextResponse.json({
      message: 'Admin user được tìm thấy',
      adminExists: true,
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Debug admin error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi kiểm tra admin user' },
      { status: 500 }
    );
  }
}

/**
 * Update admin user status and password
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, forceUpdate = false } = body;
    
    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { role: 'ADMIN' },
          { email: email || 'admin@trendiefox.com' }
        ]
      },
    });
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Không tìm thấy admin user' },
        { status: 404 }
      );
    }
    
    // Update admin user
    const updates: any = {
      status: 'ACTIVE',
      emailVerified: true,
    };
    
    if (password) {
      updates.password = await hashPassword(password);
    }
    
    if (forceUpdate) {
      updates.email = email || 'admin@trendiefox.com';
      updates.role = 'ADMIN';
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: updates,
    });
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({
      message: 'Admin user đã được cập nhật',
      user: userWithoutPassword,
    });
    
  } catch (error) {
    console.error('Update admin error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi cập nhật admin user' },
      { status: 500 }
    );
  }
}