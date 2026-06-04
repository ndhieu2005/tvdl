'use client';

import React from 'react'; 
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PostEditor from '@/components/admin/PostEditor';

export default function NewPostPage() {
  const router = useRouter();

  const handlePostCreated = (postId: string) => {
    // Redirect to edit page after post is created
    router.push(`/admin/posts/${postId}/edit`);
  };

  return (
    <div className="space-y-6">
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
            Tạo bài viết mới
          </h1>
        </div>
      </div>

      {/* PostEditor handles all the save/publish logic internally */}
      <PostEditor onPostCreated={handlePostCreated} />
    </div>
  );
}