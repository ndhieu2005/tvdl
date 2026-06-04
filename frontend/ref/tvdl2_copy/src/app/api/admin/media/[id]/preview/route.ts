import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Handle CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Admin preview endpoint with token authentication
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const size = searchParams.get('size') || 'medium';
    const requestedFormat = searchParams.get('format');
    const isIOSRequest = searchParams.get('ios') === 'true';
    const userAgent = req.headers.get('user-agent') || '';
    const isIOSSafari = /iPad|iPhone|iPod/.test(userAgent) && /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

    // Get file info from database
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id }
    });

    if (!mediaFile) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
    }

    try {
      // For images, return the optimized image
      if (mediaFile.type === 'IMAGE') {
        try {
          const { getMinioClient, getBucketName } = await import('@/lib/minio');
          const fileStream = await getMinioClient().getObject(getBucketName(), mediaFile.objectName);
          
          // Convert stream to buffer
          const chunks: Buffer[] = [];
          for await (const chunk of fileStream) {
            chunks.push(chunk);
          }
          const fileBuffer = Buffer.concat(chunks);

          // Determine optimal content type for iOS Safari
          let contentType = mediaFile.mimeType;
          if ((isIOSSafari || isIOSRequest) && mediaFile.type === 'IMAGE') {
            // Force JPEG for iOS Safari to avoid WebP issues
            if (requestedFormat === 'jpeg' || mediaFile.mimeType.includes('webp')) {
              contentType = 'image/jpeg';
            }
          }

          // Set appropriate headers with mobile optimization
          const headers = new Headers();
          headers.set('Content-Type', contentType);
          headers.set('Content-Length', fileBuffer.length.toString());
          
          // Add CORS headers for mobile compatibility
          headers.set('Access-Control-Allow-Origin', '*');
          headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          
          // Mobile-friendly headers
          headers.set('X-Content-Type-Options', 'nosniff');
          headers.set('Accept-Ranges', 'bytes');
          headers.set('Vary', 'Accept, User-Agent');
          
          headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
          headers.set('ETag', `"${mediaFile.objectName}-admin-preview"`);

          // iOS Safari specific headers
          if (isIOSSafari || isIOSRequest) {
            headers.set('X-iOS-Optimized', 'true');
            headers.set('X-Content-Format', contentType);
          }

          return new NextResponse(fileBuffer, {
            status: 200,
            headers
          });
        } catch (fileError) {
          console.warn(`Image file not found in storage: ${mediaFile.objectName}, returning placeholder`);
          return generatePlaceholderImage(mediaFile, 'IMAGE_NOT_FOUND');
        }
      }

      // For videos, return the video file directly for preview
      if (mediaFile.type === 'VIDEO') {
        try {
          const { getMinioClient, getBucketName } = await import('@/lib/minio');
          const fileStream = await getMinioClient().getObject(getBucketName(), mediaFile.objectName);
          
          // Convert stream to buffer
          const chunks: Buffer[] = [];
          for await (const chunk of fileStream) {
            chunks.push(chunk);
          }
          const fileBuffer = Buffer.concat(chunks);

          // Set appropriate headers
          const headers = new Headers();
          headers.set('Content-Type', mediaFile.mimeType);
          headers.set('Content-Length', fileBuffer.length.toString());
          
          // Add CORS headers for mobile compatibility
          headers.set('Access-Control-Allow-Origin', '*');
          headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          
          // Mobile-friendly headers
          headers.set('X-Content-Type-Options', 'nosniff');
          headers.set('Accept-Ranges', 'bytes');
          headers.set('Vary', 'Accept, User-Agent');
          
          headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
          headers.set('ETag', `"${mediaFile.objectName}-admin-video"`);

          return new NextResponse(fileBuffer, {
            status: 200,
            headers
          });
        } catch (fileError) {
          console.warn(`Video file not found in storage: ${mediaFile.objectName}, returning placeholder`);
          return generatePlaceholderImage(mediaFile, 'VIDEO_NOT_FOUND');
        }
      }

      // For non-images, return a placeholder
      return generatePlaceholderImage(mediaFile, 'UNSUPPORTED_TYPE');

    } catch (minioError) {
      console.error('Error getting file from MinIO:', minioError);
      return generatePlaceholderImage(mediaFile, 'STORAGE_ERROR');
    }

  } catch (error) {
    console.error('Error serving admin media preview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generatePlaceholderImage(mediaFile: any, errorType: string): NextResponse {
  const getMessage = (type: string) => {
    switch (type) {
      case 'IMAGE_NOT_FOUND':
        return 'Image Not Found';
      case 'VIDEO_NOT_FOUND':
        return 'Video Not Found';
      case 'STORAGE_ERROR':
        return 'Storage Error';
      case 'UNSUPPORTED_TYPE':
        return 'Preview Unavailable';
      default:
        return 'File Error';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'IMAGE_NOT_FOUND':
        return '#ef4444'; // red
      case 'VIDEO_NOT_FOUND':
        return '#f97316'; // orange
      case 'STORAGE_ERROR':
        return '#dc2626'; // dark red
      case 'UNSUPPORTED_TYPE':
        return '#6b7280'; // gray
      default:
        return '#6b7280';
    }
  };

  const placeholderSvg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f9fafb" stroke="#e5e7eb" stroke-width="2"/>
      <g transform="translate(100, 80)">
        ${getFileIconSvg(mediaFile.type, getColor(errorType))}
      </g>
      <text x="100" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="${getColor(errorType)}" font-weight="bold">
        ${getMessage(errorType)}
      </text>
      <text x="100" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">
        ${mediaFile.name || 'Unknown file'}
      </text>
      <text x="100" y="170" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#d1d5db">
        ID: ${mediaFile.id.substring(0, 8)}...
      </text>
    </svg>
  `;

  const headers = new Headers();
  headers.set('Content-Type', 'image/svg+xml');
  
  // Add CORS headers for mobile compatibility
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Mobile-friendly headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Vary', 'Accept, User-Agent');
  
  headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  headers.set('X-Error-Type', errorType);

  return new NextResponse(placeholderSvg, {
    status: 200,
    headers
  });
}

function getFileIconSvg(type: string, color: string = '#6b7280'): string {
  const iconColor = color;
  
  switch (type) {
    case 'IMAGE':
      return `
        <rect x="-25" y="-20" width="50" height="40" rx="4" fill="none" stroke="${iconColor}" stroke-width="2"/>
        <circle cx="-10" cy="-8" r="4" fill="${iconColor}"/>
        <polygon points="-25,15 -10,0 5,10 20,0 25,15 25,20 -25,20" fill="none" stroke="${iconColor}" stroke-width="2"/>
        <path d="M-15,-5 L15,15" stroke="${iconColor}" stroke-width="2" stroke-linecap="round"/>
        <path d="M15,-5 L-15,15" stroke="${iconColor}" stroke-width="2" stroke-linecap="round"/>
      `;
    case 'VIDEO':
      return `
        <rect x="-30" y="-20" width="60" height="40" rx="4" fill="none" stroke="${iconColor}" stroke-width="2"/>
        <polygon points="-10,-8 -10,8 10,0" fill="${iconColor}"/>
        <path d="M-20,-10 L20,10" stroke="${iconColor}" stroke-width="2" stroke-linecap="round"/>
        <path d="M20,-10 L-20,10" stroke="${iconColor}" stroke-width="2" stroke-linecap="round"/>
      `;
    case 'AUDIO':
      return `
        <path d="M-10,-20 L-10,5 Q-10,15 0,15 Q10,15 10,5 L10,-10 L20,-5 L20,10 Q20,20 30,20 Q40,20 40,10 Q40,0 30,0 Q20,0 20,10 L20,-5 L10,-10 L10,5 Q10,10 0,10 Q-10,10 -10,5 Z" fill="${iconColor}"/>
      `;
    case 'DOCUMENT':
      return `
        <rect x="-20" y="-25" width="30" height="40" rx="2" fill="none" stroke="${iconColor}" stroke-width="2"/>
        <path d="M10,-25 L10,-10 L25,-10" fill="none" stroke="${iconColor}" stroke-width="2"/>
        <line x1="-15" y1="-10" x2="15" y2="-10" stroke="${iconColor}" stroke-width="1"/>
        <line x1="-15" y1="-5" x2="15" y2="-5" stroke="${iconColor}" stroke-width="1"/>
        <line x1="-15" y1="0" x2="15" y2="0" stroke="${iconColor}" stroke-width="1"/>
        <line x1="-15" y1="5" x2="10" y2="5" stroke="${iconColor}" stroke-width="1"/>
      `;
    default:
      return `
        <rect x="-20" y="-25" width="40" height="50" rx="4" fill="none" stroke="${iconColor}" stroke-width="2"/>
        <circle cx="0" cy="0" r="8" fill="${iconColor}"/>
        <path d="M-10,-10 L10,10" stroke="${iconColor}" stroke-width="2" stroke-linecap="round"/>
        <path d="M10,-10 L-10,10" stroke="${iconColor}" stroke-width="2" stroke-linecap="round"/>
      `;
  }
}