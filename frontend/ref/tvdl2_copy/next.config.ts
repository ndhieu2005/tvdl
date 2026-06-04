import type { NextConfig } from "next";
// import createNextIntlPlugin from 'next-intl/plugin';

// const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Remove clientInstrumentationHook as it's no longer supported
  },
  // Reduce file watching in development
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config: any) => {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
      return config;
    },
  }),
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: '*.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-sign-sg.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-sign-va.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-sign.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-sign-us.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'http',
        hostname: '192.168.50.161',
        port: '9000',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
    // Cấu hình cho production environment để tránh lỗi image optimization
    ...(process.env.NODE_ENV === 'production' && {
      unoptimized: false,
      loader: 'default',
    }),
    // Cấu hình đặc biệt cho staging environment - disable optimization to fix issues
    ...(process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging' && {
      unoptimized: true,
    }),
    // Re-enabled optimization after fixing CSS issues
    // ...(process.env.NODE_ENV === 'development' && {
    //   unoptimized: true,
    // }),
    // Cấu hình device sizes và image sizes - optimized for mobile and performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 640, 750, 828],
    // Cấu hình formats - Next.js chỉ hỗ trợ webp và avif
    formats: ['image/webp', 'image/avif'],
    // Cấu hình minimumCacheTTL
    minimumCacheTTL: 60,
    // Cấu hình dangerouslyAllowSVG nếu cần
    dangerouslyAllowSVG: true,
    // Mobile-specific optimizations
    contentSecurityPolicy: `default-src 'self'; script-src 'none'; sandbox;`,
  },
  async rewrites() {
    return [
      {
        source: '/api/tiktok-embed/:path*',
        destination: 'https://www.tiktok.com/oembed?url=:path*',
      },
      // Handle old uploads URLs and redirect to new API
      {
        source: '/uploads/:path*',
        destination: '/api/public/files/:path*',
      },
      // Redirect private media API to public for Next.js Image optimization
      {
        source: '/api/media/:id',
        destination: '/api/public/media/:id',
      },
    ];
  },
};

export default nextConfig;
