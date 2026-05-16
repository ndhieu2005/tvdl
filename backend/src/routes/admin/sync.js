const router = require('express').Router();
const multer = require('multer');
const ExcelJS = require('exceljs');
const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');
const { Readable } = require('stream');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

async function parseSheet(workbook, sheetNameOrIndex) {
  const sheet =
    typeof sheetNameOrIndex === 'string'
      ? workbook.getWorksheet(sheetNameOrIndex)
      : workbook.worksheets[sheetNameOrIndex];
  if (!sheet) return [];

  const rows = [];
  let headers = [];
  sheet.eachRow((row, rowNumber) => {
    const values = row.values.slice(1); // exceljs row.values[0] is always null
    if (rowNumber === 1) {
      headers = values.map(v => (v ? String(v).trim() : ''));
    } else {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] !== undefined && values[i] !== null ? values[i] : null;
      });
      rows.push(obj);
    }
  });
  return rows;
}

// POST /api/v1/admin/sync
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'Chưa upload file', 'VALIDATION_ERROR', 400);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const readersRaw = await parseSheet(workbook, 'Readers') || await parseSheet(workbook, 0);
    const booksRaw = await parseSheet(workbook, 'Books') || await parseSheet(workbook, 1);

    if (!readersRaw.length && !booksRaw.length)
      return error(res, 'File không có dữ liệu', 'VALIDATION_ERROR', 400);

    // Collect unique age_groups & categories from Books
    const ageGroupNames = [...new Set(booksRaw.map(r => r.age_group).filter(Boolean))];
    const categoryPairs = [...new Map(
      booksRaw
        .filter(r => r.category && r.age_group)
        .map(r => [`${r.age_group}||${r.category}`, { age_group: r.age_group, category: r.category }])
    ).values()];

    await prisma.$transaction(async (tx) => {
      // Upsert Age_Groups
      for (const name of ageGroupNames) {
        await tx.age_Groups.upsert({
          where: { name },
          create: { name },
          update: {},
        });
      }

      // Upsert Categories
      for (const { age_group, category } of categoryPairs) {
        const ag = await tx.age_Groups.findUnique({ where: { name: age_group } });
        if (!ag) continue;
        const existing = await tx.categories.findFirst({
          where: { name: category, age_group_id: ag.id },
        });
        if (!existing) {
          await tx.categories.create({ data: { name: category, age_group_id: ag.id } });
        }
      }

      // Delete old data
      await tx.books.deleteMany({});
      await tx.readers.deleteMany({});

      // Bulk insert Readers
      if (readersRaw.length) {
        await tx.readers.createMany({
          data: readersRaw
            .filter(r => r.reader_code)
            .map(r => ({
              reader_code: String(r.reader_code).trim(),
              full_name: r.full_name ? String(r.full_name).trim() : null,
            })),
          skipDuplicates: true,
        });
      }

      // Bulk insert Books
      if (booksRaw.length) {
        const allCategories = await tx.categories.findMany({ include: { age_group: true } });
        const categoryMap = new Map(
          allCategories.map(c => [`${c.age_group.name}||${c.name}`, c.id])
        );

        const allLocations = await tx.locations.findMany();
        const locationMap = new Map(allLocations.map(l => [l.name.toLowerCase(), l.id]));

        const booksData = booksRaw
          .filter(r => r.book_code && r.title)
          .map(r => {
            const category_id = categoryMap.get(`${r.age_group}||${r.category}`);
            const location_id = locationMap.get(String(r.location || '').toLowerCase());
            if (!category_id || !location_id) return null;
            return {
              book_code: String(r.book_code).trim(),
              title: String(r.title).trim(),
              author: r.author ? String(r.author).trim() : '',
              cover_url: r.cover_url ? String(r.cover_url).trim() : null,
              location_id,
              category_id,
            };
          })
          .filter(Boolean);

        await tx.books.createMany({ data: booksData, skipDuplicates: true });
      }
    });

    return success(res, null, 'Đồng bộ dữ liệu thành công');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
