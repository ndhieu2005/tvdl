const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

const TEMPLATE_SELECT = {
  id: true,
  day_of_week: true,
  shift: true,
  time_frame: true,
  custom_location_name: true,
  location: { select: { id: true, name: true, color_code: true } },
};

function validDayOfWeek(v) {
  const n = parseInt(v);
  return Number.isInteger(n) && n >= 0 && n <= 6 ? n : null;
}

// GET /api/v1/admin/schedule-templates
router.get('/', async (req, res, next) => {
  try {
    const templates = await prisma.schedule_Templates.findMany({
      orderBy: [{ day_of_week: 'asc' }, { shift: 'asc' }],
      select: TEMPLATE_SELECT,
    });
    return success(res, templates);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/schedule-templates
router.post('/', async (req, res, next) => {
  try {
    const { day_of_week, shift, time_frame, location_id, custom_location_name } = req.body;

    const dow = validDayOfWeek(day_of_week);
    if (dow === null)
      return error(res, 'day_of_week phải từ 0 (Chủ nhật) đến 6 (Thứ 7)', 'VALIDATION_ERROR', 400);
    if (!shift || !time_frame)
      return error(res, 'Thiếu shift hoặc time_frame', 'VALIDATION_ERROR', 400);
    if (!location_id && !custom_location_name)
      return error(res, 'Cần location_id hoặc custom_location_name', 'VALIDATION_ERROR', 400);

    const template = await prisma.schedule_Templates.create({
      data: {
        day_of_week: dow,
        shift,
        time_frame,
        location_id: location_id ? parseInt(location_id) : null,
        custom_location_name: custom_location_name || null,
      },
    });

    return success(res, { id: template.id }, 'Thêm lịch chuẩn thành công', {}, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/schedule-templates/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { day_of_week, shift, time_frame, location_id, custom_location_name } = req.body;

    const existing = await prisma.schedule_Templates.findUnique({ where: { id } });
    if (!existing)
      return error(res, 'Không tìm thấy lịch chuẩn', 'NOT_FOUND', 404);

    let dow;
    if (day_of_week !== undefined) {
      dow = validDayOfWeek(day_of_week);
      if (dow === null)
        return error(res, 'day_of_week phải từ 0 (Chủ nhật) đến 6 (Thứ 7)', 'VALIDATION_ERROR', 400);
    }

    await prisma.schedule_Templates.update({
      where: { id },
      data: {
        ...(dow !== undefined && { day_of_week: dow }),
        ...(shift && { shift }),
        ...(time_frame && { time_frame }),
        ...(location_id && { location_id: parseInt(location_id) }),
        ...(custom_location_name !== undefined && { custom_location_name }),
      },
    });

    return success(res, null, 'Cập nhật thành công');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/schedule-templates/:id — hard delete (bảng cấu hình, không soft-delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.schedule_Templates.findUnique({ where: { id } });
    if (!existing)
      return error(res, 'Không tìm thấy lịch chuẩn', 'NOT_FOUND', 404);

    await prisma.schedule_Templates.delete({ where: { id } });

    return success(res, null, 'Xoá thành công');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
