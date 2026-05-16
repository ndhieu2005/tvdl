const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

// GET /api/v1/admin/schedules?month=&year=
router.get('/', async (req, res, next) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    if (!month || !year || month < 1 || month > 12)
      return error(res, 'Thiếu hoặc sai tham số month/year', 'VALIDATION_ERROR', 400);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const schedules = await prisma.schedules.findMany({
      where: { date: { gte: startDate, lt: endDate } },
      orderBy: [{ date: 'asc' }, { shift: 'asc' }],
      select: {
        id: true,
        date: true,
        shift: true,
        time_frame: true,
        is_sudden_closed: true,
        closed_reason: true,
        custom_location_name: true,
        location: { select: { id: true, name: true, color_code: true } },
      },
    });

    return success(res, schedules);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/schedules
router.post('/', async (req, res, next) => {
  try {
    const { date, shift, time_frame, location_id, custom_location_name } = req.body;

    if (!date || !shift || !time_frame)
      return error(res, 'Thiếu date, shift hoặc time_frame', 'VALIDATION_ERROR', 400);
    if (!location_id && !custom_location_name)
      return error(res, 'Cần chọn cơ sở hoặc điền tên địa điểm', 'VALIDATION_ERROR', 400);

    const schedule = await prisma.schedules.create({
      data: {
        date: new Date(date),
        shift,
        time_frame,
        location_id: location_id ? parseInt(location_id) : null,
        custom_location_name: custom_location_name || null,
      },
    });

    return success(res, { id: schedule.id }, 'Thêm lịch thành công', {}, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/schedules/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { date, shift, time_frame, location_id, custom_location_name, is_sudden_closed, closed_reason } = req.body;

    const existing = await prisma.schedules.findUnique({ where: { id } });
    if (!existing)
      return error(res, 'Không tìm thấy lịch', 'NOT_FOUND', 404);

    await prisma.schedules.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(shift && { shift }),
        ...(time_frame && { time_frame }),
        ...(location_id !== undefined && { location_id: location_id ? parseInt(location_id) : null }),
        ...(custom_location_name !== undefined && { custom_location_name }),
        ...(is_sudden_closed !== undefined && { is_sudden_closed }),
        ...(closed_reason !== undefined && { closed_reason }),
      },
    });

    return success(res, null, 'Cập nhật lịch thành công');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/schedules/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.schedules.findUnique({ where: { id } });
    if (!existing)
      return error(res, 'Không tìm thấy lịch', 'NOT_FOUND', 404);

    await prisma.schedules.delete({ where: { id } });

    return success(res, null, 'Xoá lịch thành công');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
