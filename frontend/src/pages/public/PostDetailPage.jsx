import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';

export default function PostDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ok | notfound

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch pattern: reset về loading khi đổi slug
    setStatus('loading');
    api.get(`/posts/${slug}`)
      .then((r) => {
        setPost(r.data.data);
        setStatus('ok');
      })
      .catch(() => setStatus('notfound'));
  }, [slug]);

  if (status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-64px)] py-5 sm:py-12">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-3 w-24 bg-[#F2EAD3] rounded mb-6" />
          <div className="h-8 w-3/4 bg-[#F2EAD3] rounded mb-3" />
          <div className="h-3 w-32 bg-[#F2EAD3] rounded mb-8" />
          <div className="aspect-[16/9] bg-[#F2EAD3] mb-8" />
          <div className="space-y-3">
            <div className="h-3 w-full bg-[#F2EAD3] rounded" />
            <div className="h-3 w-full bg-[#F2EAD3] rounded" />
            <div className="h-3 w-5/6 bg-[#F2EAD3] rounded" />
            <div className="h-3 w-2/3 bg-[#F2EAD3] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-4">
        <p className="text-[#9CA3AF] italic">Không tìm thấy bài viết</p>
        <Link to="/news" className="text-blue font-semibold text-sm underline">← Quay lại danh sách bài viết</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] py-5 sm:py-12">
      <article className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">
        <Link to="/news" className="text-xs font-semibold text-blue uppercase tracking-wide hover:underline">
          ← Bài viết
        </Link>
        <h1 className="text-2xl sm:text-4xl font-semibold text-blue mt-4 mb-2 leading-tight">
          {post.title}
        </h1>
        <p className="text-xs text-[#9CA3AF] mb-6">
          {new Date(post.created_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {post.cover_image && (
          <img src={post.cover_image} alt={post.title} className="w-full max-h-96 object-cover border border-[#424241] mb-6" />
        )}

        {post.summary && (
          <p className="text-sm sm:text-base text-[#3F3F3F] font-medium border-l-[6px] border-yellow pl-4 py-1 mb-6">
            {post.summary}
          </p>
        )}

        {/* content đã được sanitize phía server (sanitize-html) trước khi lưu */}
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </div>
  );
}
