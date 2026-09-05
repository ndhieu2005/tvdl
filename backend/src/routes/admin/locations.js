const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

// GET /api/v1/admin/locations
router.get('/', async (req, res, next) => {
  try {
    const locations = await prisma.locations.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        color_code: true,
        address: true,
        _count: {
          select: {
            books: { where: { deleted_at: null } },
            new_books: { where: { deleted_at: null } },
            events: { where: { deleted_at: null } },
            schedules: true,
          },
        },
      },
    });

    return success(res, locations, 'OK');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/locations
router.post('/', async (req, res, next) => {
  try {
    const { name, type = 'branch', color_code, address } = req.body;

    if (!name || !name.trim()) {
      return error(res, 'Vui lòng nhập tên cơ sở', 'VALIDATION_ERROR', 400);
    }

    const trimmedName = name.trim();

    const existing = await prisma.locations.findFirst({
      where: { name: trimmedName, deleted_at: null },
    });
    if (existing) {
      return error(res, 'Tên cơ sở đã tồn tại', 'DUPLICATE_NAME', 400);
    }

    const newLocation = await prisma.locations.create({
      data: {
        name: trimmedName,
        type: type || 'branch',
        color_code: color_code ? color_code.trim() : '#3B82F6',
        address: address ? address.trim() : null,
      },
    });

    return success(res, newLocation, 'Thêm cơ sở thành công', {}, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/locations/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, type, color_code, address } = req.body;

    const existing = await prisma.locations.findFirst({
      where: { id, deleted_at: null },
    });
    if (!existing) {
      return error(res, 'Không tìm thấy cơ sở', 'NOT_FOUND', 404);
    }

    if (name && name.trim()) {
      const duplicate = await prisma.locations.findFirst({
        where: { name: name.trim(), id: { not: id }, deleted_at: null },
      });
      if (duplicate) {
        return error(res, 'Tên cơ sở đã tồn tại', 'DUPLICATE_NAME', 400);
      }
    }

    const updated = await prisma.locations.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(type && { type }),
        ...(color_code !== undefined && { color_code: color_code ? color_code.trim() : null }),
        ...(address !== undefined && { address: address ? address.trim() : null }),
      },
    });

    return success(res, updated, 'Cập nhật cơ sở thành công');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/locations/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.locations.findFirst({
      where: { id, deleted_at: null },
    });
    if (!existing) {
      return error(res, 'Không tìm thấy cơ sở', 'NOT_FOUND', 404);
    }

    await prisma.locations.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return success(res, null, 'Xoá cơ sở thành công');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
