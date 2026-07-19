const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

// GET /api/v1/admin/events?page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [total, events] = await prisma.$transaction([
      prisma.events.count({ where: { deleted_at: null } }),
      prisma.events.findMany({
        where: { deleted_at: null },
        skip,
        take: limit,
        orderBy: { event_datetime: 'desc' },
        select: {
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
          location: { select: { id: true, name: true, address: true } },
          target_age_group: { select: { id: true, name: true } },
        },
      }),
    ]);

    return success(res, events, 'OK', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/events
router.post('/', async (req, res, next) => {
  try {
    const {
      name, event_datetime, end_datetime, is_featured, color,
      location_id, target_age_group_id, seat_count,
      custom_location_name, organizer, description,
    } = req.body;

    if (!name || !event_datetime)
      return error(res, 'Thiếu name hoặc event_datetime', 'VALIDATION_ERROR', 400);
    if (color && !HEX_COLOR.test(color))
      return error(res, 'Màu không hợp lệ (định dạng #RRGGBB)', 'VALIDATION_ERROR', 400);

    const event = await prisma.events.create({
      data: {
        name,
        event_datetime: new Date(event_datetime),
        end_datetime: end_datetime ? new Date(end_datetime) : null,
        is_featured: Boolean(is_featured),
        color: color || null,
        location_id: location_id ? parseInt(location_id) : null,
        target_age_group_id: target_age_group_id ? parseInt(target_age_group_id) : null,
        seat_count: seat_count ? parseInt(seat_count) : null,
        custom_location_name: custom_location_name || null,
        organizer: organizer || null,
        description: description || null,
      },
    });

    return success(res, { id: event.id }, 'Thêm sự kiện thành công', {}, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/events/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const {
      name, event_datetime, end_datetime, is_featured, color,
      location_id, target_age_group_id, seat_count,
      custom_location_name, organizer, description,
    } = req.body;

    const existing = await prisma.events.findFirst({ where: { id, deleted_at: null } });
    if (!existing)
      return error(res, 'Không tìm thấy sự kiện', 'NOT_FOUND', 404);

    if (color && !HEX_COLOR.test(color))
      return error(res, 'Màu không hợp lệ (định dạng #RRGGBB)', 'VALIDATION_ERROR', 400);

    await prisma.events.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(event_datetime && { event_datetime: new Date(event_datetime) }),
        ...(end_datetime !== undefined && { end_datetime: end_datetime ? new Date(end_datetime) : null }),
        ...(is_featured !== undefined && { is_featured: Boolean(is_featured) }),
        ...(color !== undefined && { color: color || null }),
        ...(location_id !== undefined && { location_id: location_id ? parseInt(location_id) : null }),
        ...(target_age_group_id !== undefined && { target_age_group_id: target_age_group_id ? parseInt(target_age_group_id) : null }),
        ...(seat_count !== undefined && { seat_count: seat_count ? parseInt(seat_count) : null }),
        ...(custom_location_name !== undefined && { custom_location_name }),
        ...(organizer !== undefined && { organizer }),
        ...(description !== undefined && { description }),
      },
    });

    return success(res, null, 'Cập nhật thành công');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/events/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.events.findFirst({ where: { id, deleted_at: null } });
    if (!existing)
      return error(res, 'Không tìm thấy sự kiện', 'NOT_FOUND', 404);

    await prisma.events.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return success(res, null, 'Xoá thành công');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
