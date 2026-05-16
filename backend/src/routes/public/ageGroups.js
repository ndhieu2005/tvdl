const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success } = require('../../utils/response');

// GET /api/v1/age-groups
router.get('/', async (req, res, next) => {
  try {
    const ageGroups = await prisma.age_Groups.findMany({
      where: { deleted_at: null },
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    return success(res, ageGroups);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
