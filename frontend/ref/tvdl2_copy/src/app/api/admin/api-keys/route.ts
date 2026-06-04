import { NextRequest, NextResponse } from 'next/server';
import { createApiKey, getUserApiKeys, updateApiKeyPermissions } from '@/lib/api-key';
import { verifyToken } from '@/lib/jwt-server';

// Force Node.js runtime
export const runtime = 'nodejs';

// GET: Lấy danh sách API keys
export async function GET(req: NextRequest) {
  try {
    // Kiểm tra authentication
    const authHeader = req.headers.get('authorization');
    console.log('🔍 API Keys GET - Auth header:', authHeader ? 'exists' : 'missing');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔍 API Keys GET - Token:', token.substring(0, 20) + '...');
    
    const decoded = verifyToken(token);
    console.log('🔍 API Keys GET - Decoded:', decoded ? 'success' : 'failed');
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const apiKeys = await getUserApiKeys(userId);

    // Không trả về keyHash vì lý do bảo mật
    const safeApiKeys = apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      isActive: key.isActive,
      permissions: key.permissions,
      lastUsed: key.lastUsed,
      usageCount: key.usageCount,
      rateLimit: key.rateLimit,
      ipWhitelist: key.ipWhitelist,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
    }));

    return NextResponse.json({ apiKeys: safeApiKeys });
  } catch (error) {
    console.error('Get API Keys Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Tạo API key mới
export async function POST(req: NextRequest) {
  try {
    // Kiểm tra authentication
    const authHeader = req.headers.get('authorization');
    console.log('🔍 API Keys POST - Auth header:', authHeader ? 'exists' : 'missing');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔍 API Keys POST - Token:', token.substring(0, 20) + '...');
    
    const decoded = verifyToken(token);
    console.log('🔍 API Keys POST - Decoded:', decoded ? 'success' : 'failed');
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const body = await req.json();
    
    const { name, permissions = [], expiresAt, rateLimit, ipWhitelist } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Validate permissions
    const validResources = ['post', 'file', 'category', 'tag', 'user', 'settings'];
    const validActions = ['create', 'read', 'update', 'delete', 'upload'];
    
    for (const perm of permissions) {
      if (!validResources.includes(perm.resource) || !validActions.includes(perm.action)) {
        return NextResponse.json({ 
          error: `Invalid permission: ${perm.resource}.${perm.action}` 
        }, { status: 400 });
      }
    }

    const result = await createApiKey(userId, name, permissions, {
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      rateLimit,
      ipWhitelist,
    });

    return NextResponse.json({
      message: 'API key created successfully',
      apiKey: result.apiKey, // Chỉ trả về 1 lần duy nhất
      keyInfo: {
        id: result.dbApiKey.id,
        name: result.dbApiKey.name,
        rateLimit: result.dbApiKey.rateLimit,
        createdAt: result.dbApiKey.createdAt,
      },
    });
  } catch (error) {
    console.error('Create API Key Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Cập nhật permissions của API key
export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const { apiKeyId, permissions } = body;

    if (!apiKeyId || !permissions) {
      return NextResponse.json({ error: 'API key ID and permissions are required' }, { status: 400 });
    }

    // Validate permissions
    const validResources = ['post', 'file', 'category', 'tag', 'user', 'settings'];
    const validActions = ['create', 'read', 'update', 'delete', 'upload'];
    
    for (const perm of permissions) {
      if (!validResources.includes(perm.resource) || !validActions.includes(perm.action)) {
        return NextResponse.json({ 
          error: `Invalid permission: ${perm.resource}.${perm.action}` 
        }, { status: 400 });
      }
    }

    await updateApiKeyPermissions(apiKeyId, permissions);

    return NextResponse.json({ message: 'Permissions updated successfully' });
  } catch (error) {
    console.error('Update API Key Permissions Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}