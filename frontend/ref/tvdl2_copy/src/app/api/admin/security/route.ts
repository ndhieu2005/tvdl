import { NextRequest, NextResponse } from 'next/server';
import { getSecuritySettings, updateSecuritySettings, validateSecuritySettings } from '@/lib/security';
import { verifyToken } from '@/lib/jwt';

// GET - Lấy cài đặt bảo mật
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

    const settings = await getSecuritySettings();
    
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting security settings:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi lấy cài đặt bảo mật' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật cài đặt bảo mật
export async function PUT(request: NextRequest) {
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
    
    // Validate the settings
    const validation = validateSecuritySettings(body);
    if (!validation.isValid) {
      return NextResponse.json({
        error: 'Dữ liệu không hợp lệ',
        details: validation.errors
      }, { status: 400 });
    }

    // Update settings
    const updatedSettings = await updateSecuritySettings(body, decoded.userId);
    
    return NextResponse.json({
      success: true,
      data: updatedSettings,
      warnings: validation.warnings
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi cập nhật cài đặt bảo mật' },
      { status: 500 }
    );
  }
}

// POST - Reset về cài đặt mặc định
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

    // Reset to default settings
    const defaultSettings = {
      maxFailedLogins: 5,
      sessionTimeout: 1440,
      minPasswordLength: 8,
      twoFactorEnabled: false,
      captchaEnabled: false,
      captchaProvider: 'recaptcha',
      captchaThreshold: 0.5,
      ipBlockingEnabled: false,
      ipBlockDuration: 60,
      ipWhitelist: [],
      ipBlacklist: [],
      spamFilterEnabled: false,
      maxRequestsPerMinute: 60,
      maxRequestsPerHour: 1000,
      strongPasswordRequired: true,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiryDays: 90
    };

    const updatedSettings = await updateSecuritySettings(defaultSettings, decoded.userId);
    
    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Đã reset về cài đặt mặc định'
    });
  } catch (error) {
    console.error('Error resetting security settings:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi reset cài đặt bảo mật' },
      { status: 500 }
    );
  }
}