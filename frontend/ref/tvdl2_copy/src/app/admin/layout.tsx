'use client';

import React, { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import FixTokenButton from '@/components/admin/FixTokenButton';
import { X } from 'lucide-react';

// Note: metadata export should be in a separate file for client components
// export const metadata: Metadata = {
//   title: 'ViralPeek Admin - Quản trị nội dung',
//   description: 'Trang quản trị nội dung website ViralPeek',
//   robots: 'noindex, nofollow',
// };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Check if current path is a public admin route (no auth required)
  const isPublicAdminRoute = pathname === '/admin/login' || pathname === '/admin/unauthorized';

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // For public routes, render without auth guard and admin layout
  if (isPublicAdminRoute) {
    return <>{children}</>;
  }

  // For protected routes, render with auth guard and full admin layout
  return (
    <AdminAuthGuard requiredRole="EDITOR">
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <AdminHeader onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        
        {/* Layout Container */}
        <div className="flex relative">
          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          
          {/* Sidebar - Mobile: overlay, Desktop: fixed */}
          <aside className={`
            fixed top-0 bottom-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out 
            lg:relative lg:translate-x-0 lg:z-0 lg:shadow-none lg:top-0
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            lg:block lg:w-64 lg:flex-shrink-0
          `}>
            {/* Mobile Close Button */}
            <div className="lg:hidden absolute top-4 right-4 z-10">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <AdminSidebar onLinkClick={() => setMobileMenuOpen(false)} />
          </aside>
          
          {/* Main Content - Full width on mobile, remaining width on desktop */}
          <main className="flex-1 w-full lg:w-auto min-w-0">
            <div className="p-4 lg:p-6">
              <FixTokenButton />
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}