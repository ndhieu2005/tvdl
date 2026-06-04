import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth } from '@/lib/middleware/api-auth';

// GET: Lấy settings với API key
export const GET = withApiKeyAuth('settings', 'read', async (req: NextRequest) => {
  try {
    console.log('⚙️ Public API - Getting settings');

    const { prisma } = await import('@/lib/prisma');
    
    const settings = await prisma.securitySettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (!settings) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'Chưa có settings nào được cấu hình'
      });
    }
    
    // Remove sensitive fields
    const publicSettings = {
      id: settings.id,
      maxFailedLogins: settings.maxFailedLogins,
      sessionTimeout: settings.sessionTimeout,
      minPasswordLength: settings.minPasswordLength,
      twoFactorEnabled: settings.twoFactorEnabled,
      captchaEnabled: settings.captchaEnabled,
      captchaProvider: settings.captchaProvider,
      captchaThreshold: settings.captchaThreshold,
      ipBlockingEnabled: settings.ipBlockingEnabled,
      ipBlockDuration: settings.ipBlockDuration,
      spamFilterEnabled: settings.spamFilterEnabled,
      maxRequestsPerMinute: settings.maxRequestsPerMinute,
      maxRequestsPerHour: settings.maxRequestsPerHour,
      strongPasswordRequired: settings.strongPasswordRequired,
      requireUppercase: settings.requireUppercase,
      requireLowercase: settings.requireLowercase,
      requireNumbers: settings.requireNumbers,
      requireSpecialChars: settings.requireSpecialChars,
      passwordExpiryDays: settings.passwordExpiryDays,
      updatedAt: settings.updatedAt,
      createdAt: settings.createdAt
    };
    
    console.log('⚙️ Public API - Settings found');
    
    return NextResponse.json({
      success: true,
      data: publicSettings
    });

  } catch (error) {
    console.error('⚙️ Public API - Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy settings' },
      { status: 500 }
    );
  }
});

// PUT: Update settings với API key
export const PUT = withApiKeyAuth('settings', 'update', async (req: NextRequest) => {
  try {
    const body = await req.json();
    console.log('⚙️ Public API - Updating settings with data:', body);

    // Get user ID from API key context
    const userReq = req as any;
    const userId = userReq.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Không thể xác định user ID từ API key' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Get current settings
    const currentSettings = await prisma.securitySettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    const settingsData = {
      maxFailedLogins: body.maxFailedLogins ?? currentSettings?.maxFailedLogins ?? 5,
      sessionTimeout: body.sessionTimeout ?? currentSettings?.sessionTimeout ?? 1440,
      minPasswordLength: body.minPasswordLength ?? currentSettings?.minPasswordLength ?? 8,
      twoFactorEnabled: body.twoFactorEnabled ?? currentSettings?.twoFactorEnabled ?? false,
      captchaEnabled: body.captchaEnabled ?? currentSettings?.captchaEnabled ?? false,
      captchaProvider: body.captchaProvider ?? currentSettings?.captchaProvider ?? 'recaptcha',
      captchaThreshold: body.captchaThreshold ?? currentSettings?.captchaThreshold ?? 0.5,
      ipBlockingEnabled: body.ipBlockingEnabled ?? currentSettings?.ipBlockingEnabled ?? false,
      ipBlockDuration: body.ipBlockDuration ?? currentSettings?.ipBlockDuration ?? 60,
      ipWhitelist: body.ipWhitelist ?? currentSettings?.ipWhitelist ?? [],
      ipBlacklist: body.ipBlacklist ?? currentSettings?.ipBlacklist ?? [],
      spamFilterEnabled: body.spamFilterEnabled ?? currentSettings?.spamFilterEnabled ?? false,
      maxRequestsPerMinute: body.maxRequestsPerMinute ?? currentSettings?.maxRequestsPerMinute ?? 60,
      maxRequestsPerHour: body.maxRequestsPerHour ?? currentSettings?.maxRequestsPerHour ?? 1000,
      strongPasswordRequired: body.strongPasswordRequired ?? currentSettings?.strongPasswordRequired ?? true,
      requireUppercase: body.requireUppercase ?? currentSettings?.requireUppercase ?? true,
      requireLowercase: body.requireLowercase ?? currentSettings?.requireLowercase ?? true,
      requireNumbers: body.requireNumbers ?? currentSettings?.requireNumbers ?? true,
      requireSpecialChars: body.requireSpecialChars ?? currentSettings?.requireSpecialChars ?? true,
      passwordExpiryDays: body.passwordExpiryDays ?? currentSettings?.passwordExpiryDays ?? 90,
      updatedBy: userId
    };
    
    let updatedSettings;
    
    if (currentSettings) {
      // Update existing settings
      updatedSettings = await prisma.securitySettings.update({
        where: { id: currentSettings.id },
        data: settingsData
      });
    } else {
      // Create new settings
      updatedSettings = await prisma.securitySettings.create({
        data: settingsData
      });
    }
    
    console.log('⚙️ Public API - Settings updated');
    
    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Settings đã được cập nhật thành công'
    });

  } catch (error) {
    console.error('⚙️ Public API - Update Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật settings' },
      { status: 500 }
    );
  }
});