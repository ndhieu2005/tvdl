const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success } = require('../../utils/response');

// GET /api/v1/categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.categories.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        name: true,
        age_group: { select: { id: true, name: true } },
      },
      orderBy: [
        { age_group_id: 'asc' },
        { name: 'asc' },
      ],
    });
    return success(res, categories);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
