import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getSecurityStatistics, runSecurityMaintenance } from '@/lib/cleanup';
import { addSecurityHeaders } from '@/lib/middleware/security';

// GET - Lấy thống kê bảo mật
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return addSecurityHeaders(NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 }));
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return addSecurityHeaders(NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 }));
    }

    const statistics = await getSecurityStatistics();
    
    if (!statistics.success) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Lỗi khi lấy thống kê bảo mật', details: statistics.error },
        { status: 500 }
      ));
    }

    return addSecurityHeaders(NextResponse.json({
      success: true,
      data: statistics.data
    }));
  } catch (error) {
    console.error('Error getting security statistics:', error);
    return addSecurityHeaders(NextResponse.json(
      { error: 'Lỗi server khi lấy thống kê bảo mật' },
      { status: 500 }
    ));
  }
}

// POST - Chạy maintenance bảo mật
export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return addSecurityHeaders(NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 }));
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return addSecurityHeaders(NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 }));
    }

    const maintenanceResult = await runSecurityMaintenance();
    
    if (!maintenanceResult.success) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Lỗi khi chạy maintenance bảo mật', details: maintenanceResult.error },
        { status: 500 }
      ));
    }

    return addSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Maintenance bảo mật hoàn thành',
      data: maintenanceResult
    }));
  } catch (error) {
    console.error('Error running security maintenance:', error);
    return addSecurityHeaders(NextResponse.json(
      { error: 'Lỗi server khi chạy maintenance bảo mật' },
      { status: 500 }
    ));
  }
}