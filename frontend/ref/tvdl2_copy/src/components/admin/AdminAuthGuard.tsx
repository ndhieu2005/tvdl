'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'EDITOR';
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ 
  children, 
  requiredRole = 'ADMIN' 
}) => {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth context to finish loading
      if (loading) return;

      // If no token or user, redirect to login
      if (!token || !user) {
        console.log('No token or user, redirecting to login');
        router.push('/admin/login');
        return;
      }

      // Check if user has required role
      if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
        console.log('User does not have admin role, redirecting to unauthorized');
        router.push('/admin/unauthorized');
        return;
      }

      if (requiredRole === 'EDITOR' && user.role !== 'ADMIN' && user.role !== 'EDITOR') {
        console.log('User does not have editor role, redirecting to unauthorized');
        router.push('/admin/unauthorized');
        return;
      }

      // All checks passed
      console.log('Auth check passed, user has access');
      setIsChecking(false);
    };

    checkAuth();
  }, [loading, token, user, requiredRole, router]);

  // Timeout fallback to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('⚠️ AdminAuthGuard: Timeout reached, forcing check completion');
      setTimeoutReached(true);
      setIsChecking(false);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  // Show loading while checking auth
  if (loading || isChecking) {
    console.log('🔍 AdminAuthGuard: Showing loading screen. loading:', loading, 'isChecking:', isChecking);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
          <p className="text-xs text-gray-500 mt-2">
            Debug: loading={loading.toString()}, isChecking={isChecking.toString()}
          </p>
          {timeoutReached && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-semibold">Timeout reached!</p>
              <p>Auth check took too long. Please try refreshing the page.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Refresh Page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If user is not authenticated or doesn't have required role, 
  // don't render anything (router will handle redirect)
  if (!user || !token) {
    return null;
  }

  if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
    return null;
  }

  if (requiredRole === 'EDITOR' && user.role !== 'ADMIN' && user.role !== 'EDITOR') {
    return null;
  }

  // User is authenticated and has required role
  return <>{children}</>;
};

export default AdminAuthGuard;