'use client';

import React from 'react';
import PostEditorSimple from '@/components/admin/PostEditorSimple';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPostTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/admin/posts" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Quay lại
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Tạo bài viết mới (Test)
            </h1>
          </div>
        </div>

        {/* Simple PostEditor without auth */}
        <PostEditorSimple />
      </div>
    </div>
  );
}