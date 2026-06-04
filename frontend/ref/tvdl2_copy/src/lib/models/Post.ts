import { Post, PostStatus, Category } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Export Prisma Post type with relations
export type IPost = Post & {
  author?: {
    id: string;
    name: string;
    email: string;
  };
  category?: Category;
};

// Export enums for convenience
export { PostStatus };

// Utility function to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Post utility functions
export class PostModel {
  /**
   * Create a new post
   */
  static async create(data: {
    title: string;
    slug?: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    categoryId: string;
    authorId: string;
    createdBy: string;
    status?: PostStatus;
    publishDate?: Date;
    videoUrl?: string;
    videoThumbnail?: string;
    videoPlatform?: string;
    videoTitle?: string;
    videoDescription?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
  }) {
    const slug = data.slug || generateSlug(data.title);
    
    return await prisma.post.create({
      data: {
        ...data,
        slug,
        status: data.status || PostStatus.DRAFT,
        publishDate: data.publishDate || new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: true,
      }
    });
  }

  /**
   * Find post by slug
   */
  static async findBySlug(slug: string) {
    return await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: true,
      }
    });
  }

  /**
   * Find post by ID
   */
  static async findById(id: string) {
    return await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: true,
      }
    });
  }

  /**
   * Get posts by status
   */
  static async findByStatus(status: PostStatus, limit = 10, offset = 0) {
    return await prisma.post.findMany({
      where: { status },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: true,
      },
      orderBy: {
        publishDate: 'desc'
      },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get posts by category
   */
  static async findByCategory(categoryId: string, limit = 10, offset = 0) {
    return await prisma.post.findMany({
      where: { 
        categoryId,
        status: PostStatus.PUBLISHED 
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: true,
      },
      orderBy: {
        publishDate: 'desc'
      },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get published posts
   */
  static async findPublished(limit = 10, offset = 0) {
    return await prisma.post.findMany({
      where: { 
        status: PostStatus.PUBLISHED,
        publishDate: {
          lte: new Date()
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: true,
      },
      orderBy: {
        publishDate: 'desc'
      },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Update post
   */
  static async update(id: string, data: any) {
    // Remove fields that shouldn't be updated directly
    const { id: _, createdAt, updatedAt, author, category, ...updateData } = data;
    
    return await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: true,
      }
    });
  }

  /**
   * Delete post
   */
  static async delete(id: string) {
    return await prisma.post.delete({
      where: { id },
    });
  }

  /**
   * Increment view count
   */
  static async incrementViews(id: string) {
    return await prisma.post.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });
  }

  /**
   * Increment like count
   */
  static async incrementLikes(id: string) {
    return await prisma.post.update({
      where: { id },
      data: {
        likeCount: {
          increment: 1
        }
      }
    });
  }

  /**
   * Search posts by title or content
   */
  static async search(query: string, limit = 10, offset = 0) {
    return await prisma.post.findMany({
      where: {
        AND: [
          { status: PostStatus.PUBLISHED },
          {
            OR: [
              { title: { contains: query } },
              { content: { contains: query } },
              { excerpt: { contains: query } },
            ]
          }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: true,
      },
      orderBy: {
        publishDate: 'desc'
      },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get posts by author
   */
  static async findByAuthor(authorId: string, limit = 10, offset = 0) {
    return await prisma.post.findMany({
      where: { authorId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
    });
  }
}

// Export default for backward compatibility
export default PostModel;