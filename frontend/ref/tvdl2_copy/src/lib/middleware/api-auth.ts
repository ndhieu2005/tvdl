import { NextRequest, NextResponse } from 'next/server';
import { 
  hashApiKey, 
  isValidApiKeyFormat, 
  getClientIp, 
  isIpWhitelisted, 
  isApiKeyExpired, 
  hasPermission 
} from '../api-key-server';

export interface ApiAuthRequest extends NextRequest {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
  apiKey?: {
    id: string;
    name: string;
    permissions: { resource: string; action: string }[];
  };
}

// Validate API key against database (moved to API route)
async function validateApiKeyInDatabase(apiKey: string, clientIp: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/internal/validate-api-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey, clientIp }),
    });
    
    if (!response.ok) {
      return { valid: false, error: 'Invalid API key' };
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Key validation error:', error);
    return { valid: false, error: 'Internal server error' };
  }
}

// Middleware để xác thực API key
export async function withApiAuth(
  req: NextRequest,
  resource: string,
  action: string
): Promise<{ 
  success: boolean; 
  response?: NextResponse; 
  user?: any; 
  apiKey?: any; 
}> {
  try {
    // Lấy API key từ header
    const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      const response = NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
      return { success: false, response };
    }

    // Validate API key format
    if (!isValidApiKeyFormat(apiKey)) {
      const response = NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 401 }
      );
      return { success: false, response };
    }

    // Lấy client IP
    const clientIp = getClientIp(req);

    // Validate API key against database
    const validation = await validateApiKeyInDatabase(apiKey, clientIp);
    
    if (!validation.valid) {
      const response = NextResponse.json(
        { error: validation.error },
        { status: 401 }
      );
      return { success: false, response };
    }

    // Check permissions
    if (!hasPermission(validation.apiKey.permissions, resource, action)) {
      const response = NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
      return { success: false, response };
    }

    return { 
      success: true, 
      user: validation.apiKey.user, 
      apiKey: validation.apiKey 
    };
    
  } catch (error) {
    console.error('API Auth Error:', error);
    
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    
    return { success: false, response };
  }
}

// Log API usage via internal API
async function logApiUsage(
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  ipAddress: string,
  userAgent: string | null,
  responseTime: number
) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/internal/log-usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKeyId,
        endpoint,
        method,
        statusCode,
        ipAddress,
        userAgent,
        responseTime,
      }),
    });
  } catch (error) {
    console.error('Failed to log API usage:', error);
  }
}

// Higher-order function để wrap API handlers
export function withApiKeyAuth(
  resource: string,
  action: string,
  handler: (req: ApiAuthRequest, context: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: any) => {
    const auth = await withApiAuth(req, resource, action);
    
    if (!auth.success) {
      return auth.response!;
    }
    
    // Attach user và apiKey vào request
    const authReq = req as ApiAuthRequest;
    authReq.user = auth.user;
    authReq.apiKey = auth.apiKey;
    
    const startTime = Date.now();
    
    try {
      const response = await handler(authReq, context);
      
      // Log successful API usage
      await logApiUsage(
        auth.apiKey!.id,
        req.nextUrl.pathname,
        req.method,
        response.status,
        getClientIp(req),
        req.headers.get('user-agent'),
        Date.now() - startTime
      );
      
      return response;
      
    } catch (error) {
      console.error('API Handler Error:', error);
      
      // Log error
      await logApiUsage(
        auth.apiKey!.id,
        req.nextUrl.pathname,
        req.method,
        500,
        getClientIp(req),
        req.headers.get('user-agent'),
        Date.now() - startTime
      );
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}