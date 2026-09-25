const prisma = require("../src/lib/prisma");
const bcrypt = require("bcryptjs");

async function main() {
  // Locations
  await prisma.locations.createMany({
    data: [
      {
        name: "Cơ sở 1",
        type: "branch",
        color_code: "#3B82F6",
        address:
          "18/56 Đường Thống Nhất, Thôn Thống Nhất, Dương Hòa, TP Hà Nội",
      },
      {
        name: "Cơ sở 2",
        type: "branch",
        color_code: "#10B981",
        address: "28 Đường Thanh Niên, Thôn Me Táo, Dương Hòa, TP Hà Nội",
      },
      { name: "Dự án lưu động", type: "mobile", color_code: "#F59E0B" },
    ],
    skipDuplicates: true,
  });

  // Age_Groups
  const ageGroupNames = [
    "Nhóm 0-6 tuổi",
    "Nhóm 7-12 tuổi",
    "Nhóm 13-19 tuổi",
    "Nhóm 19 tuổi trở lên",
  ];

  for (const name of ageGroupNames) {
    await prisma.age_Groups.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Categories (cần age_group_id)
  const [group06, group712, group1319, group19plus] = await Promise.all([
    prisma.age_Groups.findUnique({ where: { name: "Nhóm 0-6 tuổi" } }),
    prisma.age_Groups.findUnique({ where: { name: "Nhóm 7-12 tuổi" } }),
    prisma.age_Groups.findUnique({ where: { name: "Nhóm 13-19 tuổi" } }),
    prisma.age_Groups.findUnique({ where: { name: "Nhóm 19 tuổi trở lên" } }),
  ]);

  const categoriesData = [
    // Nhóm 0-6 tuổi
    { name: "Sách mầm non", age_group_id: group06.id },
    { name: "Sách ngoại văn mầm non", age_group_id: group06.id },

    // Nhóm 7-12 tuổi
    { name: "Truyện tranh thiếu nhi", age_group_id: group712.id },
    { name: "Kiến thức thiếu nhi", age_group_id: group712.id },
    { name: "Văn học thiếu nhi", age_group_id: group712.id },
    { name: "Sách ngoại văn thiếu nhi", age_group_id: group712.id },

    // Nhóm 13-19 tuổi
    { name: "Truyện tranh teens", age_group_id: group1319.id },
    { name: "Văn học teens", age_group_id: group1319.id },
    { name: "Văn học lãng mạn", age_group_id: group1319.id },
    { name: "Kiến thức teens", age_group_id: group1319.id },
    { name: "Sách ngoại văn teens", age_group_id: group1319.id },

    // Nhóm 19 tuổi trở lên
    { name: "Văn học Việt Nam", age_group_id: group19plus.id },
    { name: "Văn học nước ngoài", age_group_id: group19plus.id },
    { name: "Tiểu sử hồi ký", age_group_id: group19plus.id },
    { name: "Khoa học tự nhiên", age_group_id: group19plus.id },
    { name: "Khoa học xã hội", age_group_id: group19plus.id },
    { name: "Khoa học nhân văn", age_group_id: group19plus.id },
    { name: "Công nghệ kĩ thuật", age_group_id: group19plus.id },
    { name: "Thể thao nghệ thuật", age_group_id: group19plus.id },
    { name: "Sách ngoại văn", age_group_id: group19plus.id },
    { name: "Sách cổ sách quý", age_group_id: group19plus.id },
  ];

  for (const cat of categoriesData) {
    const existing = await prisma.categories.findFirst({
      where: { name: cat.name, age_group_id: cat.age_group_id },
    });
    if (!existing) {
      await prisma.categories.create({
        data: cat,
      });
    }
  }

  // Admin account
  const password_hash = await bcrypt.hash("admin123", 10);
  await prisma.admins.upsert({
    where: { username: "admin" },
    update: { role: "super_admin", name: "Admin Tổng" },
    create: { username: "admin", name: "Admin Tổng", role: "super_admin", password_hash },
  });

  const adminUser = await prisma.admins.findUnique({
    where: { username: "admin" },
  });

  // Bài viết mẫu
  const coSo1 = await prisma.locations.findUnique({
    where: { name: "Cơ sở 1" },
  });
  await prisma.posts.upsert({
    where: { slug: "chao-mung-den-voi-thu-vien-duong-lieu" },
    update: { author_id: adminUser?.id },
    create: {
      title: "Chào mừng đến với Thư viện Dương Liễu",
      slug: "chao-mung-den-voi-thu-vien-duong-lieu",
      summary:
        "Giới thiệu về thư viện cộng đồng Dương Liễu và các hoạt động dành cho bạn đọc mọi lứa tuổi.",
      content:
        "<h2>Về thư viện</h2><p>Thư viện Dương Liễu là thư viện cộng đồng phục vụ bạn đọc mọi lứa tuổi với hai cơ sở và dự án thư viện lưu động.</p><h2>Hoạt động</h2><ul><li>Đọc sách tại chỗ và tra cứu tài liệu</li><li>Sự kiện đọc sách cuối tuần</li><li>Dự án lưu động đưa sách tới các thôn xóm</li></ul>",
      author_id: adminUser?.id,
    },
  });

  // Sự kiện nổi bật mẫu (tháng hiện tại)
  const eventName = "Ngày hội đọc sách";
  const existingEvent = await prisma.events.findFirst({
    where: { name: eventName, deleted_at: null },
  });
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
        color: "#F5C000",
        location_id: coSo1?.id ?? null,
        seat_count: 50,
        organizer: "Thư viện Dương Liễu",
        description:
          "Ngày hội đọc sách dành cho thiếu nhi với nhiều hoạt động trò chơi và kể chuyện.",
      },
    });
  }

  // Quotes mẫu
  const quotesCount = await prisma.quotes.count();
  if (quotesCount === 0) {
    await prisma.quotes.createMany({
      data: [
        {
          content: "Việc đọc rất quan trọng. Nếu bạn biết cách đọc, cả thế giới sẽ mở ra cho bạn.",
          author: "Barack Obama",
        },
        {
          content: "Sách là nguồn của cải quý báu của thế giới và là di sản xứng đáng của các thế hệ và các quốc gia.",
          author: "Henry David Thoreau",
        },
        {
          content: "Một cuốn sách hay trên giá sách là một người bạn dù quay lưng lại nhưng vẫn là bạn tốt.",
          author: "Tác giả khuyết danh",
        },
      ],
    });
  }

  // Sách mới mẫu nếu chưa có
  const newBooksCount = await prisma.new_Books.count();
  if (newBooksCount === 0) {
    const sampleCat = await prisma.categories.findFirst({ where: { name: "Văn học thiếu nhi" } }) || await prisma.categories.findFirst();
    const now = new Date();
    const currentMY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (coSo1 && sampleCat) {
      await prisma.new_Books.create({
        data: {
          title: "Hoàng Tử Bé",
          author: "Antoine de Saint-Exupéry",
          cover_image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
          short_description: "Một câu chuyện triết lý nhẹ nhàng và sâu sắc về tình bạn, tình yêu và trách nhiệm, mang thông điệp ý nghĩa cho mọi lứa tuổi.",
          publisher: "NXB Kim Đồng",
          publish_year: 2023,
          page_count: 110,
          month_year: currentMY,
          is_featured: true,
          skoolib_url: "https://skoolib.com/opac",
          location_id: coSo1.id,
          category_id: sampleCat.id,
        },
      });

      await prisma.new_Books.create({
        data: {
          title: "Cây Cam Ngọt Của Tôi",
          author: "José Mauro de Vasconcelos",
          cover_image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
          short_description: "Cuốn sách đầy xúc động về cậu bé Zezé thông minh, tinh nghịch nhưng phải chịu nhiều tổn thương.",
          publisher: "NXB Hội Nhà Văn",
          publish_year: 2022,
          page_count: 240,
          month_year: currentMY,
          is_featured: false,
          skoolib_url: "https://skoolib.com/opac",
          location_id: coSo1.id,
          category_id: sampleCat.id,
        },
      });
    }
  }

  console.log("Seed xong!");
  const counts = await Promise.all([
    prisma.locations.count(),
    prisma.age_Groups.count(),
    prisma.categories.count(),
    prisma.posts.count(),
    prisma.events.count(),
    prisma.quotes.count(),
    prisma.new_Books.count(),
  ]);
  console.log(
    `Locations: ${counts[0]}, Age_Groups: ${counts[1]}, Categories: ${counts[2]}, Posts: ${counts[3]}, Events: ${counts[4]}, Quotes: ${counts[5]}, New_Books: ${counts[6]}`,
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
