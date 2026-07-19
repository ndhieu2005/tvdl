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
        location: { select: { id: true, name: true, color_code: true, address: true } },
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

// POST /api/v1/admin/schedules/bulk — tạo 1 ca cho nhiều ngày
router.post('/bulk', async (req, res, next) => {
  try {
    const { dates, shift, time_frame, location_id, custom_location_name } = req.body;

    if (!Array.isArray(dates) || dates.length === 0)
      return error(res, 'dates phải là mảng ngày không rỗng', 'VALIDATION_ERROR', 400);
    if (dates.length > 100)
      return error(res, 'Tối đa 100 ngày mỗi lần', 'VALIDATION_ERROR', 400);
    if (!shift || !time_frame)
      return error(res, 'Thiếu shift hoặc time_frame', 'VALIDATION_ERROR', 400);
    if (!location_id && !custom_location_name)
      return error(res, 'Cần chọn cơ sở hoặc điền tên địa điểm', 'VALIDATION_ERROR', 400);

    const parsed = dates.map((d) => new Date(d));
    if (parsed.some((d) => isNaN(d)))
      return error(res, 'Có ngày không hợp lệ trong dates', 'VALIDATION_ERROR', 400);

    const result = await prisma.schedules.createMany({
      data: parsed.map((date) => ({
        date,
        shift,
        time_frame,
        location_id: location_id ? parseInt(location_id) : null,
        custom_location_name: custom_location_name || null,
      })),
    });

    return success(res, { created: result.count }, `Đã tạo ${result.count} lịch`, {}, 201);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/schedules/generate — sinh lịch từ Schedule_Templates trong khoảng from→to
router.post('/generate', async (req, res, next) => {
  try {
    const { from, to } = req.body;

    if (!from || !to)
      return error(res, 'Thiếu from hoặc to', 'VALIDATION_ERROR', 400);

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate) || isNaN(toDate) || fromDate > toDate)
      return error(res, 'Khoảng ngày không hợp lệ', 'VALIDATION_ERROR', 400);

    const DAY_MS = 24 * 60 * 60 * 1000;
    if ((toDate - fromDate) / DAY_MS > 366)
      return error(res, 'Khoảng ngày tối đa 366 ngày', 'VALIDATION_ERROR', 400);

    const templates = await prisma.schedule_Templates.findMany();
    if (templates.length === 0)
      return error(res, 'Chưa có lịch chuẩn nào — thêm lịch chuẩn tuần trước', 'VALIDATION_ERROR', 400);

    // Chống trùng: nạp các lịch hiện có trong khoảng, so theo date+shift+time_frame
    const existing = await prisma.schedules.findMany({
      where: { date: { gte: fromDate, lte: toDate } },
      select: { date: true, shift: true, time_frame: true },
    });
    const seen = new Set(
      existing.map((s) => `${s.date.toISOString().slice(0, 10)}|${s.shift}|${s.time_frame}`)
    );

    const toCreate = [];
    let skipped = 0;
    for (let t = fromDate.getTime(); t <= toDate.getTime(); t += DAY_MS) {
      const day = new Date(t);
      for (const tpl of templates.filter((x) => x.day_of_week === day.getUTCDay())) {
        const key = `${day.toISOString().slice(0, 10)}|${tpl.shift}|${tpl.time_frame}`;
        if (seen.has(key)) {
          skipped++;
          continue;
        }
        seen.add(key);
        toCreate.push({
          date: day,
          shift: tpl.shift,
          time_frame: tpl.time_frame,
          location_id: tpl.location_id,
          custom_location_name: tpl.custom_location_name,
        });
      }
    }

    const result = toCreate.length > 0
      ? await prisma.schedules.createMany({ data: toCreate })
      : { count: 0 };

    return success(
      res,
      { created: result.count, skipped },
      `Đã tạo ${result.count} lịch, bỏ qua ${skipped} lịch trùng`,
      {},
      201
    );
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
