import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/admin/media/stats:
 *   get:
 *     tags:
 *       - Media
 *     summary: Get media storage statistics
 *     responses:
 *       200:
 *         description: Storage statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalFiles:
 *                   type: integer
 *                 totalSize:
 *                   type: integer
 *                 typeBreakdown:
 *                   type: object
 *                   properties:
 *                     IMAGE:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                         size:
 *                           type: integer
 *                     VIDEO:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                         size:
 *                           type: integer
 *                     AUDIO:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                         size:
 *                           type: integer
 *                     DOCUMENT:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                         size:
 *                           type: integer
 *                 recentUploads:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MediaFile'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken(req);
    if (!token || !['ADMIN', 'EDITOR'].includes(token.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total files and size
    const totalStats = await prisma.mediaFile.aggregate({
      _count: { id: true },
      _sum: { size: true }
    });

    // Get breakdown by type
    const typeBreakdown = await prisma.mediaFile.groupBy({
      by: ['type'],
      _count: { id: true },
      _sum: { size: true }
    });

    // Get recent uploads
    const recentUploads = await prisma.mediaFile.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Format type breakdown
    const formattedTypeBreakdown = typeBreakdown.reduce((acc, item) => {
      acc[item.type] = {
        count: item._count.id,
        size: item._sum.size || 0
      };
      return acc;
    }, {} as Record<string, { count: number; size: number }>);

    // Ensure all types are present
    const allTypes = ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'];
    allTypes.forEach(type => {
      if (!formattedTypeBreakdown[type]) {
        formattedTypeBreakdown[type] = { count: 0, size: 0 };
      }
    });

    return NextResponse.json({
      totalFiles: totalStats._count.id,
      totalSize: totalStats._sum.size || 0,
      typeBreakdown: formattedTypeBreakdown,
      recentUploads
    });
  } catch (error) {
    console.error('Error fetching media stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}