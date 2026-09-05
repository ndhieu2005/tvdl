const router = require('express').Router();
const sanitizeHtml = require('sanitize-html');
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');
const slugify = require('../../utils/slugify');

const SANITIZE_OPTIONS = {
  allowedTags: ['p', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'br'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt'],
  },
  allowedSchemes: ['http', 'https'],
  allowedSchemesByTag: { img: ['http', 'https'] },
};

async function uniqueSlug(title) {
  const base = slugify(title) || 'bai-viet';
  let slug = base;
  let n = 2;
  while (await prisma.posts.findFirst({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

// GET /api/v1/admin/posts?page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [total, posts] = await prisma.$transaction([
      prisma.posts.count({ where: { deleted_at: null } }),
      prisma.posts.findMany({
        where: { deleted_at: null },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          cover_image: true,
          is_featured: true,
          author_id: true,
          author: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          created_at: true,
          updated_at: true,
        },
      }),
    ]);

    return success(res, posts, 'OK', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/posts/:id — lấy đủ content để sửa
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const post = await prisma.posts.findFirst({
      where: { id, deleted_at: null },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });
    if (!post)
      return error(res, 'Không tìm thấy bài viết', 'NOT_FOUND', 404);
    return success(res, post);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/posts
router.post('/', async (req, res, next) => {
  try {
    const { title, summary, content, cover_image, is_featured } = req.body;

    if (!title || !content)
      return error(res, 'Thiếu title hoặc content', 'VALIDATION_ERROR', 400);

    const featured = is_featured === true || is_featured === 'true';
    if (featured) {
      await prisma.posts.updateMany({
        where: { deleted_at: null },
        data: { is_featured: false },
      });
    }

    const post = await prisma.posts.create({
      data: {
        title,
        slug: await uniqueSlug(title),
        summary: summary || null,
        content: sanitizeHtml(content, SANITIZE_OPTIONS),
        cover_image: cover_image || null,
        is_featured: featured,
        author_id: req.admin?.id || null,
      },
    });

    return success(res, { id: post.id, slug: post.slug }, 'Đăng bài viết thành công', {}, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/posts/:id — slug giữ nguyên để URL bền
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { title, summary, content, cover_image, is_featured } = req.body;

    const existing = await prisma.posts.findFirst({ where: { id, deleted_at: null } });
    if (!existing)
      return error(res, 'Không tìm thấy bài viết', 'NOT_FOUND', 404);

    const featured = is_featured !== undefined ? (is_featured === true || is_featured === 'true') : undefined;
    if (featured === true) {
      await prisma.posts.updateMany({
        where: { id: { not: id }, deleted_at: null },
        data: { is_featured: false },
      });
    }

    await prisma.posts.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(summary !== undefined && { summary }),
        ...(content && { content: sanitizeHtml(content, SANITIZE_OPTIONS) }),
        ...(cover_image !== undefined && { cover_image }),
        ...(featured !== undefined && { is_featured: featured }),
      },
    });

    return success(res, null, 'Cập nhật thành công');
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/admin/posts/:id/featured - Toggle or set featured post
router.patch('/:id/featured', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.posts.findFirst({ where: { id, deleted_at: null } });
    if (!existing)
      return error(res, 'Không tìm thấy bài viết', 'NOT_FOUND', 404);

    const nextState = !existing.is_featured;
    if (nextState) {
      await prisma.posts.updateMany({
        where: { id: { not: id }, deleted_at: null },
        data: { is_featured: false },
      });
    }

    await prisma.posts.update({
      where: { id },
      data: { is_featured: nextState },
    });

    return success(res, { is_featured: nextState }, nextState ? 'Đã ghim làm bài viết nổi bật' : 'Đã bỏ ghim nổi bật');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/posts/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.posts.findFirst({ where: { id, deleted_at: null } });
    if (!existing)
      return error(res, 'Không tìm thấy bài viết', 'NOT_FOUND', 404);

    await prisma.posts.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return success(res, null, 'Xoá thành công');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
