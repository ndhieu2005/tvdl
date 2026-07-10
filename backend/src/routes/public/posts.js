const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

// GET /api/v1/posts?cursor=&limit= — danh sách (không kèm content cho nhẹ)
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const cursor = req.query.cursor ? parseInt(req.query.cursor) : undefined;

    const posts = await prisma.posts.findMany({
      where: { deleted_at: null },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { id: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        cover_image: true,
        created_at: true,
      },
    });

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();
    const nextCursor = hasMore ? posts[posts.length - 1].id : null;

    return success(res, posts, 'OK', { nextCursor, hasMore });
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
