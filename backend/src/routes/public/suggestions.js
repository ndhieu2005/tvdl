const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

// POST /api/v1/suggestions
router.post('/', async (req, res, next) => {
  try {
    const { reader_name, reader_code, email, book_name, category_id, age_group_id, description } = req.body;

    if (!book_name || !book_name.trim())
      return error(res, 'Vui lòng nhập tên sách đề xuất', 'VALIDATION_ERROR', 400);

    const suggestion = await prisma.book_Suggestions.create({
      data: {
        reader_name: reader_name ? reader_name.trim() : null,
        reader_code: reader_code ? reader_code.trim() : null,
        email: email ? email.trim() : null,
        book_name: book_name.trim(),
        category_id: category_id ? parseInt(category_id) : null,
        age_group_id: age_group_id ? parseInt(age_group_id) : null,
        description: description ? description.trim() : null,
      },
    });

    return success(res, { id: suggestion.id }, 'Gửi đề xuất thành công', {}, 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
