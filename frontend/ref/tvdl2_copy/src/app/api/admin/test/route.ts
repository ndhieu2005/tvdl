import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Admin API working',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: 'Admin API POST working',
      received: body,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON', status: 'error' },
      { status: 400 }
    );
  }
}