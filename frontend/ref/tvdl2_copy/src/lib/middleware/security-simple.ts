import { NextRequest, NextResponse } from 'next/server';

export function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIp) return cfConnectingIp;
  if (xRealIp) return xRealIp;
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
  
  return '127.0.0.1';
}

export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove onXxx= attributes
    .replace(/&lt;/g, '') // Remove encoded <
    .replace(/&gt;/g, '') // Remove encoded >
    .trim();
}

export function detectSuspiciousActivity(request: NextRequest): {
  isSuspicious: boolean;
  severity: 'low' | 'medium' | 'high';
  reason: string;
} {
  const path = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';
  const query = request.nextUrl.search;
  
  // Check for common attack patterns
  const suspiciousPatterns = [
    // Path traversal
    /\.\.[\/\\]/,
    // Admin access attempts
    /\/admin|\/wp-admin|\/phpmyadmin/i,
    // File extensions
    /\.(php|jsp|asp|aspx|cgi|pl)$/i,
    // Script injection
    /<script|javascript:|vbscript:/i,
    // SQL injection
    /union\s+select|drop\s+table|insert\s+into/i,
    // XSS attempts
    /alert\(|document\.cookie|window\.location/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(path) || pattern.test(query)) {
      return {
        isSuspicious: true,
        severity: 'high',
        reason: 'Suspicious path or query detected'
      };
    }
  }
  
  // Check for bot/crawler patterns
  const botPatterns = [
    /bot|crawler|spider|scraper/i,
    /curl|wget|python|java|go-http/i
  ];
  
  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      return {
        isSuspicious: true,
        severity: 'low',
        reason: 'Automated request detected'
      };
    }
  }
  
  return {
    isSuspicious: false,
    severity: 'low',
    reason: ''
  };
}

export async function loginSecurityMiddleware(request: NextRequest, email: string): Promise<{
  allowed: boolean;
  reason?: string;
  statusCode?: number;
  remainingAttempts?: number;
}> {
  // For now, just return allowed
  // In production, this would check against database
  return {
    allowed: true
  };
}