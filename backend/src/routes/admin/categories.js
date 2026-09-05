const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

// GET /api/v1/admin/categories
router.get('/', async (req, res, next) => {
  try {
    const age_group_id = req.query.age_group_id ? parseInt(req.query.age_group_id) : undefined;
    const categories = await prisma.categories.findMany({
      where: {
        deleted_at: null,
        ...(age_group_id && { age_group_id }),
      },
      select: {
        id: true,
        name: true,
        age_group_id: true,
        age_group: { select: { id: true, name: true } },
        _count: {
          select: {
            books: { where: { deleted_at: null } },
            new_books: { where: { deleted_at: null } },
            book_suggestions: true,
          },
        },
      },
      orderBy: [
        { age_group_id: 'asc' },
        { name: 'asc' },
      ],
    });

    return success(res, categories, 'OK');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/categories
router.post('/', async (req, res, next) => {
  try {
    const { name, age_group_id } = req.body;

    if (!name || !name.trim()) {
      return error(res, 'Vui lòng nhập tên thể loại', 'VALIDATION_ERROR', 400);
    }
    if (!age_group_id) {
      return error(res, 'Vui lòng chọn nhóm tuổi', 'VALIDATION_ERROR', 400);
    }

    const ageGroup = await prisma.age_Groups.findFirst({
      where: { id: parseInt(age_group_id), deleted_at: null },
    });
    if (!ageGroup) {
      return error(res, 'Nhóm tuổi không hợp lệ', 'VALIDATION_ERROR', 400);
    }

    const newCategory = await prisma.categories.create({
      data: {
        name: name.trim(),
        age_group_id: parseInt(age_group_id),
      },
      include: {
        age_group: { select: { id: true, name: true } },
      },
    });

    return success(res, newCategory, 'Thêm thể loại thành công', {}, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/categories/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, age_group_id } = req.body;

    const existing = await prisma.categories.findFirst({
      where: { id, deleted_at: null },
    });
    if (!existing) {
      return error(res, 'Không tìm thấy thể loại', 'NOT_FOUND', 404);
    }

    if (age_group_id) {
      const ageGroup = await prisma.age_Groups.findFirst({
        where: { id: parseInt(age_group_id), deleted_at: null },
      });
      if (!ageGroup) {
        return error(res, 'Nhóm tuổi không hợp lệ', 'VALIDATION_ERROR', 400);
      }
    }

    const updated = await prisma.categories.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(age_group_id && { age_group_id: parseInt(age_group_id) }),
      },
      include: {
        age_group: { select: { id: true, name: true } },
      },
    });

    return success(res, updated, 'Cập nhật thể loại thành công');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/categories/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.categories.findFirst({
      where: { id, deleted_at: null },
    });
    if (!existing) {
      return error(res, 'Không tìm thấy thể loại', 'NOT_FOUND', 404);
    }

    await prisma.categories.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return success(res, null, 'Xoá thể loại thành công');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
