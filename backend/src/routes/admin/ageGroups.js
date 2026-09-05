const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

// GET /api/v1/admin/age-groups
router.get('/', async (req, res, next) => {
  try {
    const ageGroups = await prisma.age_Groups.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            categories: { where: { deleted_at: null } },
            events: { where: { deleted_at: null } },
          },
        },
      },
    });

    return success(res, ageGroups, 'OK');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/age-groups
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return error(res, 'Vui lòng nhập tên nhóm tuổi', 'VALIDATION_ERROR', 400);
    }

    const trimmed = name.trim();
    const existing = await prisma.age_Groups.findFirst({
      where: { name: trimmed, deleted_at: null },
    });
    if (existing) {
      return error(res, 'Nhóm tuổi đã tồn tại', 'DUPLICATE_NAME', 400);
    }

    const ageGroup = await prisma.age_Groups.create({
      data: { name: trimmed },
    });

    return success(res, ageGroup, 'Thêm nhóm tuổi thành công', {}, 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
