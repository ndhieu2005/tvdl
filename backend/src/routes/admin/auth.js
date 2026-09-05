const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../lib/prisma');
const auth = require('../../middleware/auth');
const { success, error } = require('../../utils/response');

// POST /api/v1/admin/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return error(res, 'Thiếu username hoặc password', 'VALIDATION_ERROR', 400);

    const admin = await prisma.admins.findUnique({ where: { username } });
    if (!admin || admin.deleted_at)
      return error(res, 'Tài khoản không tồn tại', 'NOT_FOUND', 404);

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid)
      return error(res, 'Sai mật khẩu', 'INVALID_CREDENTIALS', 401);

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role || 'admin',
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return success(
      res,
      {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role || 'admin',
        },
      },
      'Đăng nhập thành công'
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/auth/me — Lấy thông tin admin đang đăng nhập
router.get('/me', auth, async (req, res, next) => {
  try {
    const admin = await prisma.admins.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        created_at: true,
      },
    });

    if (!admin || admin.deleted_at)
      return error(res, 'Tài khoản không tồn tại', 'NOT_FOUND', 404);

    return success(res, admin, 'OK');
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/auth/profile — Admin tự chỉnh sửa tên & mật khẩu của bản thân
router.put('/profile', auth, async (req, res, next) => {
  try {
    const { name, current_password, new_password } = req.body;

    const admin = await prisma.admins.findUnique({ where: { id: req.admin.id } });
    if (!admin || admin.deleted_at)
      return error(res, 'Tài khoản không tồn tại', 'NOT_FOUND', 404);

    const updateData = {};

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return error(res, 'Tên hiển thị không được để trống', 'VALIDATION_ERROR', 400);
      }
      updateData.name = name.trim();
    }

    if (new_password) {
      if (!current_password) {
        return error(res, 'Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu', 'VALIDATION_ERROR', 400);
      }
      const valid = await bcrypt.compare(current_password, admin.password_hash);
      if (!valid) {
        return error(res, 'Mật khẩu hiện tại không chính xác', 'INVALID_CREDENTIALS', 400);
      }
      if (new_password.length < 6) {
        return error(res, 'Mật khẩu mới phải có ít nhất 6 ký tự', 'VALIDATION_ERROR', 400);
      }
      updateData.password_hash = await bcrypt.hash(new_password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 'Không có thông tin nào để cập nhật', 'VALIDATION_ERROR', 400);
    }

    const updated = await prisma.admins.update({
      where: { id: req.admin.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        created_at: true,
      },
    });

    const token = jwt.sign(
      {
        id: updated.id,
        username: updated.username,
        name: updated.name,
        role: updated.role || 'admin',
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return success(res, { admin: updated, token }, 'Cập nhật thông tin thành công');
  } catch (err) {
    next(err);
  }
});

module.exports = router;

