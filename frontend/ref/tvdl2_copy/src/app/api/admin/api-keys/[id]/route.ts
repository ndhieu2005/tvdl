import { NextRequest, NextResponse } from 'next/server';
import { updateApiKey, deleteApiKey, getApiKeyUsageStats } from '@/lib/api-key';
import { verifyToken } from '@/lib/jwt-server';
import { PrismaClient } from '@prisma/client';

// Force Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient();

// GET: Lấy thông tin chi tiết API key và usage stats
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Kiểm tra authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const resolvedParams = await params;
    const apiKeyId = resolvedParams.id;

    // Kiểm tra quyền sở hữu API key
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: apiKeyId,
        userId: userId,
      },
      include: {
        permissions: true,
      },
    });

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // Lấy usage stats
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30');
    const usageStats = await getApiKeyUsageStats(apiKeyId, days);

    return NextResponse.json({
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        isActive: apiKey.isActive,
        permissions: apiKey.permissions,
        lastUsed: apiKey.lastUsed,
        usageCount: apiKey.usageCount,
        rateLimit: apiKey.rateLimit,
        ipWhitelist: apiKey.ipWhitelist,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      },
      usageStats,
    });
  } catch (error) {
    console.error('Get API Key Details Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Cập nhật API key
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Kiểm tra authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const resolvedParams = await params;
    const apiKeyId = resolvedParams.id;
    const body = await req.json();

    // Kiểm tra quyền sở hữu API key
    const existingApiKey = await prisma.apiKey.findFirst({
      where: {
        id: apiKeyId,
        userId: userId,
      },
    });

    if (!existingApiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    const { name, isActive, rateLimit, ipWhitelist, expiresAt } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (isActive !== undefined) updates.isActive = isActive;
    if (rateLimit !== undefined) updates.rateLimit = rateLimit;
    if (ipWhitelist !== undefined) updates.ipWhitelist = ipWhitelist;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const updatedApiKey = await updateApiKey(apiKeyId, updates);

    return NextResponse.json({
      message: 'API key updated successfully',
      apiKey: {
        id: updatedApiKey.id,
        name: updatedApiKey.name,
        isActive: updatedApiKey.isActive,
        rateLimit: updatedApiKey.rateLimit,
        ipWhitelist: updatedApiKey.ipWhitelist,
        expiresAt: updatedApiKey.expiresAt,
        updatedAt: updatedApiKey.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update API Key Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Xóa API key
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Kiểm tra authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const resolvedParams = await params;
    const apiKeyId = resolvedParams.id;

    // Kiểm tra quyền sở hữu API key
    const existingApiKey = await prisma.apiKey.findFirst({
      where: {
        id: apiKeyId,
        userId: userId,
      },
    });

    if (!existingApiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await deleteApiKey(apiKeyId);

    return NextResponse.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Delete API Key Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}