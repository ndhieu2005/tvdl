import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

// Mock user data for testing
const mockUsers: Record<string, {
  id: string;
  email: string;
  role: string;
  status: string;
}> = {
  'cmcn35lty0000fm38xgjw0qmo': {
    id: 'cmcn35lty0000fm38xgjw0qmo',
    email: 'thedaovan@gmail.com',
    role: 'EDITOR',
    status: 'ACTIVE'
  }
};

export const withAuth = (handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) => {
  return async (req: AuthenticatedRequest, context?: any) => {
    try {
      const authHeader = req.headers.get('Authorization');
      console.log('🔐 withAuth - Authorization header:', authHeader);
      
      const token = extractTokenFromHeader(authHeader);
      console.log('🔐 withAuth - Extracted token:', token ? token.substring(0, 20) + '...' : 'null');

      if (!token) {
        console.log('🔐 withAuth - No token provided');
        return NextResponse.json(
          { error: 'Token không được cung cấp' },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      console.log('🔐 withAuth - Decoded token:', decoded);
      
      if (!decoded) {
        console.log('🔐 withAuth - Token verification failed');
        return NextResponse.json(
          { error: 'Token không hợp lệ' },
          { status: 401 }
        );
      }

      req.user = decoded;
      console.log('🔐 withAuth - User set on request:', req.user);
      return await handler(req, context);
    } catch (error) {
      console.error('🔐 withAuth - Error:', error);
      return NextResponse.json(
        { error: 'Lỗi xác thực' },
        { status: 401 }
      );
    }
  };
};

export const withAdminAuth = (handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) => {
  return withAuth(async (req: AuthenticatedRequest, context?: any) => {
    try {
      console.log('🔐 withAdminAuth - User from JWT:', req.user);
      
      // Get user from mock data
      const mockUser = mockUsers[req.user!.userId];
      
      if (!mockUser) {
        console.log('🔐 withAdminAuth - User not found in mock data');
        return NextResponse.json(
          { error: 'Người dùng không tồn tại' },
          { status: 404 }
        );
      }
      
      if (mockUser.status !== 'ACTIVE') {
        console.log('🔐 withAdminAuth - User account is not active:', mockUser.status);
        return NextResponse.json(
          { error: 'Tài khoản không hoạt động' },
          { status: 403 }
        );
      }
      
      console.log('🔐 withAdminAuth - Current user role from mock:', mockUser.role);
      
      // Update user object with current role from mock data
      req.user!.role = mockUser.role;
      
      if (mockUser.role !== 'ADMIN') {
        console.log('🔐 withAdminAuth - Access denied for role:', mockUser.role);
        return NextResponse.json(
          { error: 'Bạn không có quyền truy cập' },
          { status: 403 }
        );
      }
      
      console.log('🔐 withAdminAuth - Access granted for role:', mockUser.role);
      return await handler(req, context);
    } catch (error) {
      console.error('🔐 withAdminAuth - Error:', error);
      return NextResponse.json(
        { error: 'Lỗi xác thực' },
        { status: 500 }
      );
    }
  });
};

export const withEditorAuth = (handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) => {
  return withAuth(async (req: AuthenticatedRequest, context?: any) => {
    try {
      console.log('🔐 withEditorAuth - User from JWT:', req.user);
      
      // Get user from mock data
      const mockUser = mockUsers[req.user!.userId];
      
      if (!mockUser) {
        console.log('🔐 withEditorAuth - User not found in mock data');
        return NextResponse.json(
          { error: 'Người dùng không tồn tại' },
          { status: 404 }
        );
      }
      
      if (mockUser.status !== 'ACTIVE') {
        console.log('🔐 withEditorAuth - User account is not active:', mockUser.status);
        return NextResponse.json(
          { error: 'Tài khoản không hoạt động' },
          { status: 403 }
        );
      }
      
      console.log('🔐 withEditorAuth - Current user role from mock:', mockUser.role);
      
      // Update user object with current role from mock data
      req.user!.role = mockUser.role;
      
      if (mockUser.role !== 'ADMIN' && mockUser.role !== 'EDITOR') {
        console.log('🔐 withEditorAuth - Access denied for role:', mockUser.role);
        return NextResponse.json(
          { error: 'Bạn không có quyền truy cập' },
          { status: 403 }
        );
      }
      
      console.log('🔐 withEditorAuth - Access granted for role:', mockUser.role);
      return await handler(req, context);
    } catch (error) {
      console.error('🔐 withEditorAuth - Error:', error);
      return NextResponse.json(
        { error: 'Lỗi xác thực' },
        { status: 500 }
      );
    }
  });
};