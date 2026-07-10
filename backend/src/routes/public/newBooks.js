const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success } = require('../../utils/response');

// GET /api/v1/new-books?cursor=&limit=&category_id=&age_group_id=
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const cursor = req.query.cursor ? parseInt(req.query.cursor) : undefined;
    const category_id = req.query.category_id ? parseInt(req.query.category_id) : undefined;
    const age_group_id = req.query.age_group_id ? parseInt(req.query.age_group_id) : undefined;

    const where = {
      deleted_at: null,
      ...(category_id && { category_id }),
      ...(age_group_id && { category: { age_group_id } }),
    };

    const books = await prisma.new_Books.findMany({
      where,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { id: 'desc' },
      select: {
        id: true,
        title: true,
        author: true,
        book_code: true,
        cover_image: true,
        short_description: true,
        publisher: true,
        publish_year: true,
        page_count: true,
        created_at: true,
        location: { select: { id: true, name: true } },
        category: {
          select: {
            id: true,
            name: true,
            age_group: { select: { id: true, name: true } },
          },
        },
      },
    });

    const hasMore = books.length > limit;
    if (hasMore) books.pop();
    const nextCursor = hasMore ? books[books.length - 1].id : null;

    return success(res, books, 'OK', { nextCursor, hasMore });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
