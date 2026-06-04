import { PrismaClient } from '@prisma/client';
import { PasswordValidationResult, SecurityValidationResult, RateLimitInfo } from '@/types/security';

const prisma = new PrismaClient();

// Password validation functions
export function validatePassword(password: string, requirements: {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}): PasswordValidationResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  // Check minimum length
  if (password.length < requirements.minLength) {
    errors.push(`Mật khẩu phải có ít nhất ${requirements.minLength} ký tự`);
  }
  
  // Check uppercase
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất một chữ hoa');
    suggestions.push('Thêm chữ hoa vào mật khẩu');
  }
  
  // Check lowercase
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất một chữ thường');
    suggestions.push('Thêm chữ thường vào mật khẩu');
  }
  
  // Check numbers
  if (requirements.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất một số');
    suggestions.push('Thêm số vào mật khẩu');
  }
  
  // Check special characters
  if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất một ký tự đặc biệt');
    suggestions.push('Thêm ký tự đặc biệt (!@#$%^&*) vào mật khẩu');
  }
  
  // Calculate password strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let strengthScore = 0;
  
  if (password.length >= 8) strengthScore += 1;
  if (password.length >= 12) strengthScore += 1;
  if (/[A-Z]/.test(password)) strengthScore += 1;
  if (/[a-z]/.test(password)) strengthScore += 1;
  if (/[0-9]/.test(password)) strengthScore += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strengthScore += 1;
  if (password.length >= 16) strengthScore += 1;
  
  if (strengthScore >= 6) strength = 'strong';
  else if (strengthScore >= 4) strength = 'medium';
  
  return {
    isValid: errors.length === 0,
    strength,
    errors,
    suggestions
  };
}

// Login attempt tracking
export async function recordLoginAttempt(
  email: string | null,
  ipAddress: string,
  userAgent: string | null,
  success: boolean,
  failureReason?: string
) {
  await prisma.loginAttempt.create({
    data: {
      email,
      ipAddress,
      userAgent,
      success,
      failureReason
    }
  });
}

// Check if IP should be blocked
export async function shouldBlockIP(ipAddress: string): Promise<boolean> {
  const securitySettings = await getSecuritySettings();
  
  if (!securitySettings.ipBlockingEnabled) {
    return false;
  }
  
  // Check if IP is in whitelist
  const ipWhitelist = securitySettings.ipWhitelist ? JSON.parse(securitySettings.ipWhitelist) : [];
  if (ipWhitelist.includes(ipAddress)) {
    return false;
  }
  
  // Check if IP is in blacklist
  const ipBlacklist = securitySettings.ipBlacklist ? JSON.parse(securitySettings.ipBlacklist) : [];
  if (ipBlacklist.includes(ipAddress)) {
    return true;
  }
  
  // Check if IP is currently blocked
  const blockedIP = await prisma.blockedIP.findFirst({
    where: {
      ipAddress,
      isActive: true,
      expiresAt: {
        gt: new Date()
      }
    }
  });
  
  return !!blockedIP;
}

// Get failed login attempts for an IP
export async function getFailedLoginAttempts(ipAddress: string, email?: string): Promise<number> {
  const securitySettings = await getSecuritySettings();
  const timeThreshold = new Date(Date.now() - 60 * 60 * 1000); // Last hour
  
  const failedAttempts = await prisma.loginAttempt.count({
    where: {
      ipAddress,
      email,
      success: false,
      timestamp: {
        gte: timeThreshold
      }
    }
  });
  
  return failedAttempts;
}

// Block an IP address
export async function blockIP(ipAddress: string, reason: string, durationMinutes?: number) {
  const securitySettings = await getSecuritySettings();
  const duration = durationMinutes || securitySettings.ipBlockDuration;
  const expiresAt = new Date(Date.now() + duration * 60 * 1000);
  
  await prisma.blockedIP.upsert({
    where: { ipAddress },
    update: {
      reason,
      expiresAt,
      isActive: true
    },
    create: {
      ipAddress,
      reason,
      expiresAt,
      isActive: true
    }
  });
}

// Rate limiting functions
const rateLimitMap = new Map<string, { minute: number[], hour: number[] }>();

export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; info: RateLimitInfo }> {
  const securitySettings = await getSecuritySettings();
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const hour = Math.floor(now / 3600000);
  
  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, { minute: [], hour: [] });
  }
  
  const userLimits = rateLimitMap.get(identifier)!;
  
  // Clean old entries
  userLimits.minute = userLimits.minute.filter(t => t > minute - 1);
  userLimits.hour = userLimits.hour.filter(t => t > hour - 1);
  
  const requestsPerMinute = userLimits.minute.length;
  const requestsPerHour = userLimits.hour.length;
  
  const info: RateLimitInfo = {
    requestsPerMinute,
    requestsPerHour,
    remainingMinute: Math.max(0, securitySettings.maxRequestsPerMinute - requestsPerMinute),
    remainingHour: Math.max(0, securitySettings.maxRequestsPerHour - requestsPerHour),
    resetTimeMinute: new Date((minute + 1) * 60000),
    resetTimeHour: new Date((hour + 1) * 3600000)
  };
  
  const allowed = requestsPerMinute < securitySettings.maxRequestsPerMinute &&
                  requestsPerHour < securitySettings.maxRequestsPerHour;
  
  if (allowed) {
    userLimits.minute.push(minute);
    userLimits.hour.push(hour);
  }
  
  return { allowed, info };
}

// Get security settings
export async function getSecuritySettings() {
  let settings = await prisma.securitySettings.findFirst();
  
  if (!settings) {
    // Create default settings
    settings = await prisma.securitySettings.create({
      data: {
        updatedBy: 'system'
      }
    });
  }
  
  return settings;
}

// Update security settings
export async function updateSecuritySettings(updates: any, updatedBy: string) {
  const settings = await getSecuritySettings();
  
  return await prisma.securitySettings.update({
    where: { id: settings.id },
    data: {
      ...updates,
      updatedBy
    }
  });
}

// Validate security settings
export function validateSecuritySettings(settings: any): SecurityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate numeric values
  if (settings.maxFailedLogins !== undefined && settings.maxFailedLogins < 1) {
    errors.push('Số lần đăng nhập sai phải lớn hơn 0');
  }
  
  if (settings.sessionTimeout !== undefined && settings.sessionTimeout < 5) {
    errors.push('Thời gian session phải ít nhất 5 phút');
  }
  
  if (settings.minPasswordLength !== undefined && settings.minPasswordLength < 4) {
    errors.push('Độ dài mật khẩu tối thiểu phải ít nhất 4 ký tự');
  }
  
  if (settings.captchaThreshold !== undefined && (settings.captchaThreshold < 0 || settings.captchaThreshold > 1)) {
    errors.push('Ngưỡng CAPTCHA phải từ 0 đến 1');
  }
  
  if (settings.ipBlockDuration !== undefined && settings.ipBlockDuration < 1) {
    errors.push('Thời gian chặn IP phải lớn hơn 0');
  }
  
  if (settings.maxRequestsPerMinute !== undefined && settings.maxRequestsPerMinute < 1) {
    errors.push('Giới hạn requests/phút phải lớn hơn 0');
  }
  
  if (settings.maxRequestsPerHour !== undefined && settings.maxRequestsPerHour < 1) {
    errors.push('Giới hạn requests/giờ phải lớn hơn 0');
  }
  
  if (settings.passwordExpiryDays !== undefined && settings.passwordExpiryDays < 1) {
    errors.push('Thời gian hết hạn mật khẩu phải lớn hơn 0');
  }
  
  // Add warnings for security recommendations
  if (settings.maxFailedLogins !== undefined && settings.maxFailedLogins > 10) {
    warnings.push('Số lần đăng nhập sai quá cao, khuyến nghị dưới 10');
  }
  
  if (settings.sessionTimeout !== undefined && settings.sessionTimeout > 24 * 60) {
    warnings.push('Thời gian session quá dài, khuyến nghị dưới 24 giờ');
  }
  
  if (settings.minPasswordLength !== undefined && settings.minPasswordLength < 8) {
    warnings.push('Độ dài mật khẩu tối thiểu khuyến nghị ít nhất 8 ký tự');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Extract IP address from request
export function getClientIP(request: Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const xClientIP = request.headers.get('x-client-ip');
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  if (xRealIP) {
    return xRealIP;
  }
  
  if (xClientIP) {
    return xClientIP;
  }
  
  return '127.0.0.1'; // fallback
}

// Clean up expired data
export async function cleanupExpiredData() {
  const now = new Date();
  
  // Remove expired blocked IPs
  await prisma.blockedIP.updateMany({
    where: {
      expiresAt: {
        lt: now
      },
      isActive: true
    },
    data: {
      isActive: false
    }
  });
  
  // Remove old login attempts (older than 7 days)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  await prisma.loginAttempt.deleteMany({
    where: {
      timestamp: {
        lt: weekAgo
      }
    }
  });
  
  // Remove expired session tokens
  await prisma.sessionToken.updateMany({
    where: {
      expiresAt: {
        lt: now
      },
      isActive: true
    },
    data: {
      isActive: false
    }
  });
}