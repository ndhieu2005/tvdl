// Session management utilities

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('viralpeek_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('viralpeek_session_id', sessionId);
  }
  return sessionId;
}

export function clearSessionId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('viralpeek_session_id');
}

// Get session ID for server-side API calls
export function getSessionIdFromCookie(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies['viralpeek_session_id'] || null;
}

// Set session ID cookie
export function setSessionIdCookie(sessionId: string): string {
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  return `viralpeek_session_id=${sessionId}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}