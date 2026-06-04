'use client';

import React, { forwardRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface SafeRecaptchaProps {
  onChange?: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
}

const SafeRecaptcha = forwardRef<ReCAPTCHA, SafeRecaptchaProps>(
  ({ onChange, onExpired, onError }, ref) => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    console.log('🔑 SafeRecaptcha - NODE_ENV:', process.env.NODE_ENV);
    console.log('🔑 SafeRecaptcha - Site Key:', siteKey ? `${siteKey.substring(0, 10)}...` : 'NOT SET');
    
    // Only render if we have a valid site key
    if (!siteKey || siteKey.trim() === '') {
      console.warn('❌ reCAPTCHA site key not configured');
      return (
        <div className="text-red-500 text-sm p-2 border border-red-300 rounded">
          ⚠️ reCAPTCHA không được cấu hình (thiếu NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
        </div>
      );
    }

    console.log('✅ Rendering reCAPTCHA component');
    return (
      <ReCAPTCHA
        ref={ref}
        sitekey={siteKey}
        onChange={(token) => {
          console.log('🔄 reCAPTCHA onChange:', token ? 'Token received' : 'Token cleared');
          onChange?.(token);
        }}
        onExpired={() => {
          console.log('⏰ reCAPTCHA expired');
          onExpired?.();
        }}
        onError={(error) => {
          console.error('❌ reCAPTCHA error:', error);
          onError?.();
        }}
      />
    );
  }
);

SafeRecaptcha.displayName = 'SafeRecaptcha';

export default SafeRecaptcha;