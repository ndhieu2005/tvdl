// Environment debugging utilities

export function logEnvironmentVariables() {
  if (typeof window !== 'undefined') {
    console.log('=== CLIENT-SIDE ENVIRONMENT DEBUG ===');
    console.log('NEXT_PUBLIC_ENVIRONMENT:', process.env.NEXT_PUBLIC_ENVIRONMENT);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('window.location.host:', window.location.host);
    console.log('window.location.protocol:', window.location.protocol);
    console.log('=====================================');
  }
}

export function shouldShowReadingHistory(): boolean {
  // Primary check: environment variable
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT;
  
  // Fallback check: hostname-based detection for runtime
  let isProduction = false;
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isProductionHost = hostname === 'thuvienduonglieu.com' || 
                           hostname.includes('thuvienduonglieu') ||
                           hostname.includes('production') ||
                           (!hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !hostname.includes('192.168'));
    isProduction = env === 'production' || isProductionHost;
  } else {
    isProduction = env === 'production';
  }
  
  const shouldShow = !isProduction;
  
  if (typeof window !== 'undefined') {
    console.log('Reading History Check:', {
      NEXT_PUBLIC_ENVIRONMENT: env,
      hostname: window.location.hostname,
      isProduction,
      shouldShow,
      reasoning: shouldShow ? 'Not production, should show' : 'Production detected, should hide'
    });
  }
  
  return shouldShow;
}

export function getEnvironmentInfo() {
  return {
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    NODE_ENV: process.env.NODE_ENV,
    isClient: typeof window !== 'undefined',
    host: typeof window !== 'undefined' ? window.location.host : 'N/A',
    protocol: typeof window !== 'undefined' ? window.location.protocol : 'N/A'
  };
}