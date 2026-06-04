'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Edit,
  ChevronDown
} from 'lucide-react';

// Mock user for testing
const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'ADMIN' as const,
  avatar: null
};

export const MobileUserMenuTest: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    console.log('Logout clicked');
    alert('Logout clicked!');
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    console.log('Navigate to:', path);
    alert(`Navigate to: ${path}`);
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleMenu = () => {
    console.log('Toggle menu clicked, current state:', isOpen);
    setIsOpen(prev => !prev);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Debug info */}
      <div className="fixed top-0 right-0 bg-red-600 text-white text-xs p-2 z-[10000] opacity-75">
        Menu: {isOpen ? 'Open' : 'Closed'} | User: {mockUser.name}
      </div>
      
      {/* Avatar Button */}
      <button
        type="button"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        onClick={toggleMenu}
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
        aria-label="User menu"
      >
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
            {mockUser.avatar ? (
              <img 
                src={mockUser.avatar} 
                alt={mockUser.name} 
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              getInitials(mockUser.name)
            )}
          </div>
          <ChevronDown className={`absolute -bottom-1 -right-1 h-3 w-3 text-gray-400 bg-white rounded-full transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-[9998] bg-black bg-opacity-20"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] max-h-[80vh] overflow-y-auto">
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {mockUser.avatar ? (
                    <img 
                      src={mockUser.avatar} 
                      alt={mockUser.name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    getInitials(mockUser.name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{mockUser.name}</p>
                  <p className="text-xs text-gray-500 truncate">{mockUser.email}</p>
                  <p className="text-xs text-purple-600 font-medium">{mockUser.role}</p>
                </div>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => handleNavigation('/profile')}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <User className="h-4 w-4 mr-3 text-gray-400" />
                Hồ sơ cá nhân
              </button>
              
              <button
                onClick={() => handleNavigation('/settings')}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Settings className="h-4 w-4 mr-3 text-gray-400" />
                Cài đặt
              </button>
              
              {/* Admin Menu Items */}
              {(mockUser.role === 'ADMIN' || mockUser.role === 'EDITOR') && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <button
                    onClick={() => handleNavigation('/admin')}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Shield className="h-4 w-4 mr-3 text-purple-500" />
                    Quản trị hệ thống
                  </button>
                  
                  <button
                    onClick={() => handleNavigation('/admin/posts/new')}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Edit className="h-4 w-4 mr-3 text-purple-500" />
                    Tạo bài viết mới
                  </button>
                </>
              )}
            </div>
            
            {/* Logout */}
            <div className="border-t border-gray-100 py-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Đăng xuất
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};