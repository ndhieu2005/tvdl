'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileText, 
  Image, 
  // Video, // Removed - not used anymore
  Tags, 
  Folder, 
  BarChart3, 
  Settings,
  Users,
  MessageSquare,
  BookOpen,
  CreditCard,
  Calendar,
  CalendarDays,
  Book
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  external?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Tổng quan', href: '/admin', icon: BarChart3 },
  { name: 'Bài viết', href: '/admin/posts', icon: FileText },
  { name: 'Sách', href: '/admin/books', icon: Book },
  { name: 'Danh mục', href: '/admin/categories', icon: Folder },
  { name: 'Tags', href: '/admin/tags', icon: Tags },
  { name: 'Media', href: '/admin/media', icon: Image },
  // { name: 'Videos', href: '/admin/videos', icon: Video }, // Hidden temporarily
  { name: 'Sự kiện', href: '/admin/events', icon: CalendarDays },
  { name: 'Đăng ký làm thẻ', href: '/admin/card-registrations', icon: CreditCard },
  { name: 'Đặt phòng', href: '/admin/room-bookings', icon: Calendar },
  { name: 'Bình luận', href: '/admin/comments', icon: MessageSquare },
  { name: 'Người dùng', href: '/admin/users', icon: Users },
  { name: 'API Docs', href: '/api-docs', icon: BookOpen, external: true },
  { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
  onLinkClick?: () => void;
}

export default function AdminSidebar({ onLinkClick }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-full bg-white shadow-sm h-screen sticky top-0">
      <div className="p-6 pr-16 lg:pr-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">VP</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Thư viện CMS</span>
        </Link>
      </div>
      
      <nav className="px-6 pb-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  onClick={onLinkClick}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-purple-700' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                  {item.external && <span className="text-xs text-gray-400">↗</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}