const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success } = require('../../utils/response');

// GET /api/v1/locations
router.get('/', async (req, res, next) => {
  try {
    const locations = await prisma.locations.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
      select: { id: true, name: true, type: true, color_code: true, address: true },
    });

    return success(res, locations);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
