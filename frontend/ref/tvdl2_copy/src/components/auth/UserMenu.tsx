'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Edit 
} from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  const isInAdminArea = pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
  };

  const handleNavigation = (path: string) => {
    // If we're in admin area and navigating to profile/settings, keep in admin area
    if (isInAdminArea) {
      if (path === '/profile') {
        router.push('/admin/profile');
        return;
      }
      if (path === '/settings') {
        router.push('/admin/settings');
        return;
      }
    }
    router.push(path);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full touch-manipulation"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 z-[9999]" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Hồ sơ</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Cài đặt</span>
        </DropdownMenuItem>
        {(user.role === 'ADMIN' || user.role === 'EDITOR') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNavigation('/admin')}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Quản trị</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigation('/admin/posts/new')}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Tạo bài viết</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};