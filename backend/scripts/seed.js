const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  // Locations
  await prisma.locations.createMany({
    data: [
      { name: 'Cơ sở 1', type: 'branch', color_code: '#3B82F6' },
      { name: 'Cơ sở 2', type: 'branch', color_code: '#10B981' },
      { name: 'Dự án lưu động', type: 'mobile', color_code: '#F59E0B' },
    ],
    skipDuplicates: true,
  });

  // Age_Groups
  await prisma.age_Groups.createMany({
    data: [
      { name: 'Thiếu nhi' },
      { name: 'Thanh thiếu niên' },
      { name: 'Người lớn' },
    ],
    skipDuplicates: true,
  });

  // Categories (cần age_group_id)
  const [thieu_nhi, thanh_thieu_nien, nguoi_lon] = await Promise.all([
    prisma.age_Groups.findUnique({ where: { name: 'Thiếu nhi' } }),
    prisma.age_Groups.findUnique({ where: { name: 'Thanh thiếu niên' } }),
    prisma.age_Groups.findUnique({ where: { name: 'Người lớn' } }),
  ]);

  await prisma.categories.createMany({
    data: [
      { name: 'Truyện tranh', age_group_id: thieu_nhi.id },
      { name: 'Khoa học', age_group_id: thieu_nhi.id },
      { name: 'Văn học', age_group_id: thanh_thieu_nien.id },
      { name: 'Kỹ năng sống', age_group_id: nguoi_lon.id },
    ],
    skipDuplicates: true,
  });

  // Admin account
  const password_hash = await bcrypt.hash('admin123', 10);
  await prisma.admins.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password_hash },
  });

  console.log('Seed xong!');
  const counts = await Promise.all([
    prisma.locations.count(),
    prisma.age_Groups.count(),
    prisma.categories.count(),
  ]);
  console.log(`Locations: ${counts[0]}, Age_Groups: ${counts[1]}, Categories: ${counts[2]}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
