import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/admin/media/bulk:
 *   post:
 *     tags:
 *       - Media
 *     summary: Bulk operations on media files
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [delete]
 *               fileIds:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - action
 *               - fileIds
 *     responses:
 *       200:
 *         description: Bulk operation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 processed:
 *                   type: integer
 *                 failed:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       error:
 *                         type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken(req);
    if (!token || !['ADMIN', 'EDITOR'].includes(token.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, fileIds } = body;

    if (!action || !fileIds || !Array.isArray(fileIds)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (fileIds.length === 0) {
      return NextResponse.json({ error: 'No files specified' }, { status: 400 });
    }

    let processed = 0;
    let failed = 0;
    const errors: Array<{ id: string; error: string }> = [];

    if (action === 'delete') {
      // Get all files to delete
      const mediaFiles = await prisma.mediaFile.findMany({
        where: {
          id: { in: fileIds }
        }
      });

      // Delete each file
      for (const mediaFile of mediaFiles) {
        try {
          // Delete from MinIO
          const { deleteFile } = await import('@/lib/minio');
          await deleteFile(mediaFile.objectName);
          
          // Delete from database
          await prisma.mediaFile.delete({
            where: { id: mediaFile.id }
          });
          
          processed++;
        } catch (error) {
          failed++;
          errors.push({
            id: mediaFile.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return NextResponse.json({
        message: `Bulk delete completed. Processed: ${processed}, Failed: ${failed}`,
        processed,
        failed,
        errors
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}