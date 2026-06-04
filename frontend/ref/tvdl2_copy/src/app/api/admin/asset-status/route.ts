import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/auth';
import type { AuthenticatedRequest } from '@/lib/middleware/auth';
import { checkPublicAssets } from '@/lib/server-assets';

export const GET = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    console.log('🔍 Admin API - Checking asset status');
    
    const assets = checkPublicAssets();
    
    // Determine optimization status
    const faviconOptimized = assets.favicon.ico || assets.favicon.png || assets.favicon.jpg;
    const logoOptimized = assets.logo.svg || assets.logo.png || assets.logo.jpg || assets.logo.webp;
    
    const status = {
      favicon: {
        optimized: faviconOptimized,
        availableFormats: Object.entries(assets.favicon)
          .filter(([_, exists]) => exists)
          .map(([format]) => format),
        recommendedUrl: assets.favicon.ico ? '/favicon.ico' : 
                       assets.favicon.png ? '/favicon.png' : 
                       assets.favicon.jpg ? '/favicon.jpg' : null
      },
      logo: {
        optimized: logoOptimized,
        availableFormats: Object.entries(assets.logo)
          .filter(([_, exists]) => exists)
          .map(([format]) => format),
        recommendedUrl: assets.logo.svg ? '/logo.svg' : 
                       assets.logo.png ? '/logo.png' : 
                       assets.logo.webp ? '/logo.webp' :
                       assets.logo.jpg ? '/logo.jpg' : null
      },
      overall: {
        optimized: faviconOptimized && logoOptimized,
        score: (faviconOptimized ? 50 : 0) + (logoOptimized ? 50 : 0)
      }
    };
    
    console.log('🔍 Admin API - Asset status:', status);
    
    return NextResponse.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    console.error('🔍 Admin API - Asset status error:', error);
    return NextResponse.json(
      { error: 'Failed to check asset status' },
      { status: 500 }
    );
  }
});