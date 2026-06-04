import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/admin/media/{id}:
 *   get:
 *     tags:
 *       - Media
 *     summary: Get media file details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media file ID
 *     responses:
 *       200:
 *         description: Media file details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaFile'
 *       404:
 *         description: Media file not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken(req);
    if (!token || !['ADMIN', 'EDITOR'].includes(token.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id },
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

    if (!mediaFile) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
    }

    // No need to update URL since we're not storing direct URLs anymore

    return NextResponse.json(mediaFile);
  } catch (error) {
    console.error('Error fetching media file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/media/{id}:
 *   put:
 *     tags:
 *       - Media
 *     summary: Update media file metadata
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media file ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Media file updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaFile'
 *       404:
 *         description: Media file not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken(req);
    if (!token || !['ADMIN', 'EDITOR'].includes(token.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, metadata } = body;

    const existingFile = await prisma.mediaFile.findUnique({
      where: { id }
    });

    if (!existingFile) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
    }

    // Update only allowed fields
    const updateData: any = {};
    if (name) updateData.name = name;
    if (metadata) updateData.metadata = metadata;

    const updatedFile = await prisma.mediaFile.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error('Error updating media file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/media/{id}:
 *   delete:
 *     tags:
 *       - Media
 *     summary: Delete media file
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media file ID
 *     responses:
 *       200:
 *         description: Media file deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Media file not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken(req);
    if (!token || !['ADMIN', 'EDITOR'].includes(token.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id }
    });

    if (!mediaFile) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
    }

    // Delete from MinIO
    try {
      const { deleteFile } = await import('@/lib/minio');
      await deleteFile(mediaFile.objectName);
    } catch (error) {
      console.error('Error deleting file from MinIO:', error);
      // Continue with database deletion even if MinIO deletion fails
    }

    // Delete from database
    await prisma.mediaFile.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Media file deleted successfully' });
  } catch (error) {
    console.error('Error deleting media file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}