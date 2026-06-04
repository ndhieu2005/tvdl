#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Script để test việc xóa user và kiểm tra ràng buộc
 */
async function testDeleteUser() {
  console.log('🧪 Testing user deletion constraints...');
  
  try {
    // 1. Tạo test user
    console.log('1. Creating test user...');
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'USER',
        status: 'ACTIVE'
      }
    });
    console.log(`   ✅ Created test user: ${testUser.id}`);

    // 2. Tạo test data liên quan
    console.log('2. Creating related test data...');
    
    // Tạo category trước
    const testCategory = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category'
      }
    });

    // Tạo post
    const testPost = await prisma.post.create({
      data: {
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content',
        categoryId: testCategory.id,
        authorId: testUser.id,
        createdBy: testUser.id
      }
    });
    console.log(`   ✅ Created test post: ${testPost.id}`);

    // Tạo tag
    const testTag = await prisma.tag.create({
      data: {
        name: 'Test Tag',
        slug: 'test-tag',
        createdBy: testUser.id
      }
    });
    console.log(`   ✅ Created test tag: ${testTag.id}`);

    // 3. Kiểm tra dữ liệu trước khi xóa
    console.log('3. Checking data before deletion...');
    const postsCount = await prisma.post.count({ where: { authorId: testUser.id } });
    const postsCreatedByCount = await prisma.post.count({ where: { createdBy: testUser.id } });
    const tagsCount = await prisma.tag.count({ where: { createdBy: testUser.id } });
    
    console.log(`   - Posts authored: ${postsCount}`);
    console.log(`   - Posts created by: ${postsCreatedByCount}`);
    console.log(`   - Tags created by: ${tagsCount}`);

    // 4. Test xóa user (sẽ fail nếu không có CASCADE)
    console.log('4. Testing user deletion...');
    
    try {
      // Tìm admin user để thay thế
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });
      
      if (!adminUser) {
        console.log('   ⚠️  No admin user found, creating one...');
        const newAdmin = await prisma.user.create({
          data: {
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'hashed_password',
            role: 'ADMIN',
            status: 'ACTIVE'
          }
        });
        console.log(`   ✅ Created admin user: ${newAdmin.id}`);
      }

      // Sử dụng transaction để xóa user an toàn
      await prisma.$transaction(async (tx) => {
        // Update references
        await tx.tag.updateMany({
          where: { createdBy: testUser.id },
          data: { createdBy: adminUser?.id || 'system' }
        });

        await tx.post.updateMany({
          where: { createdBy: testUser.id },
          data: { createdBy: adminUser?.id || 'system' }
        });

        // Delete user (CASCADE will handle posts, media, etc.)
        await tx.user.delete({
          where: { id: testUser.id }
        });
      });

      console.log('   ✅ User deleted successfully!');

      // 5. Kiểm tra dữ liệu sau khi xóa
      console.log('5. Checking data after deletion...');
      
      const userExists = await prisma.user.findUnique({ where: { id: testUser.id } });
      const postsAfter = await prisma.post.count({ where: { authorId: testUser.id } });
      const tagsAfter = await prisma.tag.count({ where: { createdBy: testUser.id } });
      const postsCreatedByAfter = await prisma.post.count({ where: { createdBy: testUser.id } });
      
      console.log(`   - User exists: ${userExists ? 'Yes' : 'No'}`);
      console.log(`   - Posts authored: ${postsAfter} (should be 0)`);
      console.log(`   - Tags created by user: ${tagsAfter} (should be 0)`);
      console.log(`   - Posts created by user: ${postsCreatedByAfter} (should be 0)`);

      if (!userExists && postsAfter === 0 && tagsAfter === 0 && postsCreatedByAfter === 0) {
        console.log('🎉 Test PASSED! User deletion with CASCADE works correctly!');
      } else {
        console.log('❌ Test FAILED! Some data was not properly handled.');
      }

    } catch (deleteError) {
      console.error('❌ Error during deletion:', deleteError.message);
      console.log('This might indicate missing CASCADE constraints.');
    }

    // Cleanup test data
    console.log('6. Cleaning up test data...');
    await prisma.post.deleteMany({ where: { categoryId: testCategory.id } });
    await prisma.category.delete({ where: { id: testCategory.id } });
    await prisma.tag.deleteMany({ where: { slug: 'test-tag' } });
    console.log('   ✅ Cleanup completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDeleteUser();