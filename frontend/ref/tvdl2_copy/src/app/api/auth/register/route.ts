import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/jwt';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên người dùng
 *                 example: "Nguyễn Văn A"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email người dùng
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: Mật khẩu (tối thiểu 6 ký tự)
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đăng ký thành công"
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
 *       409:
 *         description: Email đã tồn tại
 *       500:
 *         description: Lỗi server
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được sử dụng' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        status: 'ACTIVE',
        emailVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        joinDate: true,
      }
    });
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    return NextResponse.json({
      message: 'Đăng ký thành công',
      user,
      token,
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đăng ký' },
      { status: 500 }
    );
  }
}