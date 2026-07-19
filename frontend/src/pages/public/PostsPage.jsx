import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

function ShortArrowRightIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12.69 8.88" fill="currentColor" className={className}>
      <path d="m12.69,4.48c0-.1-.02-.21-.12-.3-.17-.17-.33-.34-.5-.5-1.17-1.19-2.33-2.37-3.5-3.56-.37-.38-.95.2-.58.58.17.17.33.34.5.5.94.95,1.87,1.9,2.81,2.85H.4c-.53,0-.53.82,0,.82h10.88c-1.11,1.1-2.23,2.2-3.35,3.3-.38.37.2.95.58.58.17-.17.34-.34.51-.51,1.18-1.17,2.36-2.33,3.54-3.49.07-.07.11-.16.11-.25,0-.01,0-.02,0-.03Z"/>
    </svg>
  );
}

function PostCard({ post }) {
  return (
    <Link
      to={`/news/${post.slug}`}
      className="group flex flex-col border border-[#424241] overflow-hidden hover:bg-[#F9F3E1] transition-colors"
    >
      <div className="aspect-[16/9] bg-[#F9F3E1] overflow-hidden flex items-center justify-center border-b border-[#424241]">
        {post.cover_image ? (
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-blue/20 text-3xl font-bold">TV</span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs text-[#9CA3AF] mb-1">
          {new Date(post.created_at).toLocaleDateString('vi-VN')}
        </p>
        <h3 className="font-bold text-blue leading-snug line-clamp-2 group-hover:underline">
          {post.title}
        </h3>
        {post.summary && (
          <p className="text-xs text-[#3F3F3F] mt-2 line-clamp-3 leading-relaxed font-light">
            {post.summary}
          </p>
        )}
        <span className="flex items-center gap-2 text-xs font-semibold text-blue mt-auto pt-3 tracking-wide uppercase">
          Đọc tiếp <ShortArrowRightIcon className="h-1.5 w-auto" />
        </span>
      </div>
    </Link>
  );
}

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchMore = useCallback(
    (reset = false) => {
      setLoading(true);
      const params = new URLSearchParams({ limit: 12 });
      if (!reset && cursor) params.set('cursor', cursor);

      api.get(`/posts?${params}`)
        .then((r) => {
          const { data, meta } = r.data;
          setPosts((prev) => (reset ? data : [...prev, ...data]));
          setCursor(meta?.nextCursor || null);
          setHasMore(!!meta?.nextCursor);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    },
    [cursor]
  );

  // chỉ fetch trang đầu khi mount; fetchMore đổi theo cursor nên không đưa vào deps
  useEffect(() => { fetchMore(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  return (
    <div className="min-h-[calc(100vh-64px)] py-5 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-5xl font-semibold text-blue mb-6 sm:mb-12">
          Bài viết
        </h1>

        {posts.length === 0 && !loading && (
          <p className="text-center text-[#9CA3AF] py-16 italic">Chưa có bài viết nào</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>

        {loading && (
          <p className="text-center text-[#9CA3AF] text-sm py-6">Đang tải...</p>
        )}

        {hasMore && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={() => fetchMore(false)}
              className="border border-[#424241] text-blue px-8 py-2.5 font-semibold text-sm tracking-wide hover:bg-blue hover:text-white transition-colors flex items-center gap-2 mx-auto"
            >
              <ShortArrowRightIcon className="h-2 w-auto" />
              Xem thêm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
