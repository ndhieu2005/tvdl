import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// GET - Lấy danh sách login attempts
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const email = searchParams.get('email');
    const ipAddress = searchParams.get('ip');
    const success = searchParams.get('success');
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (email) {
      where.email = {
        contains: email,
        mode: 'insensitive'
      };
    }
    
    if (ipAddress) {
      where.ipAddress = {
        contains: ipAddress
      };
    }
    
    if (success !== null && success !== undefined) {
      where.success = success === 'true';
    }
    
    if (fromDate || toDate) {
      where.timestamp = {};
      if (fromDate) {
        where.timestamp.gte = new Date(fromDate);
      }
      if (toDate) {
        where.timestamp.lte = new Date(toDate);
      }
    }

    // Get total count
    const total = await prisma.loginAttempt.count({ where });

    // Get login attempts
    const loginAttempts = await prisma.loginAttempt.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      skip,
      take: limit
    });

    // Get statistics
    const stats = await prisma.loginAttempt.groupBy({
      by: ['success'],
      _count: {
        success: true
      },
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    const successCount = stats.find(s => s.success)?._count.success || 0;
    const failureCount = stats.find(s => !s.success)?._count.success || 0;

    return NextResponse.json({
      success: true,
      data: {
        loginAttempts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        statistics: {
          last24Hours: {
            successful: successCount,
            failed: failureCount,
            total: successCount + failureCount
          }
        }
      }
    });
  } catch (error) {
    console.error('Error getting login attempts:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi lấy danh sách login attempts' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa login attempts cũ
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    
    if (days < 1) {
      return NextResponse.json({ error: 'Số ngày phải lớn hơn 0' }, { status: 400 });
    }

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const result = await prisma.loginAttempt.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa ${result.count} login attempts cũ hơn ${days} ngày`
    });
  } catch (error) {
    console.error('Error deleting login attempts:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi xóa login attempts' },
      { status: 500 }
    );
  }
}