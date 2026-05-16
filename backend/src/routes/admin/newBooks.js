const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

// GET /api/v1/admin/new-books?page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [total, books] = await prisma.$transaction([
      prisma.new_Books.count({ where: { deleted_at: null } }),
      prisma.new_Books.findMany({
        where: { deleted_at: null },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          author: true,
          cover_image: true,
          short_description: true,
          created_at: true,
          location: { select: { id: true, name: true } },
          category: {
            select: {
              id: true,
              name: true,
              age_group: { select: { id: true, name: true } },
            },
          },
        },
      }),
    ]);

    return success(res, books, 'OK', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/new-books
router.post('/', async (req, res, next) => {
  try {
    const { title, author, cover_image, short_description, location_id, category_id } = req.body;

    if (!title || !location_id || !category_id)
      return error(res, 'Thiếu title, location_id hoặc category_id', 'VALIDATION_ERROR', 400);

    const book = await prisma.new_Books.create({
      data: {
        title,
        author: author || null,
        cover_image: cover_image || null,
        short_description: short_description || null,
        location_id: parseInt(location_id),
        category_id: parseInt(category_id),
      },
    });

    return success(res, { id: book.id }, 'Thêm sách mới thành công', {}, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/new-books/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { title, author, cover_image, short_description, location_id, category_id } = req.body;

    const existing = await prisma.new_Books.findFirst({ where: { id, deleted_at: null } });
    if (!existing)
      return error(res, 'Không tìm thấy sách', 'NOT_FOUND', 404);

    await prisma.new_Books.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(author !== undefined && { author }),
        ...(cover_image !== undefined && { cover_image }),
        ...(short_description !== undefined && { short_description }),
        ...(location_id && { location_id: parseInt(location_id) }),
        ...(category_id && { category_id: parseInt(category_id) }),
      },
    });

    return success(res, null, 'Cập nhật thành công');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/new-books/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.new_Books.findFirst({ where: { id, deleted_at: null } });
    if (!existing)
      return error(res, 'Không tìm thấy sách', 'NOT_FOUND', 404);

    await prisma.new_Books.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return success(res, null, 'Xoá thành công');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
