// Client-side JWT utilities (works in browser)

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Decode JWT token without verification (client-side)
export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  
  return Date.now() >= payload.exp * 1000;
}

// Verify token via API call
export async function verifyToken(token: string): Promise<{ valid: boolean; user?: any; error?: string }> {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { valid: false, error: error.error };
    }
    
    const data = await response.json();
    return { valid: true, user: data.user };
  } catch (error) {
    return { valid: false, error: 'Network error' };
  }
}

// Get token from localStorage
export function getTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
}

// Set token to localStorage
export function setTokenToStorage(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('adminToken', token);
}

// Remove token from localStorage
export function removeTokenFromStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('adminToken');
}

// Get user info from token (client-side decode)
export function getUserFromToken(token: string): JWTPayload | null {
  return decodeToken(token);
}