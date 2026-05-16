const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return error(res, 'Token không tồn tại', 'UNAUTHORIZED', 401);

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return error(res, 'Token không hợp lệ hoặc đã hết hạn', 'INVALID_TOKEN', 401);
  }
};
