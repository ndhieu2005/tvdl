#!/usr/bin/env node

const { spawn } = require('child_process');

/**
 * Script để tự động khởi tạo admin user
 */
async function initAdmin() {
  console.log('🚀 Starting admin user initialization...');
  console.log('📋 Admin configuration:');
  console.log('   - Name: Admin TVDL');
  console.log('   - Email: admin@thuvienduonglieu.com');
  console.log('   - Password: admin123456');
  console.log('');

  try {
    // Check if server is running
    console.log('🔍 Checking if server is running...');
    
    const response = await fetch('http://localhost:3000/api/health')
      .catch(() => fetch('http://localhost:5000/api/health'))
      .catch(() => fetch('http://stg.trendiefox.com/api/health'));
    
    let baseUrl = 'http://localhost:3000';
    if (response.url.includes('5000')) {
      baseUrl = 'http://localhost:5000';
    } else if (response.url.includes('thuvienduonglieu.com')) {
      baseUrl = 'http://thuvienduonglieu.com';
    }
    
    console.log(`✅ Server is running at: ${baseUrl}`);
    
    // Call auto-init API
    console.log('🔧 Calling auto-init API...');
    
    const initResponse = await fetch(`${baseUrl}/api/admin/auto-init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: "Admin TVDL",
        email: "admin@thuvienduonglieu.com",
        password: "admin123456"
      })
    });
    
    const result = await initResponse.json();
    
    if (initResponse.ok) {
      console.log('✅ Admin user initialization completed!');
      console.log('📋 Admin user details:');
      console.log(`   - ID: ${result.user.id}`);
      console.log(`   - Name: ${result.user.name}`);
      console.log(`   - Email: ${result.user.email}`);
      console.log(`   - Role: ${result.user.role}`);
      console.log(`   - Status: ${result.user.status}`);
      console.log(`   - Created: ${result.user.createdAt}`);
      console.log(`   - Is New User: ${result.isNewUser ? 'Yes' : 'No'}`);
      console.log('');
      console.log('🎉 You can now login with:');
      console.log('   - Email: admin@thuvienduonglieu.com');
      console.log('   - Password: admin123456');
      console.log(`   - Login URL: ${baseUrl}/admin/login`);
    } else {
      console.error('❌ Failed to initialize admin user:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error during admin initialization:', error.message);
    console.log('');
    console.log('💡 Make sure the server is running first:');
    console.log('   npm run dev');
    console.log('   # or');
    console.log('   npm run build && npm start');
  }
}

// Run the script
initAdmin();