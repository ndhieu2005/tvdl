import { prisma } from '@/lib/prisma';

/**
 * Update scheduled posts to published when their publish date has passed
 */
export async function updateScheduledPosts() {
  try {
    const now = new Date();
    
    // Find all scheduled posts that should be published
    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        publishDate: { lte: now }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        publishDate: true
      }
    });

    if (scheduledPosts.length === 0) {
      console.log('📅 No scheduled posts to publish');
      return { updated: 0, posts: [] };
    }

    // Update them to published
    const updateResult = await prisma.post.updateMany({
      where: {
        status: 'SCHEDULED',
        publishDate: { lte: now }
      },
      data: {
        status: 'PUBLISHED'
      }
    });

    console.log(`📅 Updated ${updateResult.count} scheduled posts to published:`, 
      scheduledPosts.map(p => p.title));

    return { 
      updated: updateResult.count, 
      posts: scheduledPosts 
    };

  } catch (error) {
    console.error('❌ Error updating scheduled posts:', error);
    throw error;
  }
}

/**
 * Get scheduled posts that should be published
 */
export async function getScheduledPostsToPublish() {
  try {
    const now = new Date();
    
    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        publishDate: { lte: now }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        publishDate: true
      }
    });

    return scheduledPosts;
  } catch (error) {
    console.error('❌ Error getting scheduled posts:', error);
    throw error;
  }
}