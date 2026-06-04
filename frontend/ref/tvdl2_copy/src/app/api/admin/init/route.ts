import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/jwt';

/**
 * @swagger
 * /api/admin/init:
 *   post:
 *     summary: Khởi tạo admin user đầu tiên
 *     description: Tạo admin user đầu tiên trong hệ thống (chỉ chạy một lần)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email admin
 *                 example: "admin@trendiefox.com"
 *               password:
 *                 type: string
 *                 description: Mật khẩu admin
 *                 example: "admin123456"
 *               name:
 *                 type: string
 *                 description: Tên admin
 *                 example: "Admin ViralPeek"
 *     responses:
 *       201:
 *         description: Admin user được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       409:
 *         description: Admin đã tồn tại
 *       500:
 *         description: Lỗi server
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;
    
    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password và name là bắt buộc' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin đã tồn tại trong hệ thống' },
        { status: 409 }
      );
    }
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được sử dụng' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });
    
    // Return user info without password
    const { password: _, ...userWithoutPassword } = adminUser;
    
    return NextResponse.json({
      message: 'Admin user được tạo thành công',
      user: userWithoutPassword,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Admin init error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi tạo admin user' },
      { status: 500 }
    );
  }
}