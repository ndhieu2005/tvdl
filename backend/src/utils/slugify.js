// Chuyển tiêu đề tiếng Việt thành slug URL: bỏ dấu, đ→d, lowercase, gạch nối
function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .slice(0, 200);
}

module.exports = slugify;
