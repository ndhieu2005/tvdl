const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

// GET /api/v1/books?cursor=&limit=&search=&category_id=&age_group_id=&location_id=
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const cursor = req.query.cursor ? parseInt(req.query.cursor) : undefined;
    const search = req.query.search?.trim();
    const category_id = req.query.category_id ? parseInt(req.query.category_id) : undefined;
    const age_group_id = req.query.age_group_id ? parseInt(req.query.age_group_id) : undefined;
    const location_id = req.query.location_id ? parseInt(req.query.location_id) : undefined;

    const where = {
      deleted_at: null,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { author: { contains: search } },
        ],
      }),
      ...(category_id && { category_id }),
      ...(location_id && { location_id }),
      ...(age_group_id && { category: { age_group_id } }),
    };

    const books = await prisma.books.findMany({
      where,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { id: 'asc' },
      select: {
        id: true,
        book_code: true,
        title: true,
        author: true,
        cover_url: true,
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
