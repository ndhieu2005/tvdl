#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Script để xóa user một cách an toàn
 * Xử lý tất cả các ràng buộc và references
 */
async function safeDeleteUser(userId) {
  console.log(`🚀 Starting safe deletion for user: ${userId}`);
  
  try {
    // Bắt đầu transaction
    await prisma.$transaction(async (tx) => {
      // 1. Kiểm tra user có tồn tại không
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: {
          authoredPosts: true,
          uploadedMedia: true,
          sessionTokens: true,
          apiKeys: true,
        }
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      console.log(`📋 User found: ${user.name} (${user.email})`);
      console.log(`   - Posts authored: ${user.authoredPosts.length}`);
      console.log(`   - Media files uploaded: ${user.uploadedMedia.length}`);
      console.log(`   - Session tokens: ${user.sessionTokens.length}`);
      console.log(`   - API keys: ${user.apiKeys.length}`);

      // 2. Xử lý các field createdBy và updatedBy (set to null hoặc admin user)
      console.log('🔧 Updating createdBy and updatedBy references...');
      
      // Tìm admin user để thay thế
      const adminUser = await tx.user.findFirst({
        where: { role: 'ADMIN' }
      });
      
      const replacementUserId = adminUser ? adminUser.id : null;
      
      if (replacementUserId) {
        console.log(`   - Replacing with admin user: ${adminUser.name}`);
      } else {
        console.log('   - No admin user found, setting to null where possible');
      }

      // Update Tags.createdBy
      const tagsUpdated = await tx.tag.updateMany({
        where: { createdBy: userId },
        data: { createdBy: replacementUserId || 'system' }
      });
      console.log(`   - Updated ${tagsUpdated.count} tags`);

      // Update Posts.createdBy
      const postsCreatedByUpdated = await tx.post.updateMany({
        where: { createdBy: userId },
        data: { createdBy: replacementUserId || 'system' }
      });
      console.log(`   - Updated ${postsCreatedByUpdated.count} posts createdBy`);

      // Update SecuritySettings.updatedBy
      const securitySettingsUpdated = await tx.securitySettings.updateMany({
        where: { updatedBy: userId },
        data: { updatedBy: replacementUserId || 'system' }
      });
      console.log(`   - Updated ${securitySettingsUpdated.count} security settings`);

      // Update Settings.updatedBy
      const settingsUpdated = await tx.settings.updateMany({
        where: { updatedBy: userId },
        data: { updatedBy: replacementUserId || 'system' }
      });
      console.log(`   - Updated ${settingsUpdated.count} settings`);

      // Update CardRegistration.updatedBy (nullable)
      const cardRegistrationsUpdated = await tx.cardRegistration.updateMany({
        where: { updatedBy: userId },
        data: { updatedBy: null }
      });
      console.log(`   - Updated ${cardRegistrationsUpdated.count} card registrations`);

      // Update RoomBooking.updatedBy (nullable)
      const roomBookingsUpdated = await tx.roomBooking.updateMany({
        where: { updatedBy: userId },
        data: { updatedBy: null }
      });
      console.log(`   - Updated ${roomBookingsUpdated.count} room bookings`);

      // Update Books.createdBy and updatedBy
      const booksCreatedByUpdated = await tx.book.updateMany({
        where: { createdBy: userId },
        data: { createdBy: replacementUserId || 'system' }
      });
      console.log(`   - Updated ${booksCreatedByUpdated.count} books createdBy`);

      const booksUpdatedByUpdated = await tx.book.updateMany({
        where: { updatedBy: userId },
        data: { updatedBy: null }
      });
      console.log(`   - Updated ${booksUpdatedByUpdated.count} books updatedBy`);

      // Update Events.createdBy and updatedBy
      const eventsCreatedByUpdated = await tx.event.updateMany({
        where: { createdBy: userId },
        data: { createdBy: replacementUserId || 'system' }
      });
      console.log(`   - Updated ${eventsCreatedByUpdated.count} events createdBy`);

      const eventsUpdatedByUpdated = await tx.event.updateMany({
        where: { updatedBy: userId },
        data: { updatedBy: null }
      });
      console.log(`   - Updated ${eventsUpdatedByUpdated.count} events updatedBy`);

      // 3. Xóa user (CASCADE sẽ tự động xóa posts, media, sessions, api keys)
      console.log('🗑️  Deleting user...');
      await tx.user.delete({
        where: { id: userId }
      });

      console.log('✅ User deleted successfully!');
    });

    console.log('🎉 Safe deletion completed successfully!');

  } catch (error) {
    console.error('❌ Error during safe deletion:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Lấy userId từ command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Please provide a user ID');
  console.log('Usage: node safe-delete-user.js <userId>');
  process.exit(1);
}

// Confirm deletion
console.log(`⚠️  You are about to delete user: ${userId}`);
console.log('This action cannot be undone!');
console.log('Press Ctrl+C to cancel, or press Enter to continue...');

process.stdin.once('data', () => {
  safeDeleteUser(userId).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
});