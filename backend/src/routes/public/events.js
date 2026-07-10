const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

const EVENT_SELECT = {
  id: true,
  name: true,
  event_datetime: true,
  end_datetime: true,
  is_featured: true,
  color: true,
  seat_count: true,
  organizer: true,
  description: true,
  custom_location_name: true,
  location: { select: { id: true, name: true } },
  target_age_group: { select: { id: true, name: true } },
};

// GET /api/v1/events?cursor=&limit=&age_group_id=
// GET /api/v1/events?month=&year= — toàn bộ sự kiện trong tháng (cho lịch, không pagination)
router.get('/', async (req, res, next) => {
  try {
    const { month, year } = req.query;

    if (month || year) {
      const m = parseInt(month);
      const y = parseInt(year);
      if (!m || !y || m < 1 || m > 12)
        return error(res, 'month/year không hợp lệ', 'VALIDATION_ERROR', 400);

      const from = new Date(Date.UTC(y, m - 1, 1));
      const to = new Date(Date.UTC(y, m, 1));

      const events = await prisma.events.findMany({
        where: {
          deleted_at: null,
          event_datetime: { gte: from, lt: to },
        },
        orderBy: { event_datetime: 'asc' },
        select: EVENT_SELECT,
      });

      return success(res, events);
    }

    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const cursor = req.query.cursor ? parseInt(req.query.cursor) : undefined;
    const age_group_id = req.query.age_group_id ? parseInt(req.query.age_group_id) : undefined;

    const where = {
      deleted_at: null,
      ...(age_group_id && { target_age_group_id: age_group_id }),
    };

    const events = await prisma.events.findMany({
      where,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { event_datetime: 'desc' },
      select: EVENT_SELECT,
    });

    const hasMore = events.length > limit;
    if (hasMore) events.pop();
    const nextCursor = hasMore ? events[events.length - 1].id : null;

    return success(res, events, 'OK', { nextCursor, hasMore });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
