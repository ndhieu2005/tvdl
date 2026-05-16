const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../lib/prisma');
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
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return success(res, { token }, 'Đăng nhập thành công');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
