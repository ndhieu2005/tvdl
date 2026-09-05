const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { success, error } = require('../../utils/response');

const UPLOAD_DIR = path.join(__dirname, '../../../uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, crypto.randomUUID() + ALLOWED_TYPES[file.mimetype]),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) return cb(null, true);
    cb(new Error('Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF'));
  },
});

// POST /api/v1/admin/uploads — upload 1 ảnh, trả về URL
router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return error(res, err.message, 'VALIDATION_ERROR', 400);
    if (!req.file) return error(res, 'Thiếu file ảnh', 'VALIDATION_ERROR', 400);
    return success(res, { url: `/uploads/${req.file.filename}` }, 'Upload thành công', {}, 201);
  });
});

module.exports = router;
