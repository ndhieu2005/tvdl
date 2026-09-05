const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

// GET /api/v1/admin/quotes?page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [total, quotes] = await prisma.$transaction([
      prisma.quotes.count({ where: { deleted_at: null } }),
      prisma.quotes.findMany({
        where: { deleted_at: null },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          content: true,
          author: true,
          created_at: true,
          updated_at: true,
        },
      }),
    ]);

    return success(res, quotes, 'OK', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/quotes
router.post('/', async (req, res, next) => {
  try {
    const { content, author } = req.body;

    if (!content || !content.trim()) {
      return error(res, 'Nội dung trích dẫn không được để trống', 'VALIDATION_ERROR', 400);
    }

    const quote = await prisma.quotes.create({
      data: {
        content: content.trim(),
        author: author ? author.trim() : null,
      },
    });

    return success(res, { id: quote.id }, 'Thêm câu trích dẫn thành công', {}, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/quotes/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { content, author } = req.body;

    const existing = await prisma.quotes.findFirst({ where: { id, deleted_at: null } });
    if (!existing) {
      return error(res, 'Không tìm thấy trích dẫn', 'NOT_FOUND', 404);
    }

    if (content !== undefined && !content.trim()) {
      return error(res, 'Nội dung trích dẫn không được để trống', 'VALIDATION_ERROR', 400);
    }

    await prisma.quotes.update({
      where: { id },
      data: {
        ...(content !== undefined && { content: content.trim() }),
        ...(author !== undefined && { author: author ? author.trim() : null }),
      },
    });

    return success(res, null, 'Cập nhật trích dẫn thành công');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/quotes/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.quotes.findFirst({ where: { id, deleted_at: null } });
    if (!existing) {
      return error(res, 'Không tìm thấy trích dẫn', 'NOT_FOUND', 404);
    }

    await prisma.quotes.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return success(res, null, 'Xoá trích dẫn thành công');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
