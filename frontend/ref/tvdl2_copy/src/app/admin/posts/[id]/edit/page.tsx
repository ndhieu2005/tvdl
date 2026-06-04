'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PostEditor from '@/components/admin/PostEditor';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [postId, setPostId] = useState<string>('');

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setPostId(resolved.id);
    };
    resolveParams();
  }, [params]);

  const handleSave = () => {
    router.push('/admin/posts');
  };

  const handleCancel = () => {
    router.push('/admin/posts');
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
            Chỉnh sửa bài viết
          </h1>
        </div>
      </div>

      {/* Post Editor */}
      {postId && (
        <PostEditor 
          postId={postId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}