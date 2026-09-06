const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

// GET /api/v1/admin/suggestions?page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [total, suggestions] = await prisma.$transaction([
      prisma.book_Suggestions.count(),
      prisma.book_Suggestions.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          reader_name: true,
          reader_code: true,
          email: true,
          book_name: true,
          description: true,
          created_at: true,
          category: { select: { id: true, name: true } },
          age_group: { select: { id: true, name: true } },
        },
      }),
    ]);

    return success(res, suggestions, 'OK', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
