import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../jwt';
import { prisma } from '../prisma';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export const withAuth = (handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) => {
  return async (req: AuthenticatedRequest, context?: any) => {
    try {
      const authHeader = req.headers.get('Authorization');
      
      const token = extractTokenFromHeader(authHeader);

      // Debug logs only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 withAuth - Authorization header:', authHeader);
        console.log('🔐 withAuth - Extracted token:', token ? token.substring(0, 20) + '...' : 'null');
      }

      if (!token) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 withAuth - No token provided');
        }
        return NextResponse.json(
          { error: 'Token không được cung cấp' },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 withAuth - Decoded token:', decoded);
      }
      
      if (!decoded) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 withAuth - Token verification failed');
        }
        return NextResponse.json(
          { error: 'Token không hợp lệ' },
          { status: 401 }
        );
      }

      req.user = decoded;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 withAuth - User set on request:', req.user);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 withAdminAuth - User from JWT:', req.user);
      }
      
      // Fetch user's current role from database để đảm bảo role mới nhất
      const currentUser = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { role: true, status: true }
      });
      
      if (!currentUser) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 withAdminAuth - User not found in database');
        }
        return NextResponse.json(
          { error: 'Người dùng không tồn tại' },
          { status: 404 }
        );
      }
      
      if (currentUser.status !== 'ACTIVE') {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 withAdminAuth - User account is not active:', currentUser.status);
        }
        return NextResponse.json(
          { error: 'Tài khoản không hoạt động' },
          { status: 403 }
        );
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 withAdminAuth - Current user role from DB:', currentUser.role);
      }
      
      // Update user object with current role from database
      req.user!.role = currentUser.role;
      
      if (currentUser.role !== 'ADMIN') {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 withAdminAuth - Access denied for role:', currentUser.role);
        }
        return NextResponse.json(
          { error: 'Bạn không có quyền truy cập' },
          { status: 403 }
        );
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 withAdminAuth - Access granted for role:', currentUser.role);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 withEditorAuth - User from JWT:', req.user);
      }
      
      // Fetch user's current role from database để đảm bảo role mới nhất
      const currentUser = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { role: true, status: true }
      });
      
      if (!currentUser) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 withEditorAuth - User not found in database');
        }
        return NextResponse.json(
          { error: 'Người dùng không tồn tại' },
          { status: 404 }
        );
      }
      
      if (currentUser.status !== 'ACTIVE') {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 withEditorAuth - User account is not active:', currentUser.status);
        }
        return NextResponse.json(
          { error: 'Tài khoản không hoạt động' },
          { status: 403 }
        );
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 withEditorAuth - Current user role from DB:', currentUser.role);
      }
      
      // Update user object with current role from database
      req.user!.role = currentUser.role;
      
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'EDITOR') {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 withEditorAuth - Access denied for role:', currentUser.role);
        }
        return NextResponse.json(
          { error: 'Bạn không có quyền truy cập' },
          { status: 403 }
        );
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 withEditorAuth - Access granted for role:', currentUser.role);
      }
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