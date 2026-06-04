import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';
import { blockIP } from '@/lib/security';

const prisma = new PrismaClient();

// GET - Lấy danh sách IP bị chặn
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
    const ipAddress = searchParams.get('ip');
    const isActive = searchParams.get('active');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (ipAddress) {
      where.ipAddress = {
        contains: ipAddress
      };
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get total count
    const total = await prisma.blockedIP.count({ where });

    // Get blocked IPs
    const blockedIPs = await prisma.blockedIP.findMany({
      where,
      orderBy: {
        blockedAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get statistics
    const activeCount = await prisma.blockedIP.count({
      where: {
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    const expiredCount = await prisma.blockedIP.count({
      where: {
        isActive: true,
        expiresAt: {
          lt: new Date()
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        blockedIPs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        statistics: {
          active: activeCount,
          expired: expiredCount,
          total: activeCount + expiredCount
        }
      }
    });
  } catch (error) {
    console.error('Error getting blocked IPs:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi lấy danh sách IP bị chặn' },
      { status: 500 }
    );
  }
}

// POST - Thêm IP vào danh sách chặn
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { ipAddress, reason, durationMinutes } = body;

    // Validate input
    if (!ipAddress || !reason) {
      return NextResponse.json({ 
        error: 'IP address và lý do là bắt buộc' 
      }, { status: 400 });
    }

    // Validate IP address format
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ipAddress)) {
      return NextResponse.json({ 
        error: 'Định dạng IP address không hợp lệ' 
      }, { status: 400 });
    }

    // Block the IP
    await blockIP(ipAddress, reason, durationMinutes);

    return NextResponse.json({
      success: true,
      message: `Đã chặn IP ${ipAddress}`
    });
  } catch (error) {
    console.error('Error blocking IP:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi chặn IP' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa IP khỏi danh sách chặn
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
    const ipAddress = searchParams.get('ip');
    const action = searchParams.get('action') || 'unblock';

    if (!ipAddress) {
      return NextResponse.json({ error: 'IP address là bắt buộc' }, { status: 400 });
    }

    if (action === 'unblock') {
      // Unblock the IP
      const result = await prisma.blockedIP.updateMany({
        where: { ipAddress },
        data: { isActive: false }
      });

      if (result.count === 0) {
        return NextResponse.json({ 
          error: 'Không tìm thấy IP để unblock' 
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Đã bỏ chặn IP ${ipAddress}`
      });
    } else if (action === 'delete') {
      // Delete the IP record
      const result = await prisma.blockedIP.deleteMany({
        where: { ipAddress }
      });

      if (result.count === 0) {
        return NextResponse.json({ 
          error: 'Không tìm thấy IP để xóa' 
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Đã xóa IP ${ipAddress} khỏi danh sách`
      });
    } else {
      return NextResponse.json({ 
        error: 'Action không hợp lệ. Sử dụng unblock hoặc delete' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing blocked IP:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi quản lý IP bị chặn' },
      { status: 500 }
    );
  }
}