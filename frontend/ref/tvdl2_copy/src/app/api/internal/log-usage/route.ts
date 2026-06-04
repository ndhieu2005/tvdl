import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Force Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { 
      apiKeyId, 
      endpoint, 
      method, 
      statusCode, 
      ipAddress, 
      userAgent, 
      responseTime 
    } = await req.json();

    if (!apiKeyId) {
      return NextResponse.json({ error: 'API key ID is required' }, { status: 400 });
    }

    await prisma.apiUsageLog.create({
      data: {
        apiKeyId,
        endpoint,
        method,
        statusCode,
        ipAddress,
        userAgent,
        responseTime,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Log usage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}