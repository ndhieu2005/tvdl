import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, User } from 'lucide-react';
import { api } from '../../lib/api';

export default function PostsPage() {
  const [featured, setFeatured] = useState(null);
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);
  const excludeIdRef = useRef(null);

  const fetchMore = useCallback(
    (reset = false) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setLoading(true);
      const params = new URLSearchParams({ limit: 10 });
      if (!reset && cursor) {
        params.set('cursor', cursor);
        if (excludeIdRef.current) params.set('exclude_id', excludeIdRef.current);
      }

      api.get(`/posts?${params}`)
        .then((r) => {
          const { data, meta } = r.data;
          if (reset) {
            setFeatured(meta?.featured || null);
            excludeIdRef.current = meta?.excludeId || (meta?.featured?.id ?? null);
            setPosts(data || []);
          } else {
            setPosts((prev) => [...prev, ...data]);
          }
          setCursor(meta?.nextCursor || null);
          setHasMore(!!meta?.nextCursor);
        })
        .catch(() => {})
        .finally(() => {
          setLoading(false);
          fetchingRef.current = false;
        });
    },
    [cursor]
  );

  // chỉ fetch trang đầu khi mount; fetchMore đổi theo cursor nên không đưa vào deps
  useEffect(() => { fetchMore(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // infinite scroll: sentinel cuối trang lọt vào viewport thì tải tiếp
  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loading) fetchMore(false); },
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchMore, hasMore, loading]);

  const hasAnyPost = !!featured || posts.length > 0;

  return (
    <div className="min-h-[calc(100vh-64px)] px-10 py-5 sm:px-28 sm:py-12">
      {/* Tiêu đề chính */}
      <h1 className="text-3xl sm:text-5xl font-semibold text-blue mb-6 sm:mb-12">
        Tin tức, tin mới đây!
      </h1>

      {/* Dòng phân cách Tin mới nhất */}
      <div className="flex items-center gap-4 mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue shrink-0">
          Tin mới nhất
        </h2>
        <div className="h-[1px] bg-[#9CA3AF]/60 flex-1" />
      </div>

      {!hasAnyPost && !loading && (
        <p className="text-center text-[#9CA3AF] py-16 italic">Chưa có bài viết nào</p>
      )}

      {/* Layout 2 cột: Cột trái (Nổi bật - Cố định khi cuộn), Cột phải (Danh sách các bài còn lại) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Cột trái: Container Bài viết nổi bật (Sticky khi cuộn) */}
        {featured && (
          <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
            <Link
              to={`/news/${featured.slug}`}
              className="group block"
            >
              <div className="w-full aspect-[16/10] bg-[#F5C000] overflow-hidden flex items-center justify-center shadow-xs">
                {featured.cover_image ? (
                  <img
                    src={featured.cover_image}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-[#F5C000] flex items-center justify-center">
                    <span className="text-white/70 font-bold text-3xl tracking-wider">TVDL</span>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="text-blue/80 text-sm font-light mt-0.5 select-none">☆</span>
                  <h3 className="font-bold text-blue text-base sm:text-lg leading-snug group-hover:underline">
                    {featured.title}
                  </h3>
                </div>
                {(featured.author?.name || featured.author?.username) && (
                  <div className="flex items-center gap-2 text-[#E5A823] font-bold text-xs sm:text-sm">
                    <User size={14} className="text-blue/80 shrink-0" strokeWidth={1.75} />
                    <span>{featured.author?.name || featured.author?.username}</span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        )}

        {/* Cột phải: Container Danh sách các bài viết còn lại (Nền xám nhạt có padding) */}
        <div className={`${featured ? 'lg:col-span-7' : 'lg:col-span-12'} bg-[#F4F6FA] p-6 sm:p-8 md:p-10 rounded-xs shadow-2xs`}>
          <div className="flex flex-col divide-y divide-[#D1D5DB]">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/news/${post.slug}`}
                className="group flex flex-col-reverse sm:flex-row gap-6 justify-between items-start py-6 first:pt-0 last:pb-0"
              >
                {/* Phần thông tin text bên trái */}
                <div className="flex-1 min-w-0 pr-0 sm:pr-2">
                  <div className="flex items-start gap-2">
                    <span className="text-blue/80 text-sm font-light mt-0.5 select-none">☆</span>
                    <h3 className="font-bold text-blue text-sm sm:text-base leading-snug group-hover:underline line-clamp-2">
                      {post.title}
                    </h3>
                  </div>
                  {(post.author?.name || post.author?.username) && (
                    <div className="flex items-center gap-2 mt-1 text-[#E5A823] font-bold text-xs sm:text-sm">
                      <User size={13} className="text-blue/80 shrink-0" strokeWidth={1.75} />
                      <span>{post.author?.name || post.author?.username}</span>
                    </div>
                  )}
                  {post.summary && (
                    <p className="text-xs sm:text-[13px] text-[#4B5563] mt-3 line-clamp-3 sm:line-clamp-4 leading-relaxed font-normal">
                      &ldquo;{post.summary}&rdquo;
                    </p>
                  )}
                </div>

                {/* Phần ảnh thumbnail bên phải */}
                <div className="w-full sm:w-48 md:w-56 aspect-[16/10] shrink-0 bg-[#3F3F3F] overflow-hidden flex items-center justify-center shadow-2xs">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#3F3F3F] flex items-center justify-center">
                      <span className="text-white/40 font-semibold text-xs tracking-wider">TVDL</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}

            {loading && (
              <div className="space-y-6 py-6 animate-pulse">
                {[0, 1].map((i) => (
                  <div key={i} className="flex flex-col-reverse sm:flex-row gap-6 justify-between items-start">
                    <div className="flex-1 min-w-0 space-y-2.5">
                      <div className="h-4 bg-gray-300/70 rounded w-4/5" />
                      <div className="h-3 bg-gray-300/70 rounded w-1/4" />
                      <div className="h-3 bg-gray-300/70 rounded w-full" />
                      <div className="h-3 bg-gray-300/70 rounded w-3/4" />
                    </div>
                    <div className="w-full sm:w-48 md:w-56 aspect-[16/10] bg-gray-300/70 rounded" />
                  </div>
                ))}
              </div>
            )}

            {hasMore && <div ref={sentinelRef} className="h-1" />}
          </div>
        </div>
      </div>
    </div>
  );
}
