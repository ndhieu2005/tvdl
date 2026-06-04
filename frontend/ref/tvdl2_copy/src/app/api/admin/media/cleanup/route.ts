import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

interface MediaFileRecord {
  id: string;
  name: string;
  objectName: string;
  type: string;
  size: number;
  createdAt: Date;
}

interface OrphanedFile extends MediaFileRecord {
  error: string;
}

/**
 * @swagger
 * /api/admin/media/cleanup:
 *   post:
 *     tags:
 *       - Admin Media
 *     summary: Clean up orphaned media records
 *     description: Remove database records for files that don't exist in storage
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dryRun
 *         schema:
 *           type: boolean
 *           default: true
 *         description: If true, only return what would be deleted without actually deleting
 *     responses:
 *       200:
 *         description: Cleanup completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deleted:
 *                   type: array
 *                   items:
 *                     type: object
 *                 stats:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken(req);
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const dryRun = searchParams.get('dryRun') !== 'false'; // Default to true

    console.log(`🧹 Starting media cleanup (dryRun: ${dryRun})...`);

    // Get all media files from database
    const allMediaFiles = await prisma.mediaFile.findMany({
      select: {
        id: true,
        name: true,
        objectName: true,
        type: true,
        size: true,
        createdAt: true,
      }
    });

    console.log(`📊 Found ${allMediaFiles.length} media records in database`);

    const { getMinioClient, getBucketName } = await import('@/lib/minio');
    const minioClient = getMinioClient();
    const bucketName = getBucketName();
    
    const orphanedFiles: OrphanedFile[] = [];
    const validFiles: MediaFileRecord[] = [];
    
    // Check each file in storage
    for (const mediaFile of allMediaFiles) {
      try {
        // Check if file exists in MinIO
        await minioClient.statObject(bucketName, mediaFile.objectName);
        validFiles.push(mediaFile);
        console.log(`✅ File exists: ${mediaFile.objectName}`);
      } catch (error) {
        // File doesn't exist in storage
        orphanedFiles.push({
          ...mediaFile,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(`❌ File missing: ${mediaFile.objectName}`);
      }
    }

    console.log(`📊 Cleanup results:`);
    console.log(`   - Valid files: ${validFiles.length}`);
    console.log(`   - Orphaned records: ${orphanedFiles.length}`);

    let deletedRecords: OrphanedFile[] = [];
    
    if (!dryRun && orphanedFiles.length > 0) {
      // Actually delete the orphaned records
      console.log(`🗑️ Deleting ${orphanedFiles.length} orphaned records...`);
      
      const deletedIds = orphanedFiles.map(file => file.id);
      
      const deleteResult = await prisma.mediaFile.deleteMany({
        where: {
          id: {
            in: deletedIds
          }
        }
      });
      
      deletedRecords = orphanedFiles;
      console.log(`✅ Deleted ${deleteResult.count} orphaned records`);
    }

    const stats = {
      totalRecords: allMediaFiles.length,
      validFiles: validFiles.length,
      orphanedRecords: orphanedFiles.length,
      deletedRecords: deletedRecords.length,
      dryRun
    };

    return NextResponse.json({
      success: true,
      message: dryRun 
        ? `Found ${orphanedFiles.length} orphaned records (dry run mode)`
        : `Cleaned up ${deletedRecords.length} orphaned records`,
      orphanedFiles: orphanedFiles.map(file => ({
        id: file.id,
        name: file.name,
        objectName: file.objectName,
        type: file.type,
        size: file.size,
        createdAt: file.createdAt,
        error: file.error
      })),
      deletedRecords,
      stats
    });

  } catch (error) {
    console.error('❌ Error during media cleanup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}