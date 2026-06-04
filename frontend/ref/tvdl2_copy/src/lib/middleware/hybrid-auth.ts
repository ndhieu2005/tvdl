import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../jwt';
import { prisma } from '../prisma';
import { 
  isValidApiKeyFormat, 
  hashApiKey, 
  getClientIp, 
  isIpWhitelisted, 
  isApiKeyExpired, 
  hasPermission 
} from '../api-key-server';

export interface HybridAuthRequest extends NextRequest {
  user?: JWTPayload;
  authType?: 'jwt' | 'apikey';
  apiKey?: {
    id: string;
    name: string;
    permissions: { resource: string; action: string }[];
  };
}

// Validate API key directly with database
async function validateApiKey(req: NextRequest, resource: string, action: string) {
  try {
    console.log('🔑 validateApiKey - Starting validation');
    
    // Get API key from headers
    const authHeader = req.headers.get('Authorization');
    const apiKeyHeader = req.headers.get('x-api-key');
    const token = extractTokenFromHeader(authHeader) || apiKeyHeader;
    
    if (!token) {
      return { success: false, error: 'API key is required' };
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 validateApiKey - Token:', token.substring(0, 20) + '...');
    }
    
    // Validate API key format
    if (!isValidApiKeyFormat(token)) {
      return { success: false, error: 'Invalid API key format' };
    }
    
    // Hash the API key
    const keyHash = hashApiKey(token);
    console.log('🔑 validateApiKey - Key hash:', keyHash.substring(0, 20) + '...');
    
    // Find API key in database
    const dbApiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: {
        permissions: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });
    
    console.log('🔑 validateApiKey - DB API key found:', !!dbApiKey);
    
    if (!dbApiKey) {
      return { success: false, error: 'Invalid API key' };
    }
    
    if (!dbApiKey.isActive) {
      return { success: false, error: 'API key is inactive' };
    }
    
    if (isApiKeyExpired(dbApiKey.expiresAt)) {
      return { success: false, error: 'API key has expired' };
    }
    
    // Check IP whitelist
    const clientIp = getClientIp(req);
    console.log('🔑 validateApiKey - Client IP:', clientIp);
    
    const ipWhitelist = dbApiKey.ipWhitelist ? JSON.parse(dbApiKey.ipWhitelist) : [];
    if (!isIpWhitelisted(clientIp, ipWhitelist)) {
      return { success: false, error: 'IP address not whitelisted' };
    }
    
    // Check permissions
    console.log('🔑 validateApiKey - Checking permissions:', resource, action);
    console.log('🔑 validateApiKey - Available permissions:', dbApiKey.permissions);
    
    if (!hasPermission(dbApiKey.permissions, resource, action)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Check rate limiting
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentUsage = await prisma.apiUsageLog.count({
      where: {
        apiKeyId: dbApiKey.id,
        createdAt: { gte: hourAgo },
      },
    });
    
    console.log('🔑 validateApiKey - Recent usage:', recentUsage, 'Rate limit:', dbApiKey.rateLimit);
    
    if (recentUsage >= dbApiKey.rateLimit) {
      return { success: false, error: 'Rate limit exceeded' };
    }
    
    // Update usage
    await prisma.apiKey.update({
      where: { id: dbApiKey.id },
      data: {
        lastUsed: new Date(),
        usageCount: { increment: 1 },
      },
    });
    
    console.log('🔑 validateApiKey - Validation successful');
    
    return { 
      success: true, 
      user: dbApiKey.user,
      apiKey: {
        id: dbApiKey.id,
        name: dbApiKey.name,
        permissions: dbApiKey.permissions,
      }
    };
    
  } catch (error) {
    console.error('🔑 validateApiKey - Error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Hybrid middleware có thể xử lý cả JWT và API key
export const withHybridAuth = (
  resource: string,
  action: string,
  handler: (req: HybridAuthRequest, context?: any) => Promise<NextResponse>
) => {
  return async (req: HybridAuthRequest, context?: any) => {
    try {
      console.log('🔄 withHybridAuth - Starting authentication');
      
      const authHeader = req.headers.get('Authorization');
      const apiKeyHeader = req.headers.get('x-api-key');
      
      console.log('🔄 withHybridAuth - Authorization header:', authHeader);
      console.log('🔄 withHybridAuth - API key header:', apiKeyHeader);
      
      // Prioritize JWT token from Authorization header
      const jwtToken = extractTokenFromHeader(authHeader);
      const apiKeyToken = apiKeyHeader;
      
      if (!jwtToken && !apiKeyToken) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 withHybridAuth - No token provided');
        }
        return NextResponse.json(
          { error: 'Token không được cung cấp' },
          { status: 401 }
        );
      }
      
      // Try JWT first if available
      if (jwtToken) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 withHybridAuth - JWT token preview:', jwtToken.substring(0, 20) + '...');
          console.log('🔄 withHybridAuth - Detected JWT token format');
        }
        
        // Use JWT authentication
        const decoded = verifyToken(jwtToken);
        
        if (!decoded) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 withHybridAuth - JWT token verification failed');
          }
          return NextResponse.json(
            { error: 'Token không hợp lệ' },
            { status: 401 }
          );
        }
        
        // Verify user exists and is active
        const currentUser = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { role: true, status: true }
        });
        
        if (!currentUser) {
          console.log('🔄 withHybridAuth - User not found in database');
          return NextResponse.json(
            { error: 'Người dùng không tồn tại' },
            { status: 404 }
          );
        }
        
        if (currentUser.status !== 'ACTIVE') {
          console.log('🔄 withHybridAuth - User account is not active:', currentUser.status);
          return NextResponse.json(
            { error: 'Tài khoản không hoạt động' },
            { status: 403 }
          );
        }
        
        // Update user with current role from database
        decoded.role = currentUser.role;
        
        req.user = decoded;
        req.authType = 'jwt';
        
        // Check role for JWT authentication
        if (decoded.role !== 'ADMIN' && decoded.role !== 'EDITOR') {
          console.log('🔄 withHybridAuth - JWT: Access denied for role:', decoded.role);
          return NextResponse.json(
            { error: 'Bạn không có quyền truy cập' },
            { status: 403 }
          );
        }
        
        console.log('🔄 withHybridAuth - JWT authentication successful');
        return await handler(req, context);
        
      } else if (apiKeyToken && isValidApiKeyFormat(apiKeyToken)) {
        // Try API key authentication
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 withHybridAuth - API key token preview:', apiKeyToken.substring(0, 20) + '...');
          console.log('🔄 withHybridAuth - Detected API key format');
        }
        
        // Use API key authentication via internal validation
        const apiAuth = await validateApiKey(req, resource, action);
        
        if (!apiAuth.success) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 withHybridAuth - API key authentication failed:', apiAuth.error);
          }
          return NextResponse.json(
            { error: apiAuth.error || 'API key authentication failed' },
            { status: 401 }
          );
        }
        
        // Set up request with API key auth data
        req.user = {
          userId: apiAuth.user!.id,
          email: apiAuth.user!.email,
          role: apiAuth.user!.role,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
        };
        req.authType = 'apikey';
        req.apiKey = apiAuth.apiKey;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 withHybridAuth - API key authentication successful');
        }
        return await handler(req, context);
        
      } else {
        return NextResponse.json(
          { error: 'Token không hợp lệ hoặc không được hỗ trợ' },
          { status: 401 }
        );
      }
      
    } catch (error) {
      console.error('🔄 withHybridAuth - Error:', error);
      return NextResponse.json(
        { error: 'Lỗi xác thực' },
        { status: 500 }
      );
    }
  };
};

// Hybrid middleware với editor permissions
export const withHybridEditorAuth = (
  handler: (req: HybridAuthRequest, context?: any) => Promise<NextResponse>
) => {
  return withHybridAuth('posts', 'read', async (req: HybridAuthRequest, context?: any) => {
    try {
      const user = req.user!;
      
      console.log('🔄 withHybridEditorAuth - User role:', user.role);
      console.log('🔄 withHybridEditorAuth - Auth type:', req.authType);
      
      // Check permissions based on auth type
      if (req.authType === 'jwt') {
        // JWT authentication - check role
        if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
          console.log('🔄 withHybridEditorAuth - JWT: Access denied for role:', user.role);
          return NextResponse.json(
            { error: 'Bạn không có quyền truy cập' },
            { status: 403 }
          );
        }
      } else if (req.authType === 'apikey') {
        // API key authentication - permissions already checked in withApiAuth
        // Additional check for editor-level access if needed
        if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
          console.log('🔄 withHybridEditorAuth - API key: Access denied for role:', user.role);
          return NextResponse.json(
            { error: 'Bạn không có quyền truy cập' },
            { status: 403 }
          );
        }
      }
      
      console.log('🔄 withHybridEditorAuth - Access granted');
      return await handler(req, context);
      
    } catch (error) {
      console.error('🔄 withHybridEditorAuth - Error:', error);
      return NextResponse.json(
        { error: 'Lỗi xác thực' },
        { status: 500 }
      );
    }
  });
};

// Hybrid middleware với admin permissions
export const withHybridAdminAuth = (
  handler: (req: HybridAuthRequest, context?: any) => Promise<NextResponse>
) => {
  return withHybridAuth('posts', 'admin', async (req: HybridAuthRequest, context?: any) => {
    try {
      const user = req.user!;
      
      console.log('🔄 withHybridAdminAuth - User role:', user.role);
      console.log('🔄 withHybridAdminAuth - Auth type:', req.authType);
      
      // Check admin permissions
      if (user.role !== 'ADMIN') {
        console.log('🔄 withHybridAdminAuth - Access denied for role:', user.role);
        return NextResponse.json(
          { error: 'Bạn không có quyền truy cập' },
          { status: 403 }
        );
      }
      
      console.log('🔄 withHybridAdminAuth - Access granted');
      return await handler(req, context);
      
    } catch (error) {
      console.error('🔄 withHybridAdminAuth - Error:', error);
      return NextResponse.json(
        { error: 'Lỗi xác thực' },
        { status: 500 }
      );
    }
  });
};