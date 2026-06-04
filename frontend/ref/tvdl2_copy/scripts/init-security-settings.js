#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

/**
 * Script để khởi tạo cài đặt bảo mật mặc định
 */
async function initSecuritySettings() {
  console.log('🔐 Initializing security settings...');
  
  // Production database URL
  const username = 'admin';
  const password = 'h%7CxVIX]4ys6%7';
  const host = '192.168.50.161';
  const port = '5434';
  const database = 'viralpeek';
  const PRODUCTION_DATABASE_URL = `postgresql://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}`;

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: PRODUCTION_DATABASE_URL
      }
    },
    log: ['error'],
  });

  try {
    console.log('🔍 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected to database successfully!');

    // Kiểm tra xem đã có security settings chưa
    const existingSettings = await prisma.securitySettings.findFirst();
    
    if (existingSettings) {
      console.log('📋 Security settings already exist:');
      console.log(`   - ID: ${existingSettings.id}`);
      console.log(`   - Max Failed Logins: ${existingSettings.maxFailedLogins}`);
      console.log(`   - Session Timeout: ${existingSettings.sessionTimeout} minutes`);
      console.log(`   - Min Password Length: ${existingSettings.minPasswordLength}`);
      console.log(`   - Two Factor Enabled: ${existingSettings.twoFactorEnabled}`);
      console.log(`   - CAPTCHA Enabled: ${existingSettings.captchaEnabled}`);
      console.log(`   - IP Blocking Enabled: ${existingSettings.ipBlockingEnabled}`);
      console.log(`   - Spam Filter Enabled: ${existingSettings.spamFilterEnabled}`);
      console.log(`   - Strong Password Required: ${existingSettings.strongPasswordRequired}`);
      console.log(`   - Updated At: ${existingSettings.updatedAt}`);
      return;
    }

    // Tạo security settings mặc định
    console.log('🏗️  Creating default security settings...');
    const securitySettings = await prisma.securitySettings.create({
      data: {
        // Authentication Security
        maxFailedLogins: 5,
        sessionTimeout: 1440, // 24 hours
        minPasswordLength: 8,
        
        // Two-Factor Authentication
        twoFactorEnabled: false,
        
        // CAPTCHA
        captchaEnabled: false,
        captchaProvider: 'recaptcha',
        captchaThreshold: 0.5,
        
        // IP Security
        ipBlockingEnabled: true,
        ipBlockDuration: 60, // 1 hour
        ipWhitelist: [],
        ipBlacklist: [],
        
        // Spam Protection
        spamFilterEnabled: true,
        maxRequestsPerMinute: 60,
        maxRequestsPerHour: 1000,
        
        // Password Policy
        strongPasswordRequired: true,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        passwordExpiryDays: 90,
        
        // Metadata
        updatedBy: 'system'
      }
    });

    console.log('✅ Security settings created successfully!');
    console.log(`   - ID: ${securitySettings.id}`);
    console.log(`   - Max Failed Logins: ${securitySettings.maxFailedLogins}`);
    console.log(`   - Session Timeout: ${securitySettings.sessionTimeout} minutes`);
    console.log(`   - Min Password Length: ${securitySettings.minPasswordLength}`);
    console.log(`   - Two Factor Enabled: ${securitySettings.twoFactorEnabled}`);
    console.log(`   - CAPTCHA Enabled: ${securitySettings.captchaEnabled}`);
    console.log(`   - IP Blocking Enabled: ${securitySettings.ipBlockingEnabled}`);
    console.log(`   - Spam Filter Enabled: ${securitySettings.spamFilterEnabled}`);
    console.log(`   - Strong Password Required: ${securitySettings.strongPasswordRequired}`);
    console.log(`   - Created At: ${securitySettings.createdAt}`);

    console.log('');
    console.log('🎉 Security settings initialized successfully!');
    console.log('📋 Default security policies:');
    console.log('   - Maximum 5 failed login attempts');
    console.log('   - Session timeout: 24 hours');
    console.log('   - Minimum password length: 8 characters');
    console.log('   - IP blocking enabled (1 hour duration)');
    console.log('   - Spam protection enabled (60 req/min, 1000 req/hour)');
    console.log('   - Strong password policy enabled');
    console.log('   - Password expiry: 90 days');

  } catch (error) {
    console.error('❌ Error initializing security settings:', error.message);
    if (error.code === 'P2002') {
      console.error('   - This might be due to unique constraint violation');
    }
  } finally {
    await prisma.$disconnect();
  }
}

initSecuritySettings().catch(console.error);