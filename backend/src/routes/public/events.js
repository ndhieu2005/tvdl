const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success } = require('../../utils/response');

// GET /api/v1/events?cursor=&limit=&age_group_id=
router.get('/', async (req, res, next) => {
  try {
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
      select: {
        id: true,
        name: true,
        event_datetime: true,
        seat_count: true,
        organizer: true,
        description: true,
        custom_location_name: true,
        location: { select: { id: true, name: true } },
        target_age_group: { select: { id: true, name: true } },
      },
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
