const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

// GET /api/v1/schedules?month=&year=
router.get('/', async (req, res, next) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    if (!month || !year || month < 1 || month > 12)
      return error(res, 'Thiếu hoặc sai tham số month/year', 'VALIDATION_ERROR', 400);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const schedules = await prisma.schedules.findMany({
      where: {
        date: { gte: startDate, lt: endDate },
      },
      orderBy: [{ date: 'asc' }, { shift: 'asc' }],
      select: {
        id: true,
        date: true,
        shift: true,
        time_frame: true,
        is_sudden_closed: true,
        closed_reason: true,
        custom_location_name: true,
        location: { select: { id: true, name: true, color_code: true, address: true } },
      },
    });

    return success(res, schedules);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
