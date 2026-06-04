const { PrismaClient } = require('@prisma/client');
const { createHash, randomBytes } = require('crypto');

const prisma = new PrismaClient();

// Tạo API key mới
function generateApiKey() {
  return `vp_${randomBytes(32).toString('hex')}`;
}

// Hash API key để lưu trong database
function hashApiKey(apiKey) {
  return createHash('sha256').update(apiKey).digest('hex');
}

async function createTestApiKey() {
  try {
    console.log('🔧 Creating test API key...');
    
    // Tạo API key mới
    const apiKey = generateApiKey();
    console.log('🔑 Generated API key:', apiKey);
    
    // Hash API key
    const keyHash = hashApiKey(apiKey);
    console.log('🔐 API key hash:', keyHash);
    
    // Tìm admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      console.error('❌ Admin user not found');
      return;
    }
    
    console.log('👤 Admin user found:', adminUser.email);
    
    // Tạo API key record
    const dbApiKey = await prisma.apiKey.create({
      data: {
        name: 'Test API Key',
        keyHash: keyHash,
        userId: adminUser.id,
        isActive: true,
        rateLimit: 1000,
        ipWhitelist: [], // Allow all IPs
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        permissions: {
          create: [
            { resource: 'posts', action: 'read' },
            { resource: 'posts', action: 'create' },
            { resource: 'posts', action: 'update' },
            { resource: 'posts', action: 'delete' }
          ]
        }
      },
      include: {
        permissions: true
      }
    });
    
    console.log('✅ API key created successfully:');
    console.log('   - ID:', dbApiKey.id);
    console.log('   - Name:', dbApiKey.name);
    console.log('   - User ID:', dbApiKey.userId);
    console.log('   - Permissions:', dbApiKey.permissions.length);
    console.log('   - Rate limit:', dbApiKey.rateLimit);
    console.log('   - Expires at:', dbApiKey.expiresAt);
    
    console.log('\n🎯 Use this API key for testing:');
    console.log('   ', apiKey);
    
  } catch (error) {
    console.error('❌ Error creating API key:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestApiKey();