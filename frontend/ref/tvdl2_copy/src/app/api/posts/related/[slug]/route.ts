import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/posts/related/[slug] - Get related posts based on tags and category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '6', 10)));

    console.log('🔍 GET /api/posts/related - Slug:', slug);
    console.log('🔍 GET /api/posts/related - Limit:', limit);

    // First, get the current post to extract tags and category
    const currentPost = await prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        tags: true,
        category: true,
        publishDate: true,
        createdAt: true
      }
    });

    if (!currentPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    console.log('🔍 GET /api/posts/related - Current post:', currentPost);

    // Build where clause for related posts
    const now = new Date();
    let whereClause: any = {
      // Exclude current post
      id: { not: currentPost.id },
      // Only published posts or scheduled posts that should be published
      OR: [
        { status: 'PUBLISHED' },
        { 
          status: 'SCHEDULED',
          publishDate: { lte: now }
        }
      ]
    };

    // Strategy 1: Posts with same tags (higher priority)
    let relatedPosts: any[] = [];
    
    // Parse current post tags
    let currentTags: string[] = [];
    if (currentPost.tags) {
      try {
        currentTags = typeof currentPost.tags === 'string' ? JSON.parse(currentPost.tags) : currentPost.tags;
        if (!Array.isArray(currentTags)) {
          currentTags = [];
        }
      } catch (e) {
        console.warn('Failed to parse current post tags:', currentPost.tags);
        currentTags = [];
      }
    }
    
    if (currentTags.length > 0) {
      console.log('🔍 GET /api/posts/related - Looking for posts with same tags:', currentTags);
      
      // Since tags is stored as JSON string, we need to use contains to find matching tags
      // We'll get all posts and filter them in memory for now
      const allPosts = await prisma.post.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { publishDate: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      // Filter posts that have matching tags
      const tagBasedPosts = allPosts.filter(post => {
        if (!post.tags) return false;
        
        try {
          const postTags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
          if (!Array.isArray(postTags)) return false;
          
          // Check if any of the current post's tags match this post's tags
          return currentTags.some(tag => postTags.includes(tag));
        } catch (e) {
          return false;
        }
      }).slice(0, limit);

      console.log('🔍 GET /api/posts/related - Found tag-based posts:', tagBasedPosts.length);
      relatedPosts = tagBasedPosts;
    }

    // Strategy 2: If we don't have enough posts, get posts from same category
    if (relatedPosts.length < limit) {
      console.log('🔍 GET /api/posts/related - Looking for posts in same category:', currentPost.category);
      
      const categoryBasedPosts = await prisma.post.findMany({
        where: {
          ...whereClause,
          category: currentPost.category,
          // Exclude posts we already have
          id: { 
            notIn: [currentPost.id, ...relatedPosts.map(p => p.id)]
          }
        },
        include: {
          author: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { publishDate: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit - relatedPosts.length
      });

      console.log('🔍 GET /api/posts/related - Found category-based posts:', categoryBasedPosts.length);
      relatedPosts = [...relatedPosts, ...categoryBasedPosts];
    }

    // Strategy 3: If still not enough, get latest posts from any category
    if (relatedPosts.length < limit) {
      console.log('🔍 GET /api/posts/related - Looking for latest posts from any category');
      
      const latestPosts = await prisma.post.findMany({
        where: {
          ...whereClause,
          // Exclude posts we already have
          id: { 
            notIn: [currentPost.id, ...relatedPosts.map(p => p.id)]
          }
        },
        include: {
          author: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { publishDate: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit - relatedPosts.length
      });

      console.log('🔍 GET /api/posts/related - Found latest posts:', latestPosts.length);
      relatedPosts = [...relatedPosts, ...latestPosts];
    }

    // Sort related posts by relevance (posts with matching tags first)
    relatedPosts.sort((a, b) => {
      // Posts with matching tags get higher priority
      const parseTagsArray = (tags: any): string[] => {
        if (!tags) return [];
        try {
          const parsed = typeof tags === 'string' ? JSON.parse(tags) : tags;
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      };
      
      const aTags = parseTagsArray(a.tags);
      const bTags = parseTagsArray(b.tags);
      
      const aMatchingTags = currentTags.filter(tag => aTags.includes(tag)).length || 0;
      const bMatchingTags = currentTags.filter(tag => bTags.includes(tag)).length || 0;
      
      if (aMatchingTags !== bMatchingTags) {
        return bMatchingTags - aMatchingTags;
      }
      
      // Then by same category
      const aSameCategory = a.category === currentPost.category ? 1 : 0;
      const bSameCategory = b.category === currentPost.category ? 1 : 0;
      
      if (aSameCategory !== bSameCategory) {
        return bSameCategory - aSameCategory;
      }
      
      // Finally by publish date (newest first)
      const aDate = new Date(a.publishDate || a.createdAt);
      const bDate = new Date(b.publishDate || b.createdAt);
      return bDate.getTime() - aDate.getTime();
    });

    // Limit the final result
    relatedPosts = relatedPosts.slice(0, limit);

    console.log('🔍 GET /api/posts/related - Final related posts:', relatedPosts.length);

    return NextResponse.json({
      success: true,
      data: relatedPosts,
      meta: {
        currentPost: {
          id: currentPost.id,
          tags: currentTags,
          category: currentPost.category
        },
        count: relatedPosts.length,
        limit
      }
    });
  } catch (error) {
    console.error('🔍 GET /api/posts/related - Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch related posts',
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}