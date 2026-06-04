'use client';

import { useEffect, useRef } from 'react';

interface RecaptchaV3Props {
  onToken: (token: string) => void;
  onError?: (error: any) => void;
  action?: string;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export const RecaptchaV3: React.FC<RecaptchaV3Props> = ({ 
  onToken, 
  onError, 
  action = 'submit' 
}) => {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!siteKey || loadedRef.current) return;

    const loadRecaptcha = () => {
      // Check if reCAPTCHA is already loaded
      if (window.grecaptcha && window.grecaptcha.ready) {
        loadedRef.current = true;
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        loadedRef.current = true;
        console.log('✅ reCAPTCHA v3 loaded successfully');
      };
      
      script.onerror = (error) => {
        console.error('❌ Failed to load reCAPTCHA v3:', error);
        onError?.(error);
      };

      document.head.appendChild(script);
    };

    loadRecaptcha();

    return () => {
      // Cleanup if needed
      loadedRef.current = false;
    };
  }, [siteKey, onError]);

  const executeRecaptcha = async (): Promise<string | null> => {
    if (!siteKey) {
      console.warn('❌ reCAPTCHA site key not configured');
      return null;
    }

    if (!window.grecaptcha || !window.grecaptcha.ready) {
      console.warn('❌ reCAPTCHA not ready');
      return null;
    }

    try {
      return new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(siteKey, { action })
            .then((token: string) => {
              console.log('✅ reCAPTCHA v3 token generated for action:', action);
              resolve(token);
            })
            .catch((error: any) => {
              console.error('❌ reCAPTCHA v3 execution failed:', error);
              reject(error);
            });
        });
      });
    } catch (error) {
      console.error('❌ reCAPTCHA v3 error:', error);
      onError?.(error);
      return null;
    }
  };

  // Expose executeRecaptcha method
  useEffect(() => {
    (window as any).executeRecaptcha = executeRecaptcha;
  }, []);

  return null; // reCAPTCHA v3 is invisible
};

// Hook for using reCAPTCHA v3
export const useRecaptchaV3 = () => {
  const executeRecaptcha = async (action: string = 'submit'): Promise<string | null> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    console.log('reCAPTCHA v3 - siteKey', siteKey);
    if (!siteKey) {
      console.warn('❌ reCAPTCHA site key not configured');
      return null;
    }

    if (!window.grecaptcha || !window.grecaptcha.ready) {
      console.warn('❌ reCAPTCHA not ready');
      return null;
    }

    try {
      return new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(siteKey, { action })
            .then((token: string) => {
              console.log('✅ reCAPTCHA v3 token generated for action:', action);
              resolve(token);
            })
            .catch((error: any) => {
              console.error('❌ reCAPTCHA v3 execution failed:', error);
              reject(error);
            });
        });
      });
    } catch (error) {
      console.error('❌ reCAPTCHA v3 error:', error);
      return null;
    }
  };

  return { executeRecaptcha };
};