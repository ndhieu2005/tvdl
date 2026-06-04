import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/middleware/auth';

export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    if (!['ADMIN', 'EDITOR', 'USER'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: role as 'ADMIN' | 'EDITOR' | 'USER' },
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
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update user role' },
      { status: 500 }
    );
  }
});

// Public endpoint for development - remove in production
export async function PUT(request: NextRequest) {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: 'Email and role are required' },
        { status: 400 }
      );
    }

    if (!['ADMIN', 'EDITOR', 'USER'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { email },
      data: { role: role as 'ADMIN' | 'EDITOR' | 'USER' },
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
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}