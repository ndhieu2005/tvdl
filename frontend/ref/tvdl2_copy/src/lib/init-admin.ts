import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

interface AdminConfig {
  name: string;
  email: string;
  password: string;
}

const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  name: "Admin ViralPeek",
  email: "admin@trendiefox.com",
  password: "admin123456"
};

export async function initAdminUser(config: AdminConfig = DEFAULT_ADMIN_CONFIG) {
  console.log('🔧 [INIT] Starting admin user initialization...');
  console.log(`📋 [INIT] Admin config:`, {
    name: config.name,
    email: config.email,
    password: '****** (hidden)'
  });

  try {
    // Check if any admin user exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      console.log('✅ [INIT] Admin user already exists:');
      console.log(`   - ID: ${existingAdmin.id}`);
      console.log(`   - Name: ${existingAdmin.name}`);
      console.log(`   - Email: ${existingAdmin.email}`);
      console.log(`   - Role: ${existingAdmin.role}`);
      console.log(`   - Status: ${existingAdmin.status}`);
      console.log(`   - Created: ${existingAdmin.createdAt.toISOString()}`);
      
      // Check if status is ACTIVE
      if (existingAdmin.status !== 'ACTIVE') {
        console.log('⚠️  [INIT] Admin user status is not ACTIVE, updating...');
        const updatedAdmin = await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { 
            status: 'ACTIVE',
            emailVerified: true 
          },
        });
        console.log('✅ [INIT] Admin user status updated to ACTIVE');
        return updatedAdmin;
      }
      
      return existingAdmin;
    }

    // Check if email already exists (but not as admin)
    const existingUser = await prisma.user.findUnique({
      where: { email: config.email },
    });

    if (existingUser) {
      console.log('⚠️  [INIT] User with admin email exists but not as admin:');
      console.log(`   - ID: ${existingUser.id}`);
      console.log(`   - Role: ${existingUser.role}`);
      console.log(`   - Status: ${existingUser.status}`);
      console.log('🔄 [INIT] Converting existing user to admin...');
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(config.password, 10);
      
      // Update existing user to admin
      const updatedAdmin = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: config.name,
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
          emailVerified: true,
        },
      });
      
      console.log('✅ [INIT] User converted to admin successfully:');
      console.log(`   - ID: ${updatedAdmin.id}`);
      console.log(`   - Name: ${updatedAdmin.name}`);
      console.log(`   - Email: ${updatedAdmin.email}`);
      console.log(`   - Role: ${updatedAdmin.role}`);
      console.log(`   - Status: ${updatedAdmin.status}`);
      
      return updatedAdmin;
    }

    // Create new admin user
    console.log('🆕 [INIT] No admin user found, creating new admin...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(config.password, 10);
    
    // Create admin user
    const newAdmin = await prisma.user.create({
      data: {
        name: config.name,
        email: config.email,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });
    
    console.log('✅ [INIT] New admin user created successfully:');
    console.log(`   - ID: ${newAdmin.id}`);
    console.log(`   - Name: ${newAdmin.name}`);
    console.log(`   - Email: ${newAdmin.email}`);
    console.log(`   - Role: ${newAdmin.role}`);
    console.log(`   - Status: ${newAdmin.status}`);
    console.log(`   - Created: ${newAdmin.createdAt.toISOString()}`);
    
    return newAdmin;

  } catch (error) {
    console.error('❌ [INIT] Error during admin user initialization:', error);
    throw error;
  }
}

// Function to get admin user info
export async function getAdminUserInfo() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    
    if (!admin) {
      console.log('⚠️  [INFO] No admin user found in database');
      return null;
    }
    
    const { password, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  } catch (error) {
    console.error('❌ [INFO] Error getting admin user info:', error);
    return null;
  }
}