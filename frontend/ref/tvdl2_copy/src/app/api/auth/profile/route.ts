import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Cập nhật thông tin hồ sơ người dùng
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên người dùng
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email người dùng
 *               bio:
 *                 type: string
 *                 description: Giới thiệu về bản thân
 *               location:
 *                 type: string
 *                 description: Địa điểm
 *               avatar:
 *                 type: string
 *                 description: URL avatar
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 *                     status:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     location:
 *                       type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       409:
 *         description: Email đã tồn tại
 *       500:
 *         description: Lỗi server
 */
export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { name, email, bio, location, avatar } = body;

    // Validate input
    if (name && (typeof name !== 'string' || name.trim().length < 2)) {
      return NextResponse.json(
        { error: 'Tên phải có ít nhất 2 ký tự' },
        { status: 400 }
      );
    }

    if (email && (typeof email !== 'string' || !email.includes('@'))) {
      return NextResponse.json(
        { error: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
          id: { not: req.user!.userId }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email đã được sử dụng bởi tài khoản khác' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (avatar !== undefined) updateData.avatar = avatar.trim();

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        location: true,
        bio: true,
        emailVerified: true,
        avatar: true,
        joinDate: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: 'Cập nhật thông tin thành công',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi cập nhật thông tin' },
      { status: 500 }
    );
  }
});