const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success } = require('../../utils/response');

// GET /api/v1/new-books
router.get('/', async (req, res, next) => {
  try {
    const q = req.query.q ? req.query.q.trim() : undefined;
    const category_id = req.query.category_id ? parseInt(req.query.category_id) : undefined;
    const age_group_id = req.query.age_group_id ? parseInt(req.query.age_group_id) : undefined;
    const location_id = req.query.location_id ? parseInt(req.query.location_id) : undefined;

    const where = {
      deleted_at: null,
      ...(category_id && { category_id }),
      ...(age_group_id && { category: { age_group_id } }),
      ...(location_id && { location_id }),
      ...(q && {
        OR: [
          { title: { contains: q } },
          { author: { contains: q } },
        ],
      }),
    };

    const [books, quotes] = await Promise.all([
      prisma.new_Books.findMany({
        where,
        orderBy: [
          { month_year: 'desc' },
          { is_featured: 'desc' },
          { id: 'desc' },
        ],
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
      prisma.quotes.findMany({
        where: { deleted_at: null },
        orderBy: { id: 'asc' },
        select: { id: true, content: true, author: true },
      }),
    ]);

    // Group books by month_year
    const monthGroups = new Map();
    for (const book of books) {
      let my = book.month_year;
      if (!my && book.created_at) {
        const d = new Date(book.created_at);
        my = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }
      if (!my) my = 'Khác';

      if (!monthGroups.has(my)) {
        monthGroups.set(my, []);
      }
      monthGroups.get(my).push(book);
    }

    const result = [];
    let monthIndex = 0;

    for (const [monthKey, monthBooks] of monthGroups.entries()) {
      let monthLabel = monthKey;
      if (/^\d{4}-\d{2}$/.test(monthKey)) {
        const [year, month] = monthKey.split('-');
        monthLabel = `Tháng ${parseInt(month, 10)} / ${year}`;
      }

      // Determine featured book: first one with is_featured === true, otherwise first book
      const featuredIndex = monthBooks.findIndex((b) => b.is_featured);
      let featuredBook = null;
      let gridBooks = [];

      if (featuredIndex !== -1) {
        featuredBook = monthBooks[featuredIndex];
        gridBooks = monthBooks.filter((_, idx) => idx !== featuredIndex).slice(0, 6);
      } else if (monthBooks.length > 0) {
        featuredBook = monthBooks[0];
        gridBooks = monthBooks.slice(1, 7);
      }

      const quote = quotes.length > 0 ? quotes[monthIndex % quotes.length] : null;
      monthIndex++;

      result.push({
        month_key: monthKey,
        month_label: monthLabel,
        featured_book: featuredBook,
        grid_books: gridBooks,
        quote,
      });
    }

    return success(res, result, 'OK');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
