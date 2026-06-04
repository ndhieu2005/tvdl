import { PrismaClient, PostStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding posts...');

  // Get existing users and categories
  const users = await prisma.user.findMany();
  const categories = await prisma.category.findMany();

  if (users.length === 0) {
    console.error('❌ No users found. Please run seed first.');
    process.exit(1);
  }

  if (categories.length === 0) {
    console.error('❌ No categories found. Please run seed first.');
    process.exit(1);
  }

  const adminUser = users.find(u => u.role === 'ADMIN') || users[0];
  const editorUser = users.find(u => u.role === 'EDITOR') || users[0];

  // Sample posts data
  const postsData = [
    {
      title: 'Top 10 TikTok Trends Đang Hot Nhất Tháng Này',
      slug: 'top-10-tiktok-trends-dang-hot-nhat-thang-nay',
      content: `
# Top 10 TikTok Trends Đang Hot Nhất Tháng Này

TikTok luôn là nơi sinh ra những xu hướng viral mới mỗi ngày. Hãy cùng khám phá top 10 trends đang làm mưa làm gió trên nền tảng này!

## 1. Dance Challenge Mới

Những điệu nhảy viral đang thu hút hàng triệu lượt xem...

## 2. Âm Thanh Trending

Các bản nhạc đang được sử dụng nhiều nhất...

## 3. Filter Hot

Những filter mới tạo hiệu ứng ấn tượng...

Và còn nhiều xu hướng thú vị khác đang chờ bạn khám phá!
      `,
      excerpt: 'Khám phá top 10 xu hướng TikTok đang hot nhất hiện tại, từ dance challenge đến âm thanh viral và filter mới.',
      featuredImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
      status: PostStatus.PUBLISHED,
      categoryId: categories.find(c => c.slug === 'trending-now')?.id || categories[0].id,
      authorId: adminUser.id,
      createdBy: adminUser.id,
      publishDate: new Date(),
      viewCount: 1250,
      likeCount: 89,
      shareCount: 23,
      commentCount: 15,
      seoTitle: 'Top 10 TikTok Trends Hot Nhất - Xu Hướng Viral Mới Nhất',
      seoDescription: 'Cập nhật top 10 xu hướng TikTok đang hot nhất tháng này. Khám phá dance challenge, âm thanh viral và filter mới.',
      seoKeywords: '["tiktok trends", "viral", "dance challenge", "trending sounds"]',
      readingTime: 5,
      priorityScore: 95.5
    },
    {
      title: 'Hướng Dẫn Tạo Video TikTok Viral Trong 5 Phút',
      slug: 'huong-dan-tao-video-tiktok-viral-trong-5-phut',
      content: `
# Hướng Dẫn Tạo Video TikTok Viral Trong 5 Phút

Bạn muốn tạo ra những video TikTok viral? Đây là hướng dẫn chi tiết từ A-Z!

## Bước 1: Chọn Trend Phù Hợp

Việc đầu tiên là tìm hiểu xu hướng đang hot...

## Bước 2: Chuẩn Bị Nội Dung

Lên ý tưởng sáng tạo và độc đáo...

## Bước 3: Quay Video Chất Lượng

Tips để có video đẹp mắt...

## Bước 4: Edit Và Đăng Tải

Những thủ thuật edit hiệu quả...

Hãy thực hành ngay để tạo ra video viral đầu tiên của bạn!
      `,
      excerpt: 'Hướng dẫn chi tiết cách tạo video TikTok viral chỉ trong 5 phút. Từ chọn trend đến edit và đăng tải.',
      featuredImage: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=600&fit=crop',
      status: PostStatus.PUBLISHED,
      categoryId: categories.find(c => c.slug === 'guidelines')?.id || categories[0].id,
      authorId: editorUser.id,
      createdBy: editorUser.id,
      publishDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      viewCount: 2340,
      likeCount: 156,
      shareCount: 45,
      commentCount: 28,
      seoTitle: 'Cách Tạo Video TikTok Viral - Hướng Dẫn Chi Tiết',
      seoDescription: 'Học cách tạo video TikTok viral trong 5 phút với hướng dẫn từ A-Z. Tips và thủ thuật hiệu quả.',
      seoKeywords: '["tiktok viral", "tạo video", "hướng dẫn", "tips"]',
      readingTime: 7,
      priorityScore: 88.2
    },
    {
      title: 'Top 5 Âm Thanh TikTok Được Yêu Thích Nhất Tuần Này',
      slug: 'top-5-am-thanh-tiktok-duoc-yeu-thich-nhat-tuan-nay',
      content: `
# Top 5 Âm Thanh TikTok Được Yêu Thích Nhất Tuần Này

Âm thanh là linh hồn của mỗi video TikTok. Cùng khám phá top 5 sounds đang trending!

## 1. "Viral Sound #1"

Âm thanh này đang được sử dụng trong hơn 2 triệu video...

## 2. "Trending Beat"

Một beat cực kỳ catchy đang làm mưa làm gió...

## 3. "Popular Song Remix"

Bản remix này tạo ra xu hướng dance mới...

## 4. "Funny Sound Effect"

Hiệu ứng âm thanh hài hước này...

## 5. "Emotional Track"

Bản nhạc cảm xúc này phù hợp cho video storytelling...

Hãy sử dụng những âm thanh này để tăng khả năng viral cho video của bạn!
      `,
      excerpt: 'Tổng hợp top 5 âm thanh TikTok đang được yêu thích và sử dụng nhiều nhất tuần này.',
      featuredImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      status: PostStatus.PUBLISHED,
      categoryId: categories.find(c => c.slug === 'sounds')?.id || categories[0].id,
      authorId: adminUser.id,
      createdBy: adminUser.id,
      publishDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      viewCount: 1890,
      likeCount: 134,
      shareCount: 67,
      commentCount: 42,
      seoTitle: 'Top 5 Âm Thanh TikTok Hot Nhất - Sounds Viral Tuần Này',
      seoDescription: 'Cập nhật top 5 âm thanh TikTok được yêu thích nhất tuần này. Sounds viral và trending beats.',
      seoKeywords: '["tiktok sounds", "viral audio", "trending music", "beats"]',
      readingTime: 4,
      priorityScore: 82.7
    },
    {
      title: 'Challenge Mới: #ViralDanceChallenge Đang Làm Mưa Làm Gió',
      slug: 'challenge-moi-viraldancechallenge-dang-lam-mua-lam-gio',
      content: `
# Challenge Mới: #ViralDanceChallenge Đang Làm Mưa Làm Gió

Một challenge dance mới đang thu hút sự chú ý của cộng đồng TikTok toàn cầu!

## Về Challenge Này

#ViralDanceChallenge được khởi xướng bởi...

## Cách Tham Gia

Để tham gia challenge này, bạn cần:

1. Học động tác cơ bản
2. Thêm phong cách riêng
3. Sử dụng hashtag #ViralDanceChallenge
4. Tag bạn bè để lan toa

## Những Video Nổi Bật

Một số video đã viral với challenge này...

## Tips Để Nổi Bật

Làm thế nào để video của bạn được chú ý...

Hãy tham gia ngay để không bỏ lỡ xu hướng hot này!
      `,
      excerpt: 'Challenge dance mới #ViralDanceChallenge đang thu hút hàng triệu người tham gia. Hướng dẫn chi tiết cách tham gia.',
      featuredImage: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop',
      status: PostStatus.PUBLISHED,
      categoryId: categories.find(c => c.slug === 'challenges')?.id || categories[0].id,
      authorId: editorUser.id,
      createdBy: editorUser.id,
      publishDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      viewCount: 3450,
      likeCount: 289,
      shareCount: 156,
      commentCount: 78,
      seoTitle: '#ViralDanceChallenge - Challenge TikTok Mới Đang Hot',
      seoDescription: 'Tìm hiểu về #ViralDanceChallenge đang làm mưa làm gió trên TikTok. Hướng dẫn tham gia và tips nổi bật.',
      seoKeywords: '["dance challenge", "viral challenge", "tiktok dance", "trending"]',
      readingTime: 6,
      priorityScore: 91.3
    },
    {
      title: 'Tin Tức: Sao Việt Nào Đang Hot Trên TikTok Tháng Này?',
      slug: 'tin-tuc-sao-viet-nao-dang-hot-tren-tiktok-thang-nay',
      content: `
# Tin Tức: Sao Việt Nào Đang Hot Trên TikTok Tháng Này?

Cùng cập nhật những nghệ sĩ Việt Nam đang tạo sóng trên TikTok!

## Top Sao Việt Hot Nhất

### 1. Nghệ sĩ A
Với những video sáng tạo và gần gũi...

### 2. Ca sĩ B  
Những bản hit đang viral trên nền tảng...

### 3. Diễn viên C
Những khoảnh khắc hài hước đời thường...

## Xu Hướng Nội Dung

Các sao Việt đang theo những xu hướng nào...

## Tương Tác Với Fan

Cách các nghệ sĩ kết nối với người hâm mộ...

Theo dõi để cập nhật tin tức mới nhất về sao Việt trên TikTok!
      `,
      excerpt: 'Cập nhật những sao Việt đang hot trên TikTok tháng này. Tin tức và xu hướng nội dung của các nghệ sĩ.',
      featuredImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop',
      status: PostStatus.PUBLISHED,
      categoryId: categories.find(c => c.slug === 'celebrities')?.id || categories[0].id,
      authorId: adminUser.id,
      createdBy: adminUser.id,
      publishDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      viewCount: 1670,
      likeCount: 98,
      shareCount: 34,
      commentCount: 56,
      seoTitle: 'Sao Việt Hot Trên TikTok - Tin Tức Nghệ Sĩ Mới Nhất',
      seoDescription: 'Cập nhật tin tức về các sao Việt đang hot trên TikTok. Xu hướng nội dung và tương tác với fan.',
      seoKeywords: '["sao việt", "celebrities", "tiktok vietnam", "nghệ sĩ"]',
      readingTime: 5,
      priorityScore: 76.8
    },
    {
      title: 'Top 10 Filter TikTok Đẹp Nhất Bạn Nên Thử Ngay',
      slug: 'top-10-filter-tiktok-dep-nhat-ban-nen-thu-ngay',
      content: `
# Top 10 Filter TikTok Đẹp Nhất Bạn Nên Thử Ngay

Filter là một phần không thể thiếu để tạo ra video TikTok ấn tượng!

## 1. Beauty Filter Pro
Filter làm đẹp tự nhiên nhất...

## 2. Vintage Effect
Tạo hiệu ứng retro cực chất...

## 3. Neon Glow
Hiệu ứng ánh sáng neon độc đáo...

## 4. Anime Style
Biến bạn thành nhân vật anime...

## 5. Color Pop
Làm nổi bật màu sắc trong video...

## 6. Glitch Effect
Hiệu ứng glitch futuristic...

## 7. Sparkle Magic
Hiệu ứng lấp lánh như phép thuật...

## 8. Film Grain
Tạo cảm giác như phim cũ...

## 9. Rainbow Lens
Hiệu ứng cầu vồng rực rỡ...

## 10. Mirror Effect
Tạo hiệu ứng gương độc đáo...

Hãy thử ngay những filter này để video của bạn thêm ấn tượng!
      `,
      excerpt: 'Tổng hợp top 10 filter TikTok đẹp nhất hiện tại. Từ beauty filter đến hiệu ứng đặc biệt.',
      featuredImage: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&h=600&fit=crop',
      status: PostStatus.PUBLISHED,
      categoryId: categories.find(c => c.slug === 'filters')?.id || categories[0].id,
      authorId: editorUser.id,
      createdBy: editorUser.id,
      publishDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      viewCount: 2180,
      likeCount: 167,
      shareCount: 89,
      commentCount: 45,
      seoTitle: 'Top 10 Filter TikTok Đẹp Nhất - Hiệu Ứng Hot Nhất',
      seoDescription: 'Khám phá top 10 filter TikTok đẹp nhất bạn nên thử. Beauty filter, hiệu ứng đặc biệt và tips sử dụng.',
      seoKeywords: '["tiktok filters", "beauty filter", "effects", "video editing"]',
      readingTime: 8,
      priorityScore: 79.4
    },
    {
      title: 'Bí Quyết Tăng Follower TikTok Nhanh Chóng Và Hiệu Quả',
      slug: 'bi-quyet-tang-follower-tiktok-nhanh-chong-va-hieu-qua',
      content: `
# Bí Quyết Tăng Follower TikTok Nhanh Chóng Và Hiệu Quả

Muốn tăng follower TikTok? Đây là những bí quyết được chứng minh hiệu quả!

## 1. Tạo Nội Dung Chất Lượng

Nội dung là vua - đây là nguyên tắc số 1...

## 2. Đăng Đều Đặn

Tần suất đăng bài ảnh hưởng lớn đến thuật toán...

## 3. Sử Dụng Hashtag Thông Minh

Cách chọn và sử dụng hashtag hiệu quả...

## 4. Tương Tác Với Cộng Đồng

Xây dựng mối quan hệ với người theo dõi...

## 5. Theo Kịp Xu Hướng

Luôn cập nhật và tham gia trends mới...

## 6. Tối Ưu Thời Gian Đăng

Đăng vào thời điểm người dùng online nhiều nhất...

## 7. Hợp Tác Với Creator Khác

Collab để mở rộng tầm ảnh hưởng...

Áp dụng những bí quyết này để phát triển tài khoản TikTok của bạn!
      `,
      excerpt: 'Chia sẻ bí quyết tăng follower TikTok nhanh chóng và hiệu quả. Từ tạo nội dung đến tối ưu thuật toán.',
      featuredImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=600&fit=crop',
      status: PostStatus.PUBLISHED,
      categoryId: categories.find(c => c.slug === 'guidelines')?.id || categories[0].id,
      authorId: adminUser.id,
      createdBy: adminUser.id,
      publishDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      viewCount: 4230,
      likeCount: 312,
      shareCount: 198,
      commentCount: 89,
      seoTitle: 'Cách Tăng Follower TikTok Nhanh - Bí Quyết Hiệu Quả',
      seoDescription: 'Học bí quyết tăng follower TikTok nhanh chóng và hiệu quả. Tips từ chuyên gia và chiến lược phát triển.',
      seoKeywords: '["tăng follower", "tiktok growth", "social media", "marketing"]',
      readingTime: 10,
      priorityScore: 94.1
    },
    {
      title: 'Xu Hướng Thể Thao Viral Trên TikTok: Từ Gym Đến Yoga',
      slug: 'xu-huong-the-thao-viral-tren-tiktok-tu-gym-den-yoga',
      content: `
# Xu Hướng Thể Thao Viral Trên TikTok: Từ Gym Đến Yoga

TikTok đang thay đổi cách chúng ta tiếp cận thể thao và sức khỏe!

## Gym Content Đang Hot

### Workout Challenges
Những thử thách tập luyện đang viral...

### Transformation Videos
Video before/after gây ấn tượng mạnh...

### Quick Workouts
Bài tập nhanh cho người bận rộn...

## Yoga Trends

### Morning Yoga Routines
Yoga buổi sáng đang được yêu thích...

### Yoga Challenges
Các thử thách yoga sáng tạo...

## Dance Fitness

### Zumba TikTok
Những điệu nhảy Zumba viral...

### K-pop Dance Workouts
Kết hợp K-pop với tập luyện...

## Outdoor Activities

### Running Challenges
Thử thách chạy bộ cộng đồng...

### Hiking Adventures
Chia sẻ hành trình leo núi...

Tham gia ngay để có một lối sống khỏe mạnh và trendy!
      `,
      excerpt: 'Khám phá xu hướng thể thao viral trên TikTok. Từ gym workout đến yoga, dance fitness và hoạt động ngoài trời.',
      featuredImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      status: PostStatus.PUBLISHED,
      categoryId: categories.find(c => c.slug === 'sport')?.id || categories[0].id,
      authorId: editorUser.id,
      createdBy: editorUser.id,
      publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      viewCount: 1920,
      likeCount: 145,
      shareCount: 73,
      commentCount: 38,
      seoTitle: 'Xu Hướng Thể Thao Viral TikTok - Gym, Yoga, Dance Fitness',
      seoDescription: 'Cập nhật xu hướng thể thao viral trên TikTok. Workout challenges, yoga trends và dance fitness hot nhất.',
      seoKeywords: '["thể thao", "fitness", "yoga", "workout", "tiktok sport"]',
      readingTime: 7,
      priorityScore: 73.6
    }
  ];

  // Create posts
  console.log('\n📝 Creating posts...');
  for (const postData of postsData) {
    try {
      const post = await prisma.post.create({
        data: postData
      });
      console.log(`✅ Created post: ${post.title}`);
    } catch (error) {
      console.error(`❌ Error creating post "${postData.title}":`, error);
    }
  }

  console.log('\n🎉 Posts seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding posts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });