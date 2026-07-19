const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  // Locations
  await prisma.locations.createMany({
    data: [
      { name: 'Cơ sở 1', type: 'branch', color_code: '#3B82F6', address: '18/56 Đường Thống Nhất, Thôn Thống Nhất, Dương Hòa, TP Hà Nội' },
      { name: 'Cơ sở 2', type: 'branch', color_code: '#10B981', address: '28 Đường Thanh Niên, Thôn Me Táo, Dương Hòa, TP Hà Nội' },
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

  // Bài viết mẫu
  const coSo1 = await prisma.locations.findUnique({ where: { name: 'Cơ sở 1' } });
  await prisma.posts.upsert({
    where: { slug: 'chao-mung-den-voi-thu-vien-duong-lieu' },
    update: {},
    create: {
      title: 'Chào mừng đến với Thư viện Dương Liễu',
      slug: 'chao-mung-den-voi-thu-vien-duong-lieu',
      summary: 'Giới thiệu về thư viện cộng đồng Dương Liễu và các hoạt động dành cho bạn đọc mọi lứa tuổi.',
      content:
        '<h2>Về thư viện</h2><p>Thư viện Dương Liễu là thư viện cộng đồng phục vụ bạn đọc mọi lứa tuổi với hai cơ sở và dự án thư viện lưu động.</p><h2>Hoạt động</h2><ul><li>Đọc sách tại chỗ và tra cứu tài liệu</li><li>Sự kiện đọc sách cuối tuần</li><li>Dự án lưu động đưa sách tới các thôn xóm</li></ul>',
    },
  });

  // Sự kiện nổi bật mẫu (tháng hiện tại)
  const eventName = 'Ngày hội đọc sách';
  const existingEvent = await prisma.events.findFirst({ where: { name: eventName, deleted_at: null } });
  if (!existingEvent) {
    const now = new Date();
    const eventDate = new Date(now.getFullYear(), now.getMonth(), 15, 8, 30);
    const eventEnd = new Date(now.getFullYear(), now.getMonth(), 15, 11, 0);
    await prisma.events.create({
      data: {
        name: eventName,
        event_datetime: eventDate,
        end_datetime: eventEnd,
        is_featured: true,
        color: '#F5C000',
        location_id: coSo1?.id ?? null,
        seat_count: 50,
        organizer: 'Thư viện Dương Liễu',
        description: 'Ngày hội đọc sách dành cho thiếu nhi với nhiều hoạt động trò chơi và kể chuyện.',
      },
    });
  }

  console.log('Seed xong!');
  const counts = await Promise.all([
    prisma.locations.count(),
    prisma.age_Groups.count(),
    prisma.categories.count(),
    prisma.posts.count(),
    prisma.events.count(),
  ]);
  console.log(`Locations: ${counts[0]}, Age_Groups: ${counts[1]}, Categories: ${counts[2]}, Posts: ${counts[3]}, Events: ${counts[4]}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
