/**
 * reCAPTCHA verification utility
 * Handles both development and production environments
 * Supports both v2 and v3 reCAPTCHA with score validation
 */

export async function verifyRecaptcha(token: string, expectedAction?: string, minScore: number = 0.5): Promise<boolean> {
  try {
    // Bypass for development/testing
    if (process.env.NODE_ENV === 'development') {
      if (token === 'dev-bypass' || token === 'test-token-for-development') {
        console.log('🧪 [DEV] Bypassing reCAPTCHA verification for development');
        return true;
      }
    }

    // Production verification
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error('❌ RECAPTCHA_SECRET_KEY not found in environment variables');
      return false;
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 reCAPTCHA verification result:', data);
    }
    
    // Basic success check
    if (!data.success) {
      console.error('❌ reCAPTCHA verification failed:', data['error-codes']);
      return false;
    }

    // For reCAPTCHA v3, check score and action
    if (data.score !== undefined) {
      console.log(`✅ reCAPTCHA v3 score: ${data.score}, action: ${data.action}`);
      
      // Check minimum score
      if (data.score < minScore) {
        console.warn(`⚠️ reCAPTCHA score ${data.score} is below minimum ${minScore}`);
        return false;
      }
      
      // Check action if provided
      if (expectedAction && data.action !== expectedAction) {
        console.warn(`⚠️ reCAPTCHA action mismatch. Expected: ${expectedAction}, Got: ${data.action}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ reCAPTCHA verification error:', error);
    return false;
  }
}

/**
 * Check if reCAPTCHA is required based on environment
 */
export function isRecaptchaRequired(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Get reCAPTCHA site key for client-side
 */
export function getRecaptchaSiteKey(): string {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
}