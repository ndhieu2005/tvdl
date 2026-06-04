'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, LogOut, Eye, Menu, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';


interface AdminHeaderProps {
  onMenuToggle?: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 z-50">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Mobile menu + Search */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo - Mobile */}
            <Link href="/admin" className="lg:hidden flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VP</span>
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">ViralPeek</span>
            </Link>

            {/* Search */}
            <div className="hidden md:block flex-1 max-w-md">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhanh..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* View Site */}
            <Link 
              href="/"
              className="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden md:block">Xem trang web</span>
            </Link>



            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.name || 'Admin'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.email || 'admin@trendiefox.com'}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
              </button>
              
              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name || 'Admin'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.email || 'admin@trendiefox.com'}
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      {user?.role || 'ADMIN'}
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/admin/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Thông tin cá nhân
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Cài đặt
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}