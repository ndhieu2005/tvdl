const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

// GET /api/v1/posts?cursor=&limit=&exclude_id= — danh sách bài viết
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const cursor = req.query.cursor ? parseInt(req.query.cursor) : undefined;
    let excludeId = req.query.exclude_id ? parseInt(req.query.exclude_id) : undefined;

    let featuredPost = null;

    // Khi load trang đầu tiên (chưa có cursor)
    if (!cursor) {
      // 1. Tìm bài viết được ghim nổi bật thủ công bởi admin
      featuredPost = await prisma.posts.findFirst({
        where: { deleted_at: null, is_featured: true },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          cover_image: true,
          is_featured: true,
          created_at: true,
          author: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      });

      // 2. Nếu admin chưa ghim bài nào, tự động lấy bài viết mới nhất làm bài nổi bật
      if (!featuredPost) {
        featuredPost = await prisma.posts.findFirst({
          where: { deleted_at: null },
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            cover_image: true,
            is_featured: true,
            created_at: true,
            author: {
              select: {
                name: true,
                username: true,
              },
            },
          },
        });
      }

      if (featuredPost) {
        excludeId = featuredPost.id;
      }
    }

    const posts = await prisma.posts.findMany({
      where: {
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        cover_image: true,
        is_featured: true,
        created_at: true,
        author: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();
    const nextCursor = hasMore ? posts[posts.length - 1].id : null;

    return success(res, posts, 'OK', {
      nextCursor,
      hasMore,
      featured: featuredPost || null,
      excludeId: excludeId || null,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/posts/:slug — chi tiết bài viết
router.get('/:slug', async (req, res, next) => {
  try {
    const post = await prisma.posts.findFirst({
      where: { slug: req.params.slug, deleted_at: null },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        content: true,
        cover_image: true,
        created_at: true,
        updated_at: true,
        author: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    if (!post)
      return error(res, 'Không tìm thấy bài viết', 'NOT_FOUND', 404);

    return success(res, post);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
