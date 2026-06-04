import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Test MinIO connection
    const { initializeBucket, getMinioClient, getBucketName } = await import('@/lib/minio');
    await initializeBucket();
    
    // Test bucket access
    const bucketExists = await getMinioClient().bucketExists(getBucketName());
    
    return NextResponse.json({
      status: 'success',
      message: 'MinIO connection successful',
      bucketExists,
      bucketName: getBucketName(),
      endpoint: process.env.STORAGE_ENDPOINT
    });
  } catch (error) {
    console.error('MinIO connection error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'MinIO connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}