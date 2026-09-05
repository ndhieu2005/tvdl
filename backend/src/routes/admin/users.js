const router = require('express').Router();
const bcrypt = require('bcryptjs');
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

// Middleware chỉ cho phép Admin tổng (super_admin)
async function requireSuperAdmin(req, res, next) {
  let role = req.admin?.role;
  if (!role) {
    const user = await prisma.admins.findUnique({ where: { id: req.admin.id } });
    role = user?.role;
  }
  if (role !== 'super_admin') {
    return error(res, 'Chỉ Admin tổng mới có quyền thực hiện thao tác này', 'FORBIDDEN', 403);
  }
  next();
}

router.use(requireSuperAdmin);

// GET /api/v1/admin/users — Danh sách tài khoản admin
router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.admins.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        created_at: true,
        _count: {
          select: { posts: { where: { deleted_at: null } } },
        },
      },
    });

    const formatted = users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name || u.username,
      role: u.role,
      created_at: u.created_at,
      post_count: u._count.posts,
    }));

    return success(res, formatted, 'OK');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/users — Thêm tài khoản admin mới
router.post('/', async (req, res, next) => {
  try {
    const { username, password, name, role = 'admin' } = req.body;

    if (!username || !username.trim()) {
      return error(res, 'Thiếu tên đăng nhập', 'VALIDATION_ERROR', 400);
    }
    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-zA-Z0-9._-]+$/.test(cleanUsername) || cleanUsername.length < 3) {
      return error(res, 'Tên đăng nhập phải từ 3 ký tự và chỉ chứa chữ cái, số, dấu chấm, gạch ngang/dưới', 'VALIDATION_ERROR', 400);
    }

    if (!password || password.length < 6) {
      return error(res, 'Mật khẩu phải có ít nhất 6 ký tự', 'VALIDATION_ERROR', 400);
    }

    const validRoles = ['admin', 'super_admin'];
    const assignedRole = validRoles.includes(role) ? role : 'admin';

    // Kiểm tra username đã tồn tại chưa
    const existing = await prisma.admins.findUnique({ where: { username: cleanUsername } });
    if (existing) {
      if (!existing.deleted_at) {
        return error(res, 'Tên đăng nhập đã tồn tại', 'VALIDATION_ERROR', 400);
      }
      // Nếu đã từng bị xoá mềm, kích hoạt lại
      const password_hash = await bcrypt.hash(password, 10);
      const reactivated = await prisma.admins.update({
        where: { id: existing.id },
        data: {
          password_hash,
          name: name?.trim() || cleanUsername,
          role: assignedRole,
          deleted_at: null,
        },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          created_at: true,
        },
      });
      return success(res, reactivated, 'Tạo tài khoản thành công', {}, 201);
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.admins.create({
      data: {
        username: cleanUsername,
        password_hash,
        name: name?.trim() || cleanUsername,
        role: assignedRole,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        created_at: true,
      },
    });

    return success(res, newAdmin, 'Tạo tài khoản thành công', {}, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/users/:id — Cập nhật thông tin admin
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, role, password } = req.body;

    const existing = await prisma.admins.findFirst({ where: { id, deleted_at: null } });
    if (!existing) {
      return error(res, 'Không tìm thấy tài khoản admin', 'NOT_FOUND', 404);
    }

    const updateData = {};

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return error(res, 'Tên hiển thị không được để trống', 'VALIDATION_ERROR', 400);
      }
      updateData.name = name.trim();
    }

    if (role !== undefined) {
      const validRoles = ['admin', 'super_admin'];
      if (!validRoles.includes(role)) {
        return error(res, 'Vai trò không hợp lệ', 'VALIDATION_ERROR', 400);
      }
      // Nếu tự hạ quyền của bản thân, kiểm tra xem còn super_admin nào khác không
      if (existing.id === req.admin.id && role !== 'super_admin') {
        const otherSuperAdmin = await prisma.admins.findFirst({
          where: { role: 'super_admin', id: { not: id }, deleted_at: null },
        });
        if (!otherSuperAdmin) {
          return error(res, 'Hệ thống cần ít nhất một Admin tổng', 'VALIDATION_ERROR', 400);
        }
      }
      updateData.role = role;
    }

    if (password) {
      if (password.length < 6) {
        return error(res, 'Mật khẩu phải có ít nhất 6 ký tự', 'VALIDATION_ERROR', 400);
      }
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.admins.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        created_at: true,
      },
    });

    return success(res, updated, 'Cập nhật tài khoản thành công');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/users/:id — Xoá mềm tài khoản admin
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (id === req.admin.id) {
      return error(res, 'Không thể xoá chính tài khoản đang đăng nhập', 'VALIDATION_ERROR', 400);
    }

    const existing = await prisma.admins.findFirst({ where: { id, deleted_at: null } });
    if (!existing) {
      return error(res, 'Không tìm thấy tài khoản admin', 'NOT_FOUND', 404);
    }

    // Nếu xoá super_admin, kiểm tra còn super_admin khác không
    if (existing.role === 'super_admin') {
      const otherSuperAdmin = await prisma.admins.findFirst({
        where: { role: 'super_admin', id: { not: id }, deleted_at: null },
      });
      if (!otherSuperAdmin) {
        return error(res, 'Không thể xoá Admin tổng duy nhất của hệ thống', 'VALIDATION_ERROR', 400);
      }
    }

    await prisma.admins.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return success(res, null, 'Xoá tài khoản thành công');
  } catch (err) {
    next(err);
  }
});

module.exports = router;