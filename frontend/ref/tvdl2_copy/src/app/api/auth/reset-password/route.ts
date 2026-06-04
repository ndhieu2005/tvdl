import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword } from '@/lib/jwt';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  newPassword: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: z.string().min(8, 'Mật khẩu xác nhận phải có ít nhất 8 ký tự'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Đổi mật khẩu lần đầu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email người dùng
 *                 example: "user@example.com"
 *               newPassword:
 *                 type: string
 *                 description: Mật khẩu mới
 *                 example: "newPassword123"
 *               confirmPassword:
 *                 type: string
 *                 description: Xác nhận mật khẩu mới
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đổi mật khẩu thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = resetPasswordSchema.parse(body);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Email không tồn tại trong hệ thống' },
        { status: 404 }
      );
    }
    
    // Check if password is still default (needs reset)
    const isDefaultPassword = await comparePassword('temp_password_needs_reset', user.password);
    
    if (!isDefaultPassword) {
      return NextResponse.json(
        { error: 'Tài khoản này đã được đặt mật khẩu' },
        { status: 400 }
      );
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(validatedData.newPassword);
    
    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        // You can add a passwordNeedsReset field later if needed
      },
    });
    
    return NextResponse.json({
      message: 'Đổi mật khẩu thành công',
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đổi mật khẩu' },
      { status: 500 }
    );
  }
}