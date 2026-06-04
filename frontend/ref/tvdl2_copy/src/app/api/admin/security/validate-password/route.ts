import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, getSecuritySettings } from '@/lib/security';

// POST - Validate password according to security settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ 
        error: 'Mật khẩu là bắt buộc' 
      }, { status: 400 });
    }

    // Get current security settings
    const securitySettings = await getSecuritySettings();
    
    // Validate password
    const validation = validatePassword(password, {
      minLength: securitySettings.minPasswordLength,
      requireUppercase: securitySettings.requireUppercase,
      requireLowercase: securitySettings.requireLowercase,
      requireNumbers: securitySettings.requireNumbers,
      requireSpecialChars: securitySettings.requireSpecialChars
    });

    return NextResponse.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Error validating password:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi validate mật khẩu' },
      { status: 500 }
    );
  }
}