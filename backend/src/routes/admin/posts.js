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
    const post = await prisma.posts.findFirst({ where: { id, deleted_at: null } });
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
    const { title, summary, content, cover_image } = req.body;

    if (!title || !content)
      return error(res, 'Thiếu title hoặc content', 'VALIDATION_ERROR', 400);

    const post = await prisma.posts.create({
      data: {
        title,
        slug: await uniqueSlug(title),
        summary: summary || null,
        content: sanitizeHtml(content, SANITIZE_OPTIONS),
        cover_image: cover_image || null,
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
    const { title, summary, content, cover_image } = req.body;

    const existing = await prisma.posts.findFirst({ where: { id, deleted_at: null } });
    if (!existing)
      return error(res, 'Không tìm thấy bài viết', 'NOT_FOUND', 404);

    await prisma.posts.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(summary !== undefined && { summary }),
        ...(content && { content: sanitizeHtml(content, SANITIZE_OPTIONS) }),
        ...(cover_image !== undefined && { cover_image }),
      },
    });

    return success(res, null, 'Cập nhật thành công');
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
