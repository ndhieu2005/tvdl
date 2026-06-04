import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the file URL from query parameters
  const fileUrl = request.nextUrl.searchParams.get('url');
  
  if (!fileUrl) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }
  
  try {
    // Fetch the file and check headers
    const response = await fetch(fileUrl);
    
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    return NextResponse.json({
      url: fileUrl,
      status: response.status,
      statusText: response.statusText,
      headers: headers,
      analysis: {
        contentType: response.headers.get('content-type'),
        contentDisposition: response.headers.get('content-disposition'),
        cacheControl: response.headers.get('cache-control'),
        contentLength: response.headers.get('content-length'),
        isWebP: response.headers.get('content-type')?.includes('image/webp'),
        hasInlineDisposition: response.headers.get('content-disposition')?.includes('inline'),
        hasAttachmentDisposition: response.headers.get('content-disposition')?.includes('attachment'),
        recommendation: getRecommendation(response.headers)
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getRecommendation(headers: Headers): string[] {
  const recommendations: string[] = [];
  
  const contentType = headers.get('content-type');
  const contentDisposition = headers.get('content-disposition');
  
  if (!contentType || contentType === 'application/octet-stream') {
    recommendations.push('❌ Set proper Content-Type header (e.g., image/webp)');
  }
  
  if (contentDisposition?.includes('attachment')) {
    recommendations.push('❌ Remove Content-Disposition: attachment - use inline instead');
  }
  
  if (!contentDisposition?.includes('inline')) {
    recommendations.push('⚠️ Add Content-Disposition: inline to force browser display');
  }
  
  if (!headers.get('x-content-type-options')) {
    recommendations.push('⚠️ Add X-Content-Type-Options: nosniff for security');
  }
  
  if (contentType === 'image/webp') {
    recommendations.push('✅ WebP Content-Type is correct');
  }
  
  if (contentDisposition?.includes('inline')) {
    recommendations.push('✅ Content-Disposition: inline is correct');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ All headers look good!');
  }
  
  return recommendations;
}