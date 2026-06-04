'use client';

import React, { useState } from 'react';
import { MobileUserMenuTest } from '@/components/MobileUserMenuTest';

// Mock user data for testing
const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'ADMIN' as const,
  avatar: null,
  status: 'ACTIVE' as const,
  location: null,
  bio: null,
  emailVerified: true,
  joinDate: new Date(),
  lastLogin: new Date(),
  posts: 0,
  likes: 0,
  comments: 0,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock AuthContext
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user] = useState(mockUser);
  
  const authValue = {
    user,
    loading: false,
    login: async () => ({ success: true }),
    logout: () => {
      console.log('Logout clicked');
    },
    register: async () => ({ success: true }),
    updateProfile: async () => ({ success: true }),
    refreshUser: async () => {}
  };

  return (
    <div>
      {React.cloneElement(children as React.ReactElement, { 
        ...authValue 
      })}
    </div>
  );
};

export default function TestMobilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-100 p-4 text-center">
        <h1 className="text-xl font-bold">Test Mobile User Menu</h1>
        <p className="text-sm text-gray-600">Trang này để test mobile user menu</p>
      </div>
      
      {/* Simulate header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-purple-600">Test Header</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search button */}
              <button className="text-gray-700 hover:text-purple-600 p-2 rounded-md">
                🔍
              </button>
              
              {/* Mobile User Menu */}
              <div className="md:hidden">
                <MobileUserMenuTest />
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="text-gray-700 hover:text-purple-600 p-2 rounded-md">
                  ☰
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Test Instructions</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <ol className="list-decimal list-inside space-y-2">
              <li>Mở Developer Tools (F12)</li>
              <li>Chuyển sang chế độ mobile (Ctrl+Shift+M)</li>
              <li>Click vào avatar ở header</li>
              <li>Kiểm tra xem menu có hiển thị không</li>
              <li>Test các menu items</li>
            </ol>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded">
              <h3 className="font-semibold">Expected Behavior:</h3>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Avatar hiển thị với initials "TU"</li>
                <li>Click vào avatar sẽ mở dropdown menu</li>
                <li>Menu hiển thị thông tin user</li>
                <li>Có các menu items: Profile, Settings, Admin, Create Post, Logout</li>
                <li>Click outside để đóng menu</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}