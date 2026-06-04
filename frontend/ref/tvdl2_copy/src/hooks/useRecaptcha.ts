'use client';

export const useRecaptcha = () => {
  const isRecaptchaEnabled = () => {
    return process.env.NODE_ENV === 'production' && 
           process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && 
           process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY.trim() !== '';
  };

  const isRecaptchaRequired = (recaptchaToken: string | null) => {
    return isRecaptchaEnabled() && !recaptchaToken;
  };

  return {
    isRecaptchaEnabled,
    isRecaptchaRequired
  };
};