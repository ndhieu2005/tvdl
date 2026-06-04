import { PrismaClient } from '@prisma/client';
import { generateApiKey, hashApiKey } from './api-key-server';

const prisma = new PrismaClient();

// Re-export server functions
export { generateApiKey, hashApiKey };

// Tạo API key cho user
export async function createApiKey(
  userId: string,
  name: string,
  permissions: { resource: string; action: string }[] = [],
  options: {
    expiresAt?: Date;
    rateLimit?: number;
    ipWhitelist?: string[];
  } = {}
) {
  const apiKey = generateApiKey();
  const keyHash = hashApiKey(apiKey);

  const dbApiKey = await prisma.apiKey.create({
    data: {
      name,
      keyHash,
      userId,
      expiresAt: options.expiresAt,
      rateLimit: options.rateLimit || 1000,
      ipWhitelist: options.ipWhitelist ? JSON.stringify(options.ipWhitelist) : '[]',
      permissions: {
        create: permissions.map(p => ({
          resource: p.resource,
          action: p.action,
        })),
      },
    },
    include: {
      permissions: true,
    },
  });

  return { apiKey, dbApiKey };
}

// Xác thực API key
export async function validateApiKey(apiKey: string, clientIp: string) {
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
    return { valid: false, error: 'Invalid API key' };
  }

  if (!dbApiKey.isActive) {
    return { valid: false, error: 'API key is inactive' };
  }

  if (dbApiKey.expiresAt && dbApiKey.expiresAt < new Date()) {
    return { valid: false, error: 'API key has expired' };
  }

  // Check IP whitelist
  if (dbApiKey.ipWhitelist) {
    const ipWhitelist = JSON.parse(dbApiKey.ipWhitelist);
    if (ipWhitelist.length > 0 && !ipWhitelist.includes(clientIp)) {
      return { valid: false, error: 'IP address not whitelisted' };
    }
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
    return { valid: false, error: 'Rate limit exceeded' };
  }

  // Update usage
  await prisma.apiKey.update({
    where: { id: dbApiKey.id },
    data: {
      lastUsed: new Date(),
      usageCount: { increment: 1 },
    },
  });

  return { valid: true, apiKey: dbApiKey };
}

// Kiểm tra quyền
export function hasPermission(
  apiKey: any,
  resource: string,
  action: string
): boolean {
  if (!apiKey.permissions) return false;
  
  return apiKey.permissions.some(
    (p: any) => p.resource === resource && p.action === action
  );
}

// Log API usage
export async function logApiUsage(
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  ipAddress: string,
  userAgent: string | null,
  responseTime: number
) {
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
}

// Lấy danh sách API keys của user
export async function getUserApiKeys(userId: string) {
  return await prisma.apiKey.findMany({
    where: { userId },
    include: {
      permissions: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Cập nhật API key
export async function updateApiKey(
  apiKeyId: string,
  updates: {
    name?: string;
    isActive?: boolean;
    rateLimit?: number;
    ipWhitelist?: string[];
    expiresAt?: Date | null;
  }
) {
  const updateData: any = { ...updates };
  if (updates.ipWhitelist) {
    updateData.ipWhitelist = JSON.stringify(updates.ipWhitelist);
  }
  
  return await prisma.apiKey.update({
    where: { id: apiKeyId },
    data: updateData,
  });
}

// Xóa API key
export async function deleteApiKey(apiKeyId: string) {
  return await prisma.apiKey.delete({
    where: { id: apiKeyId },
  });
}

// Cập nhật permissions
export async function updateApiKeyPermissions(
  apiKeyId: string,
  permissions: { resource: string; action: string }[]
) {
  // Xóa permissions cũ
  await prisma.apiKeyPermission.deleteMany({
    where: { apiKeyId },
  });

  // Thêm permissions mới
  await prisma.apiKeyPermission.createMany({
    data: permissions.map(p => ({
      apiKeyId,
      resource: p.resource,
      action: p.action,
    })),
  });
}

// Lấy usage statistics
export async function getApiKeyUsageStats(apiKeyId: string, days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return await prisma.apiUsageLog.findMany({
    where: {
      apiKeyId,
      createdAt: { gte: since },
    },
    select: {
      endpoint: true,
      method: true,
      statusCode: true,
      responseTime: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}