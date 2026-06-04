import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PostFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
}

export interface PostResult {
  posts: any[];
  total: number;
}

export async function getPostsWithFilters(filters: PostFilters): Promise<PostResult> {
  const { page = 1, limit = 10, status, category, search } = filters;
  
  const skip = (page - 1) * limit;
  
  // Build where clause
  const where: any = {};
  
  if (status) {
    where.status = status.toUpperCase();
  }
  
  if (category) {
    where.category = category.toUpperCase();
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  // Execute queries
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { priorityScore: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    }),
    prisma.post.count({ where })
  ]);
  
  return {
    posts,
    total
  };
}

export async function getPostById(id: string) {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
}

export async function getPostBySlug(slug: string, incrementView: boolean = false) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });

  if (!post) {
    return null;
  }

  // Only show published posts or scheduled posts that should be published
  const now = new Date();
  const shouldBePublished = post.status === 'PUBLISHED' || 
    (post.status === 'SCHEDULED' && post.publishDate && new Date(post.publishDate) <= now);
  
  if (!shouldBePublished) {
    return null;
  }

  // Increment view count if requested
  if (incrementView) {
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    });
  }

  return post;
}

export async function getPostBySlugForPreview(slug: string) {
  return await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });
}

export async function createPost(data: any) {
  return await prisma.post.create({
    data,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
}

export async function updatePost(id: string, data: any) {
  return await prisma.post.update({
    where: { id },
    data,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
}

export async function deletePost(id: string) {
  return await prisma.post.delete({
    where: { id }
  });
}

export async function getPostsByCategory(category: string, limit: number = 10) {
  return await prisma.post.findMany({
    where: {
      category: category.toUpperCase() as any,
      status: 'PUBLISHED'
    },
    take: limit,
    orderBy: [
      { priorityScore: 'desc' },
      { createdAt: 'desc' }
    ],
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
}

export async function getRecentPosts(limit: number = 10) {
  return await prisma.post.findMany({
    where: {
      status: 'PUBLISHED'
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
}

export async function searchPosts(query: string, limit: number = 10) {
  return await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { title: { contains: query } },
        { excerpt: { contains: query } },
        { content: { contains: query } },
      ]
    },
    take: limit,
    orderBy: [
      { priorityScore: 'desc' },
      { createdAt: 'desc' }
    ],
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
}