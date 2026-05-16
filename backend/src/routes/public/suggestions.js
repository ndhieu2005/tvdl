const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

// POST /api/v1/suggestions
router.post('/', async (req, res, next) => {
  try {
    const { reader_code, email, book_name, category_id, age_group_id, description } = req.body;

    if (!reader_code)
      return error(res, 'Thiếu mã bạn đọc', 'VALIDATION_ERROR', 400);

    const reader = await prisma.readers.findUnique({ where: { reader_code } });
    if (!reader || reader.deleted_at)
      return error(res, 'Mã bạn đọc không tồn tại', 'NOT_FOUND', 404);

    const suggestion = await prisma.book_Suggestions.create({
      data: {
        reader_code,
        email: email || null,
        book_name: book_name || null,
        category_id: category_id ? parseInt(category_id) : null,
        age_group_id: age_group_id ? parseInt(age_group_id) : null,
        description: description || null,
      },
    });

    return success(res, { id: suggestion.id }, 'Gửi đề xuất thành công', {}, 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
