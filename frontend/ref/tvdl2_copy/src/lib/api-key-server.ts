// Server-side API key utilities (Node.js runtime only)
import { createHash, randomBytes } from 'crypto';

// Tạo API key mới
export function generateApiKey(): string {
  return `vp_${randomBytes(32).toString('hex')}`;
}

// Hash API key để lưu trong database
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

// Validate API key format
export function isValidApiKeyFormat(apiKey: string): boolean {
  return /^vp_[a-f0-9]{64}$/.test(apiKey);
}

// Extract IP from request
export function getClientIp(request: any): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = request.ip;
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIp || ip || 'unknown';
}

// Check if IP is in whitelist
export function isIpWhitelisted(clientIp: string, whitelist: string[]): boolean {
  if (whitelist.length === 0) return true;
  return whitelist.includes(clientIp);
}

// Check rate limit (simplified version)
export function isRateLimitExceeded(usageCount: number, rateLimit: number, timeWindow: number = 3600): boolean {
  // This is a simplified check - in production you'd want to check usage within time window
  return usageCount >= rateLimit;
}

// Check if API key is expired
export function isApiKeyExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return expiresAt < new Date();
}

// Check permission
export function hasPermission(
  permissions: { resource: string; action: string }[],
  resource: string,
  action: string
): boolean {
  return permissions.some(p => p.resource === resource && p.action === action);
}