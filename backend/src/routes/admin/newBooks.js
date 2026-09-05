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
          book_code: true,
          cover_image: true,
          short_description: true,
          publisher: true,
          publish_year: true,
          page_count: true,
          month_year: true,
          is_featured: true,
          skoolib_url: true,
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
    const {
      title, author, book_code, cover_image, short_description,
      publisher, publish_year, page_count, month_year, is_featured, skoolib_url,
      location_id, category_id,
    } = req.body;

    if (!title || !location_id || !category_id)
      return error(res, 'Thiếu title, location_id hoặc category_id', 'VALIDATION_ERROR', 400);

    if (!skoolib_url || !skoolib_url.trim())
      return error(res, 'Đường link sách Skoolib là bắt buộc', 'VALIDATION_ERROR', 400);

    // Format or fallback month_year to YYYY-MM
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const targetMonthYear = month_year ? month_year.trim() : currentMonthYear;

    const featured = is_featured === true || is_featured === 'true';

    // If is_featured is true, untick all other books in the same month_year
    if (featured) {
      await prisma.new_Books.updateMany({
        where: {
          month_year: targetMonthYear,
          deleted_at: null,
        },
        data: {
          is_featured: false,
        },
      });
    }

    const book = await prisma.new_Books.create({
      data: {
        title: title.trim(),
        author: author ? author.trim() : null,
        book_code: book_code ? book_code.trim() : null,
        cover_image: cover_image || null,
        short_description: short_description ? short_description.trim() : null,
        publisher: publisher ? publisher.trim() : null,
        publish_year: publish_year ? parseInt(publish_year) : null,
        page_count: page_count ? parseInt(page_count) : null,
        month_year: targetMonthYear,
        is_featured: featured,
        skoolib_url: skoolib_url.trim(),
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
    const {
      title, author, book_code, cover_image, short_description,
      publisher, publish_year, page_count, month_year, is_featured, skoolib_url,
      location_id, category_id,
    } = req.body;

    const existing = await prisma.new_Books.findFirst({ where: { id, deleted_at: null } });
    if (!existing)
      return error(res, 'Không tìm thấy sách', 'NOT_FOUND', 404);

    if (skoolib_url !== undefined && !skoolib_url.trim()) {
      return error(res, 'Đường link sách Skoolib là bắt buộc', 'VALIDATION_ERROR', 400);
    }

    const targetMonthYear = month_year !== undefined ? (month_year ? month_year.trim() : null) : existing.month_year;
    const featured = is_featured !== undefined ? (is_featured === true || is_featured === 'true') : existing.is_featured;

    // If is_featured is true, untick all other books in the same month_year
    if (featured && targetMonthYear) {
      await prisma.new_Books.updateMany({
        where: {
          month_year: targetMonthYear,
          id: { not: id },
          deleted_at: null,
        },
        data: {
          is_featured: false,
        },
      });
    }

    await prisma.new_Books.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(author !== undefined && { author: author ? author.trim() : null }),
        ...(book_code !== undefined && { book_code: book_code ? book_code.trim() : null }),
        ...(cover_image !== undefined && { cover_image }),
        ...(short_description !== undefined && { short_description: short_description ? short_description.trim() : null }),
        ...(publisher !== undefined && { publisher: publisher ? publisher.trim() : null }),
        ...(publish_year !== undefined && { publish_year: publish_year ? parseInt(publish_year) : null }),
        ...(page_count !== undefined && { page_count: page_count ? parseInt(page_count) : null }),
        ...(month_year !== undefined && { month_year: targetMonthYear }),
        ...(is_featured !== undefined && { is_featured: featured }),
        ...(skoolib_url !== undefined && { skoolib_url: skoolib_url ? skoolib_url.trim() : null }),
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
