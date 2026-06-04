'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinDate?: string;
  lastLogin?: string;
  createdAt?: string;
  posts?: number;
}

interface LoginResult {
  success?: boolean;
  needsPasswordReset?: boolean;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, recaptchaToken?: string | null) => Promise<LoginResult>;
  register: (name: string, email: string, password: string, recaptchaToken?: string | null) => Promise<{ success: boolean }>;
  logout: () => void;
  updateProfile?: (data: Partial<User>) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify token is still valid (but don't await to avoid blocking)
        fetchUserInfo(savedToken);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const fetchUserInfo = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        // Token is invalid, clear auth state
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      // Clear auth state but don't trigger logout to avoid infinite loop
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const login = async (email: string, password: string, recaptchaToken?: string | null): Promise<LoginResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          recaptchaToken: recaptchaToken || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Set cookie for server-side authentication
        document.cookie = `token=${data.token}; path=/; max-age=604800; secure; samesite=lax`;
        
        return { success: true };
      } else {
        // Check if password needs reset
        if (data.needsPasswordReset) {
          return {
            success: false,
            needsPasswordReset: true,
            email: data.email
          };
        }
        
        setError(data.error || 'Đăng nhập thất bại');
        return { success: false };
      }
    } catch (error) {
      setError('Đã xảy ra lỗi khi đăng nhập');
      console.error('Login error:', error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, recaptchaToken?: string | null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          recaptchaToken: recaptchaToken || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Set cookie for server-side authentication
        document.cookie = `token=${data.token}; path=/; max-age=604800; secure; samesite=lax`;
        
        return { success: true };
      } else {
        setError(data.error || 'Đăng ký thất bại');
        return { success: false };
      }
    } catch (error) {
      setError('Đã xảy ra lỗi khi đăng ký');
      console.error('Register error:', error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Call logout API
    fetch('/api/auth/logout', {
      method: 'POST',
    });
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        const updatedUser = { ...user, ...result.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        setError(result.error || 'Cập nhật thông tin thất bại');
      }
    } catch (error) {
      setError('Đã xảy ra lỗi khi cập nhật thông tin');
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    loading,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};