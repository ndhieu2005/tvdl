import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy danh sách categories
 *     description: Lấy danh sách tất cả categories có sẵn
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Danh sách categories được trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       color:
 *                         type: string
 *       500:
 *         description: Lỗi server
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🏷️ GET /api/categories - Starting request');
    
    // Get all active categories from database
    const categories = await prisma.category.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        description: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('🏷️ GET /api/categories - Found categories:', categories.length);

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('🏷️ GET /api/categories - Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}