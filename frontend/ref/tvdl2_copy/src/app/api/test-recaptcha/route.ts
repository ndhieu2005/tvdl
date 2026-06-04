import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'NOT SET',
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET'
  });
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!process.env.RECAPTCHA_SECRET_KEY) {
      return NextResponse.json({
        success: false,
        error: 'RECAPTCHA_SECRET_KEY not configured'
      });
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      recaptchaResult: data
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to verify reCAPTCHA'
    });
  }
}