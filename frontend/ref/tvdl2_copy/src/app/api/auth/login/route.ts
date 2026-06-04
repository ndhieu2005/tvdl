import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/jwt-server';
import { z } from 'zod';

// Force Node.js runtime
export const runtime = 'nodejs';
import { 
  getClientIP,
  addSecurityHeaders,
  sanitizeInput,
  loginSecurityMiddleware
} from '@/lib/middleware/security-simple';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập tài khoản
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email người dùng
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: Mật khẩu
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đăng nhập thành công"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Email hoặc mật khẩu không đúng
 *       403:
 *         description: Tài khoản bị khóa
 *       500:
 *         description: Lỗi server
 */
export async function POST(req: NextRequest) {
  const ipAddress = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || '';
  
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    // Sanitize input
    const email = sanitizeInput(validatedData.email);
    const password = sanitizeInput(validatedData.password);
    
    // Check security policies before processing login
    const securityCheck = await loginSecurityMiddleware(req, email);
    if (!securityCheck.allowed) {
      // TODO: Record failed attempt
      console.log('Failed login attempt:', { email, ipAddress, userAgent, reason: securityCheck.reason });
      
      return addSecurityHeaders(NextResponse.json(
        { error: securityCheck.reason },
        { status: securityCheck.statusCode }
      ));
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    
    if (!user) {
      // TODO: Record failed attempt
      console.log('Failed login attempt:', { email, ipAddress, userAgent, reason: 'User not found' });
      
      return addSecurityHeaders(NextResponse.json(
        { 
          error: 'Email hoặc mật khẩu không đúng'
        },
        { status: 401 }
      ));
    }
    
    // Check if user is active
    if (user.status !== 'ACTIVE') {
      // TODO: Record failed attempt
      console.log('Failed login attempt:', { email, ipAddress, userAgent, reason: 'Account inactive' });
      
      return addSecurityHeaders(NextResponse.json(
        { error: 'Tài khoản của bạn đã bị khóa' },
        { status: 403 }
      ));
    }
    
    // Check if password needs reset (for new users)
    const needsPasswordReset = await comparePassword('temp_password_needs_reset', user.password);
    
    if (needsPasswordReset) {
      // TODO: Record failed attempt
      console.log('Failed login attempt:', { email, ipAddress, userAgent, reason: 'Password reset required' });
      
      return addSecurityHeaders(NextResponse.json(
        { 
          error: 'Tài khoản này cần đổi mật khẩu lần đầu',
          needsPasswordReset: true,
          email: user.email
        },
        { status: 400 }
      ));
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      // TODO: Record failed attempt
      console.log('Failed login attempt:', { email, ipAddress, userAgent, reason: 'Invalid password' });
      
      return addSecurityHeaders(NextResponse.json(
        { 
          error: 'Email hoặc mật khẩu không đúng'
        },
        { status: 401 }
      ));
    }
    
    // TODO: Record successful login
    console.log('Successful login:', { email, ipAddress, userAgent });
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Return user info without password
    const { password: _, ...userWithoutPassword } = user;
    
    return addSecurityHeaders(NextResponse.json({
      message: 'Đăng nhập thành công',
      user: userWithoutPassword,
      token
    }));
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      ));
    }
    
    console.error('Login error:', error);
    
    // TODO: Record failed attempt due to error
    console.log('Login error:', { ipAddress, userAgent, error: error instanceof Error ? error.message : String(error) });
    
    return addSecurityHeaders(NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đăng nhập' },
      { status: 500 }
    ));
  }
}