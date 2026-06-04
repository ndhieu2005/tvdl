export interface SecuritySettings {
  id: string;
  
  // Authentication Security
  maxFailedLogins: number;
  sessionTimeout: number;
  minPasswordLength: number;
  
  // Two-Factor Authentication
  twoFactorEnabled: boolean;
  
  // CAPTCHA
  captchaEnabled: boolean;
  captchaProvider: string;
  captchaThreshold: number;
  
  // IP Security
  ipBlockingEnabled: boolean;
  ipBlockDuration: number;
  ipWhitelist: string[];
  ipBlacklist: string[];
  
  // Spam Protection
  spamFilterEnabled: boolean;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  
  // Password Policy
  strongPasswordRequired: boolean;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays: number;
  
  // Metadata
  updatedBy: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface UpdateSecuritySettingsRequest {
  maxFailedLogins?: number;
  sessionTimeout?: number;
  minPasswordLength?: number;
  twoFactorEnabled?: boolean;
  captchaEnabled?: boolean;
  captchaProvider?: string;
  captchaThreshold?: number;
  ipBlockingEnabled?: boolean;
  ipBlockDuration?: number;
  ipWhitelist?: string[];
  ipBlacklist?: string[];
  spamFilterEnabled?: boolean;
  maxRequestsPerMinute?: number;
  maxRequestsPerHour?: number;
  strongPasswordRequired?: boolean;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  passwordExpiryDays?: number;
}

export interface LoginAttempt {
  id: string;
  email?: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  timestamp: Date;
}

export interface BlockedIP {
  id: string;
  ipAddress: string;
  reason: string;
  blockedAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface SessionToken {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent?: string;
  expiresAt: Date;
  lastUsed: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PasswordValidationResult {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
  suggestions: string[];
}

export interface RateLimitInfo {
  requestsPerMinute: number;
  requestsPerHour: number;
  remainingMinute: number;
  remainingHour: number;
  resetTimeMinute: Date;
  resetTimeHour: Date;
}