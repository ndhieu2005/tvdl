import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất tài khoản
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đăng xuất thành công"
 */
export async function POST(req: NextRequest) {
  try {
    // Since we're using stateless JWT, we don't need to do anything server-side
    // The client will handle removing the token from storage
    return NextResponse.json({
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đăng xuất' },
      { status: 500 }
    );
  }
}