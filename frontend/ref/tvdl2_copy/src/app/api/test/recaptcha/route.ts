import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptcha, isRecaptchaRequired } from '@/lib/recaptcha';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    const result = {
      environment: process.env.NODE_ENV,
      isRecaptchaRequired: isRecaptchaRequired(),
      token: token,
      verification: await verifyRecaptcha(token)
    };
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    isRecaptchaRequired: isRecaptchaRequired(),
    message: 'reCAPTCHA test endpoint'
  });
}