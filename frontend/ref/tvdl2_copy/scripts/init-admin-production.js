#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

/**
 * Script để tự động khởi tạo admin user trên production database
 */
async function initAdminProduction() {
  console.log('🚀 Starting admin user initialization for PRODUCTION...');
  console.log('📋 Admin configuration:');
  console.log('   - Name: Admin ViralPeek');
  console.log('   - Email: admin@trendiefox.com');
  console.log('   - Password: admin123456');
  console.log('   - Database: trendiefox (production)');
  console.log('');

  // Production database URL (using encodeURIComponent for password)
  const username = 'admin';
  const password = 'Admin@12';
  const host = '103.56.162.214';
  const port = '3306';
  const database = 'tvdl2';
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
    console.log('🔍 Connecting to production database...');
    await prisma.$connect();
    console.log('✅ Connected to production database successfully!');

    // Kiểm tra xem admin user đã tồn tại chưa
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@trendiefox.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('📋 Admin user details:');
      console.log(`   - ID: ${existingAdmin.id}`);
      console.log(`   - Name: ${existingAdmin.name}`);
      console.log(`   - Email: ${existingAdmin.email}`);
      console.log(`   - Role: ${existingAdmin.role}`);
      console.log(`   - Status: ${existingAdmin.status}`);
      console.log(`   - Created: ${existingAdmin.createdAt.toISOString()}`);
      console.log(`   - Is New User: No`);
      
      // Nếu không phải admin thì update
      if (existingAdmin.role !== 'ADMIN') {
        console.log('🔄 Updating user role to ADMIN...');
        
        // Hash password mới với bcrypt
        const hashedPassword = await bcrypt.hash('admin123456', 12);
        
        const updatedUser = await prisma.user.update({
          where: { id: existingAdmin.id },
          data: {
            name: 'Admin ViralPeek',
            password: hashedPassword,
            role: 'ADMIN',
            status: 'ACTIVE',
            emailVerified: true
          }
        });
        
        console.log('✅ User updated to admin successfully!');
        console.log(`   - Role: ${updatedUser.role}`);
      }
      
    } else {
      console.log('🆕 Creating new admin user...');
      
      // Hash password với bcrypt
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      
      const newAdmin = await prisma.user.create({
        data: {
          name: 'Admin ViralPeek',
          email: 'admin@trendiefox.com',
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
          emailVerified: true,
          bio: 'System Administrator',
          location: 'Vietnam'
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('📋 Admin user details:');
      console.log(`   - ID: ${newAdmin.id}`);
      console.log(`   - Name: ${newAdmin.name}`);
      console.log(`   - Email: ${newAdmin.email}`);
      console.log(`   - Role: ${newAdmin.role}`);
      console.log(`   - Status: ${newAdmin.status}`);
      console.log(`   - Created: ${newAdmin.createdAt.toISOString()}`);
      console.log(`   - Is New User: Yes`);
    }
    
    console.log('');
    console.log('🎉 You can now login with:');
    console.log('   - Email: admin@trendiefox.com');
    console.log('   - Password: admin123456');
    console.log('   - Login URL: https://trendiefox.com/admin/login');
    console.log('');
    
    // Hiển thị thống kê database
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    const mediaCount = await prisma.mediaFile.count();
    
    console.log('📊 Database statistics:');
    console.log(`   - Total users: ${userCount}`);
    console.log(`   - Total posts: ${postCount}`);
    console.log(`   - Total media files: ${mediaCount}`);
    
  } catch (error) {
    console.error('❌ Error during admin initialization:', error.message);
    console.log('');
    console.log('💡 Please check:');
    console.log('   - Database connection is available');
    console.log('   - Database credentials are correct');
    console.log('   - Database migrations have been run');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
initAdminProduction();