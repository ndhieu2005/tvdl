import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashApiKey, isIpWhitelisted, isApiKeyExpired } from '@/lib/api-key-server';

// Force Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { apiKey, clientIp } = await req.json();
    
    if (!apiKey) {
      return NextResponse.json({ valid: false, error: 'API key is required' });
    }

    const keyHash = hashApiKey(apiKey);
    
    const dbApiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: {
        permissions: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!dbApiKey) {
      return NextResponse.json({ valid: false, error: 'Invalid API key' });
    }

    if (!dbApiKey.isActive) {
      return NextResponse.json({ valid: false, error: 'API key is inactive' });
    }

    if (isApiKeyExpired(dbApiKey.expiresAt)) {
      return NextResponse.json({ valid: false, error: 'API key has expired' });
    }

    // Check IP whitelist
    const ipWhitelist = Array.isArray(dbApiKey.ipWhitelist) 
      ? dbApiKey.ipWhitelist 
      : dbApiKey.ipWhitelist 
        ? [dbApiKey.ipWhitelist] 
        : [];
    if (!isIpWhitelisted(clientIp, ipWhitelist)) {
      return NextResponse.json({ valid: false, error: 'IP address not whitelisted' });
    }

    // Check rate limiting
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentUsage = await prisma.apiUsageLog.count({
      where: {
        apiKeyId: dbApiKey.id,
        createdAt: { gte: hourAgo },
      },
    });

    if (recentUsage >= dbApiKey.rateLimit) {
      return NextResponse.json({ valid: false, error: 'Rate limit exceeded' });
    }

    // Update usage
    await prisma.apiKey.update({
      where: { id: dbApiKey.id },
      data: {
        lastUsed: new Date(),
        usageCount: { increment: 1 },
      },
    });

    return NextResponse.json({ 
      valid: true, 
      apiKey: {
        id: dbApiKey.id,
        name: dbApiKey.name,
        permissions: dbApiKey.permissions,
        user: dbApiKey.user,
      }
    });
  } catch (error) {
    console.error('API Key validation error:', error);
    return NextResponse.json({ valid: false, error: 'Internal server error' });
  }
}