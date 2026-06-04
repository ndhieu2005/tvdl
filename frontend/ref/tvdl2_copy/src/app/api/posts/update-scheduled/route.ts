import { NextRequest, NextResponse } from 'next/server';
import { updateScheduledPosts } from '@/lib/scheduled-posts';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/posts/update-scheduled - Checking scheduled posts...');
    
    const result = await updateScheduledPosts();
    
    return NextResponse.json({
      success: true,
      message: `Updated ${result.updated} scheduled posts`,
      data: result
    });
  } catch (error) {
    console.error('🔍 GET /api/posts/update-scheduled - Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update scheduled posts',
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/posts/update-scheduled - Manual trigger...');
    
    const result = await updateScheduledPosts();
    
    return NextResponse.json({
      success: true,
      message: `Updated ${result.updated} scheduled posts`,
      data: result
    });
  } catch (error) {
    console.error('🔍 POST /api/posts/update-scheduled - Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update scheduled posts',
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}