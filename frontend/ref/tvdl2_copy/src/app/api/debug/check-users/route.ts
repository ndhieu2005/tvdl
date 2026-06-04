import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role, Status } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    console.log('🔍 All users in database:', users);

    // Check specific user
    const specificUser = await prisma.user.findUnique({
      where: { email: 'thedaovan@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    console.log('🔍 Specific user (thedaovan@gmail.com):', specificUser);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: users.length,
        users: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          hasRole: user.role !== undefined,
          hasStatus: user.status !== undefined
        })),
        specificUser: specificUser ? {
          id: specificUser.id,
          name: specificUser.name,
          email: specificUser.email,
          role: specificUser.role,
          status: specificUser.status,
          hasRole: specificUser.role !== undefined,
          hasStatus: specificUser.status !== undefined
        } : null
      }
    });
  } catch (error) {
    console.error('Error checking users:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Fix users that don't have proper role
    const usersWithoutRole = await prisma.user.findMany({
      where: {
        OR: [
          { role: null as any },
          // Note: Prisma enum fields can't be null in MySQL, so this is mainly for safety
        ]
      }
    });

    let roleUpdates = 0;
    if (usersWithoutRole.length > 0) {
      const updateResult = await prisma.user.updateMany({
        where: {
          id: {
            in: usersWithoutRole.map(user => user.id)
          }
        },
        data: {
          role: Role.USER
        }
      });
      roleUpdates = updateResult.count;
    }

    console.log('🔧 Fixed users without role:', roleUpdates);

    // Fix users that don't have proper status
    const usersWithoutStatus = await prisma.user.findMany({
      where: {
        OR: [
          { status: null as any },
          // Note: Prisma enum fields can't be null in MySQL, so this is mainly for safety
        ]
      }
    });

    let statusUpdates = 0;
    if (usersWithoutStatus.length > 0) {
      const statusResult = await prisma.user.updateMany({
        where: {
          id: {
            in: usersWithoutStatus.map(user => user.id)
          }
        },
        data: {
          status: Status.ACTIVE
        }
      });
      statusUpdates = statusResult.count;
    }

    console.log('🔧 Fixed users without status:', statusUpdates);

    return NextResponse.json({
      success: true,
      message: 'Fixed users successfully',
      data: {
        roleUpdates,
        statusUpdates
      }
    });
  } catch (error) {
    console.error('Error fixing users:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}