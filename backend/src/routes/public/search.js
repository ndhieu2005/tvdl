const router = require('express').Router();
const prisma = require('../../lib/prisma');
const { success } = require('../../utils/response');

function stripHtml(html = '') {
  return html.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractSnippet(text = '', query = '', maxLength = 160) {
  if (!text) return '';
  const clean = stripHtml(text);
  if (!query) return clean.slice(0, maxLength);

  const normClean = clean.toLowerCase();
  const normQuery = query.toLowerCase();
  const index = normClean.indexOf(normQuery);

  if (index === -1) {
    return clean.length > maxLength ? clean.slice(0, maxLength) + '...' : clean;
  }

  const half = Math.floor(maxLength / 2);
  let start = Math.max(0, index - half);
  let end = Math.min(clean.length, index + normQuery.length + half);

  let snippet = clean.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < clean.length) snippet = snippet + '...';

  return snippet;
}

// GET /api/v1/search?q=&limit=
router.get('/', async (req, res, next) => {
  try {
    const rawQuery = (req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 6, 30);

    if (!rawQuery) {
      return success(res, {
        posts: [],
        books: [],
        events: [],
        total: 0,
      });
    }

    // 1. Search Posts
    const postsPromise = prisma.posts.findMany({
      where: {
        deleted_at: null,
        OR: [
          { title: { contains: rawQuery } },
          { summary: { contains: rawQuery } },
          { content: { contains: rawQuery } },
        ],
      },
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        content: true,
        cover_image: true,
        created_at: true,
        author: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    // 2. Search New_Books
    const booksPromise = prisma.new_Books.findMany({
      where: {
        deleted_at: null,
        OR: [
          { title: { contains: rawQuery } },
          { author: { contains: rawQuery } },
          { book_code: { contains: rawQuery } },
          { short_description: { contains: rawQuery } },
          { publisher: { contains: rawQuery } },
        ],
      },
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
        month_year: true,
        skoolib_url: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // 3. Search Events
    const eventsPromise = prisma.events.findMany({
      where: {
        deleted_at: null,
        OR: [
          { name: { contains: rawQuery } },
          { description: { contains: rawQuery } },
          { organizer: { contains: rawQuery } },
          { custom_location_name: { contains: rawQuery } },
        ],
      },
      take: limit,
      orderBy: { event_datetime: 'desc' },
      select: {
        id: true,
        name: true,
        event_datetime: true,
        end_datetime: true,
        organizer: true,
        description: true,
        custom_location_name: true,
        location: {
          select: {
            name: true,
          },
        },
      },
    });

    const [posts, books, events] = await Promise.all([
      postsPromise,
      booksPromise,
      eventsPromise,
    ]);

    const qLower = rawQuery.toLowerCase();

    // Format Posts with match area and contextual snippet
    const formattedPosts = posts.map((post) => {
      let matchArea = 'Nội dung bài viết';
      let snippet = '';

      if (post.title?.toLowerCase().includes(qLower)) {
        matchArea = 'Tiêu đề';
        snippet = post.summary ? extractSnippet(post.summary, rawQuery, 140) : extractSnippet(post.content, rawQuery, 140);
      } else if (post.summary?.toLowerCase().includes(qLower)) {
        matchArea = 'Tóm tắt bài viết';
        snippet = extractSnippet(post.summary, rawQuery, 140);
      } else if (post.content?.toLowerCase().includes(qLower)) {
        matchArea = 'Nội dung chi tiết';
        snippet = extractSnippet(post.content, rawQuery, 140);
      } else {
        snippet = extractSnippet(post.summary || post.content, rawQuery, 140);
      }

      return {
        id: `post-${post.id}`,
        type: 'post',
        typeLabel: 'Tin tức & Bài viết',
        title: post.title,
        subtitle: post.author?.name ? `Tác giả: ${post.author.name}` : undefined,
        snippet,
        matchArea,
        url: `/news/${post.slug}`,
        image: post.cover_image,
        date: post.created_at,
      };
    });

    // Format Books with match area and contextual snippet
    const formattedBooks = books.map((book) => {
      let matchArea = 'Tên sách';
      let snippet = '';

      if (book.title?.toLowerCase().includes(qLower)) {
        matchArea = 'Tên sách';
      } else if (book.author?.toLowerCase().includes(qLower)) {
        matchArea = 'Tác giả';
      } else if (book.book_code?.toLowerCase().includes(qLower)) {
        matchArea = 'Mã sách';
      } else if (book.publisher?.toLowerCase().includes(qLower)) {
        matchArea = 'Nhà xuất bản';
      } else if (book.short_description?.toLowerCase().includes(qLower)) {
        matchArea = 'Mô tả sách';
      }

      if (book.short_description) {
        snippet = extractSnippet(book.short_description, rawQuery, 140);
      } else if (book.category?.name) {
        snippet = `Thể loại: ${book.category.name}${book.publisher ? ` • NXB: ${book.publisher}` : ''}`;
      }

      return {
        id: `book-${book.id}`,
        type: 'book',
        typeLabel: 'Sách mới',
        title: book.title,
        subtitle: book.author ? `Tác giả: ${book.author}` : undefined,
        snippet,
        matchArea,
        url: `/new-books?q=${encodeURIComponent(book.title)}`,
        externalUrl: book.skoolib_url || undefined,
        image: book.cover_image,
        badge: book.book_code,
      };
    });

    // Format Events with match area and contextual snippet
    const formattedEvents = events.map((event) => {
      let matchArea = 'Tên sự kiện';
      if (event.name?.toLowerCase().includes(qLower)) {
        matchArea = 'Tên sự kiện';
      } else if (event.organizer?.toLowerCase().includes(qLower)) {
        matchArea = 'Đơn vị tổ chức';
      } else if (event.description?.toLowerCase().includes(qLower)) {
        matchArea = 'Mô tả sự kiện';
      }

      const snippet = event.description ? extractSnippet(event.description, rawQuery, 140) : '';

      return {
        id: `event-${event.id}`,
        type: 'event',
        typeLabel: 'Sự kiện & Hoạt động',
        title: event.name,
        subtitle: event.organizer ? `Đơn vị: ${event.organizer}` : undefined,
        snippet,
        matchArea,
        url: '/schedule',
        date: event.event_datetime,
        badge: event.location?.name || event.custom_location_name,
      };
    });

    const total = formattedPosts.length + formattedBooks.length + formattedEvents.length;

    return success(res, {
      query: rawQuery,
      posts: formattedPosts,
      books: formattedBooks,
      events: formattedEvents,
      total,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
