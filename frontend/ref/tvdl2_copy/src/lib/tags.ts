import { prisma } from '@/lib/prisma';

export interface TagData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  featured: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  postCount: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface CreateTagData {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  featured?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  metaTitle?: string;
  metaDescription?: string;
  createdBy: string;
}

export interface UpdateTagData {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  featured?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Tạo slug từ tên tag
 */
export function createTagSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

/**
 * Tạo tag mới
 */
export async function createTag(data: CreateTagData): Promise<TagData> {
  // Ensure slug is unique
  let slug = data.slug;
  let counter = 1;
  
  while (await prisma.tag.findUnique({ where: { slug } })) {
    slug = `${data.slug}-${counter}`;
    counter++;
  }

  const tag = await prisma.tag.create({
    data: {
      ...data,
      slug,
      status: data.status || 'ACTIVE',
    },
  });

  return tag as TagData;
}

/**
 * Cập nhật tag
 */
export async function updateTag(id: string, data: UpdateTagData): Promise<TagData> {
  const tag = await prisma.tag.update({
    where: { id },
    data,
  });

  return tag as TagData;
}

/**
 * Xóa tag
 */
export async function deleteTag(id: string, force: boolean = false): Promise<void> {
  if (force) {
    // Xóa tất cả quan hệ PostTag trước
    await prisma.postTag.deleteMany({
      where: { tagId: id },
    });
  }
  
  await prisma.tag.delete({
    where: { id },
  });
}

/**
 * Lấy tag theo ID
 */
export async function getTagById(id: string): Promise<TagData | null> {
  const tag = await prisma.tag.findUnique({
    where: { id },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  if (!tag) return null;

  return {
    ...tag,
    postCount: tag._count.posts,
  } as TagData;
}

/**
 * Lấy tag theo slug
 */
export async function getTagBySlug(slug: string): Promise<TagData | null> {
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  if (!tag) return null;

  return {
    ...tag,
    postCount: tag._count.posts,
  } as TagData;
}

/**
 * Lấy danh sách tags
 */
export async function getTags(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  featured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<{
  tags: TagData[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}> {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    featured,
    sortBy = 'name',
    sortOrder = 'asc',
  } = params;

  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status) {
    where.status = status;
  }
  if (featured !== undefined) {
    where.featured = featured;
  }

  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    }),
    prisma.tag.count({ where }),
  ]);

  return {
    tags: tags.map(tag => ({
      ...tag,
      postCount: tag._count.posts,
    })) as TagData[],
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Tìm hoặc tạo tag từ tên
 */
export async function findOrCreateTag(name: string, createdBy: string): Promise<TagData> {
  const slug = createTagSlug(name);
  
  // Tìm tag đã tồn tại
  let tag = await prisma.tag.findFirst({
    where: {
      OR: [
        { name },
        { slug }
      ]
    },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  if (!tag) {
    // Tạo tag mới
    tag = await prisma.tag.create({
      data: {
        name,
        slug,
        status: 'ACTIVE',
        createdBy,
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  return {
    ...tag,
    postCount: tag._count.posts,
  } as TagData;
}

/**
 * Liên kết tag với bài viết
 */
export async function linkTagsToPost(postId: string, tagIds: string[]): Promise<void> {
  // Xóa các liên kết cũ
  await prisma.postTag.deleteMany({
    where: { postId },
  });

  // Tạo liên kết mới
  if (tagIds.length > 0) {
    await prisma.postTag.createMany({
      data: tagIds.map(tagId => ({
        postId,
        tagId,
      })),
    });

    // Cập nhật postCount cho tags
    await updateTagPostCounts(tagIds);
  }
}

/**
 * Cập nhật số lượng bài viết của tags
 */
export async function updateTagPostCounts(tagIds?: string[]): Promise<void> {
  const where = tagIds ? { id: { in: tagIds } } : {};
  
  const tags = await prisma.tag.findMany({
    where,
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  const updatePromises = tags.map(tag =>
    prisma.tag.update({
      where: { id: tag.id },
      data: { postCount: tag._count.posts },
    })
  );

  await Promise.all(updatePromises);
}

/**
 * Lấy tags phổ biến
 */
export async function getPopularTags(limit: number = 10): Promise<TagData[]> {
  const tags = await prisma.tag.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { postCount: 'desc' },
    take: limit,
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return tags.map(tag => ({
    ...tag,
    postCount: tag._count.posts,
  })) as TagData[];
}

/**
 * Lấy tags đặc biệt
 */
export async function getFeaturedTags(limit: number = 10): Promise<TagData[]> {
  const tags = await prisma.tag.findMany({
    where: { 
      status: 'ACTIVE',
      featured: true,
    },
    orderBy: { postCount: 'desc' },
    take: limit,
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return tags.map(tag => ({
    ...tag,
    postCount: tag._count.posts,
  })) as TagData[];
}

/**
 * Tìm kiếm tags
 */
export async function searchTags(query: string, limit: number = 10): Promise<TagData[]> {
  const tags = await prisma.tag.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { name: { contains: query } },
        { slug: { contains: query } },
      ],
    },
    orderBy: { postCount: 'desc' },
    take: limit,
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return tags.map(tag => ({
    ...tag,
    postCount: tag._count.posts,
  })) as TagData[];
}