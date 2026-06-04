import { NextRequest, NextResponse } from 'next/server';
import { 
  shouldBlockIP, 
  getFailedLoginAttempts, 
  blockIP, 
  checkRateLimit,
  getClientIP,
  getSecuritySettings
} from '@/lib/security';

export async function securityMiddleware(request: NextRequest) {
  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  
  try {
    // Check if IP is blocked
    const isBlocked = await shouldBlockIP(ipAddress);
    if (isBlocked) {
      return NextResponse.json(
        { error: 'IP address bị chặn do vi phạm chính sách bảo mật' },
        { status: 403 }
      );
    }

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(ipAddress);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Vượt quá giới hạn requests',
          rateLimitInfo: rateLimitResult.info
        },
        { status: 429 }
      );
    }

    // Add security headers
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Rate limit headers
    response.headers.set('X-RateLimit-Limit-Minute', rateLimitResult.info.requestsPerMinute.toString());
    response.headers.set('X-RateLimit-Remaining-Minute', rateLimitResult.info.remainingMinute.toString());
    response.headers.set('X-RateLimit-Reset-Minute', rateLimitResult.info.resetTimeMinute.toISOString());
    
    response.headers.set('X-RateLimit-Limit-Hour', rateLimitResult.info.requestsPerHour.toString());
    response.headers.set('X-RateLimit-Remaining-Hour', rateLimitResult.info.remainingHour.toString());
    response.headers.set('X-RateLimit-Reset-Hour', rateLimitResult.info.resetTimeHour.toISOString());

    return response;
  } catch (error) {
    console.error('Security middleware error:', error);
    // Continue processing even if security check fails
    return NextResponse.next();
  }
}

export async function loginSecurityMiddleware(request: NextRequest, email?: string) {
  const ipAddress = getClientIP(request);
  const securitySettings = await getSecuritySettings();
  
  try {
    // Check if IP is blocked
    const isBlocked = await shouldBlockIP(ipAddress);
    if (isBlocked) {
      return {
        allowed: false,
        reason: 'IP address bị chặn',
        statusCode: 403
      };
    }

    // Check failed login attempts
    const failedAttempts = await getFailedLoginAttempts(ipAddress, email);
    if (failedAttempts >= securitySettings.maxFailedLogins) {
      // Block IP temporarily
      await blockIP(
        ipAddress, 
        `Vượt quá ${securitySettings.maxFailedLogins} lần đăng nhập sai`,
        securitySettings.ipBlockDuration
      );
      
      return {
        allowed: false,
        reason: `Vượt quá ${securitySettings.maxFailedLogins} lần đăng nhập sai. IP đã bị chặn.`,
        statusCode: 429
      };
    }

    return {
      allowed: true,
      remainingAttempts: securitySettings.maxFailedLogins - failedAttempts
    };
  } catch (error) {
    console.error('Login security middleware error:', error);
    return {
      allowed: true,
      remainingAttempts: securitySettings.maxFailedLogins
    };
  }
}

export async function sessionSecurityMiddleware(request: NextRequest, sessionToken: string) {
  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  
  try {
    // Check if IP is blocked
    const isBlocked = await shouldBlockIP(ipAddress);
    if (isBlocked) {
      return {
        valid: false,
        reason: 'IP address bị chặn',
        statusCode: 403
      };
    }

    // Validate session token format
    if (!sessionToken || typeof sessionToken !== 'string') {
      return {
        valid: false,
        reason: 'Session token không hợp lệ',
        statusCode: 401
      };
    }

    return {
      valid: true,
      ipAddress,
      userAgent
    };
  } catch (error) {
    console.error('Session security middleware error:', error);
    return {
      valid: true,
      ipAddress,
      userAgent
    };
  }
}

export function addSecurityHeaders(response: NextResponse) {
  // Basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS header for HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

export function detectSuspiciousActivity(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  const origin = request.headers.get('origin') || '';
  
  // Check for suspicious user agents
  const suspiciousUserAgents = [
    'curl',
    'wget',
    'python',
    'bot',
    'spider',
    'crawler',
    'scraper'
  ];
  
  for (const suspicious of suspiciousUserAgents) {
    if (userAgent.toLowerCase().includes(suspicious)) {
      return true;
    }
  }
  
  // Check for suspicious patterns
  const url = request.url;
  const suspiciousPatterns = [
    /\.\./,                    // Path traversal
    /\/admin/,                 // Admin access attempts
    /\/wp-admin/,              // WordPress admin
    /\/phpmyadmin/,            // PHPMyAdmin
    /\.php$/,                  // PHP files
    /\.sql$/,                  // SQL files
    /\/\.env/,                 // Environment files
    /\/config/,                // Config files
    /\/backup/,                // Backup files
    /script.*src/i,            // Script injection
    /javascript:/i,            // JavaScript protocol
    /vbscript:/i,              // VBScript protocol
    /onload=/i,                // Event handlers
    /onerror=/i,               // Error handlers
    /eval\(/i,                 // Eval function
    /exec\(/i,                 // Exec function
    /system\(/i,               // System function
    /union.*select/i,          // SQL injection
    /drop.*table/i,            // SQL injection
    /delete.*from/i,           // SQL injection
    /insert.*into/i,           // SQL injection
    /update.*set/i,            // SQL injection
    /<script/i,                // XSS
    /<iframe/i,                // XSS
    /<object/i,                // XSS
    /<embed/i,                 // XSS
    /<form/i,                  // Form injection
    /<img.*src.*javascript/i,  // Image XSS
    /<link.*href.*javascript/i // Link XSS
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      return true;
    }
  }
  
  return false;
}

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove potential XSS vectors
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/onload=/gi, '')
    .replace(/onerror=/gi, '')
    .replace(/onclick=/gi, '')
    .replace(/onmouseover=/gi, '')
    .replace(/onfocus=/gi, '')
    .replace(/onblur=/gi, '')
    .replace(/onchange=/gi, '')
    .replace(/onsubmit=/gi, '')
    .replace(/onkeydown=/gi, '')
    .replace(/onkeyup=/gi, '')
    .replace(/onkeypress=/gi, '')
    .replace(/onmousedown=/gi, '')
    .replace(/onmouseup=/gi, '')
    .replace(/onmousemove=/gi, '')
    .replace(/onmouseout=/gi, '')
    .replace(/oncontextmenu=/gi, '')
    .replace(/ondblclick=/gi, '')
    .replace(/ondrag=/gi, '')
    .replace(/ondrop=/gi, '')
    .replace(/onscroll=/gi, '')
    .replace(/onresize=/gi, '')
    .replace(/onselect=/gi, '')
    .replace(/ontouchstart=/gi, '')
    .replace(/ontouchend=/gi, '')
    .replace(/ontouchmove=/gi, '')
    .replace(/ontouchcancel=/gi, '')
    .trim();
}