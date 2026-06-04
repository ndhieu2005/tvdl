const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Adding businessAddress field to existing settings...');
  
  try {
    // Find the first settings record
    const existingSettings = await prisma.settings.findFirst();
    
    if (existingSettings) {
      console.log('📍 Found existing settings, updating...');
      
      // Update the existing settings with businessAddress if it doesn't exist
      await prisma.settings.update({
        where: { id: existingSettings.id },
        data: {
          businessAddress: existingSettings.businessAddress || 'Ho Chi Minh City, Vietnam'
        }
      });
      
      console.log('✅ Successfully updated settings with businessAddress');
    } else {
      console.log('📍 No existing settings found, creating default...');
      
      // Create new settings with businessAddress
      await prisma.settings.create({
        data: {
          siteName: 'ViralPeek',
          siteDescription: 'Your ultimate destination for TikTok trends and viral content',
          siteUrl: 'https://viralpeek.com',
          adminEmail: 'admin@trendiefox.com',
          businessAddress: 'Ho Chi Minh City, Vietnam',
          timezone: 'Asia/Ho_Chi_Minh',
          language: 'vi',
          dateFormat: 'dd/MM/yyyy',
          enableRegistration: true,
          enableComments: true,
          enableNewsletters: true,
          homePageTitle: 'ViralPeek',
          homePageSubtitle: 'Your ultimate destination for TikTok trends and viral content',
          metaTitle: 'ViralPeek - TikTok Trends & Viral Content',
          metaDescription: 'Discover the latest TikTok trends, viral videos, and social media content. Stay updated with ViralPeek.',
          keywords: 'tiktok, viral, trends, social media, content, videos',
          ogImage: '/images/og-image.svg',
          googleAnalyticsId: 'G-KFD6SWYG83',
          googleSearchConsole: '',
          enableSitemap: true,
          enableRobots: true,
          facebookUrl: '',
          instagramUrl: '',
          tiktokUrl: '',
          youtubeUrl: '',
          twitterUrl: '',
          enableSocialLogin: true,
          enableSocialSharing: true,
          postsPerPage: 12,
          enableAutoSave: true,
          allowImageUpload: true,
          allowVideoUpload: true,
          maxImageSize: 5,
          maxVideoSize: 100,
          allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          allowedVideoTypes: ['mp4', 'mov', 'avi', 'webm'],
          primaryColor: '#7c3aed',
          secondaryColor: '#06b6d4',
          darkMode: false,
          enableCustomCSS: false,
          customCSS: '',
          logo: '/images/logo.svg',
          favicon: '/favicon.ico',
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUser: '',
          smtpPassword: '',
          fromEmail: 'noreply@trendiefox.com',
          fromName: 'ViralPeek',
          enableSsl: true,
          enableApi: true,
          globalRateLimit: 1000,
          enableCors: true,
          corsOrigins: ['https://viralpeek.com'],
          enableApiKeyManagement: true,
        }
      });
      
      console.log('✅ Successfully created default settings with businessAddress');
    }
    
  } catch (error) {
    console.error('❌ Error updating settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  });