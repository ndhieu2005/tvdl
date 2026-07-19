import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../lib/api';

function NewBookCard({ book }) {
  return (
    <div
      className="flex gap-4 pl-4 py-4 transition-all border-l-[6px]"
      style={{ borderLeftColor: '#1B3F8B' }}
    >
      <div className="w-20 h-28 shrink-0 bg-[#F9F3E1] overflow-hidden flex items-center justify-center border border-[#424241]">
        {book.cover_image ? (
          <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-blue/20 text-2xl font-bold">TV</span>
        )}
      </div>
      <div className="flex-1 min-w-0 border-b border-[#e5e5e5] pb-4">
        <p className="font-bold text-blue text-sm leading-snug line-clamp-2">{book.title}</p>
        {book.author && <p className="text-[#9CA3AF] text-xs mt-1">{book.author}</p>}
        {book.category?.name && (
          <p className="text-xs text-yellow font-semibold mt-1">{book.category.name}</p>
        )}
        {book.short_description && (
          <p className="text-xs text-[#3F3F3F] mt-2 line-clamp-3 leading-relaxed font-light">
            {book.short_description}
          </p>
        )}
        {book.location?.name && (
          <p className="text-xs text-[#9CA3AF] mt-2">{book.location.name}</p>
        )}
      </div>
    </div>
  );
}

export default function NewBooksPage() {
  const [books, setBooks] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchMore = useCallback(
    (reset = false) => {
      setLoading(true);
      const params = new URLSearchParams({ limit: 12 });
      if (!reset && cursor) params.set('cursor', cursor);

      api.get(`/new-books?${params}`)
        .then((r) => {
          const { data, meta } = r.data;
          setBooks((prev) => (reset ? data : [...prev, ...data]));
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

  return (
    <div className="min-h-[calc(100vh-64px)] py-5 sm:py-12">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-5xl font-semibold text-blue mb-6 sm:mb-12">
          Sách mới
        </h1>

        {books.length === 0 && !loading && (
          <p className="text-center text-[#9CA3AF] py-16 italic">Chưa có sách mới nào</p>
        )}

        <div className="space-y-0">
          {books.map((b) => <NewBookCard key={b.id} book={b} />)}
        </div>

        {loading && (
          <div className="space-y-0 animate-pulse">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-4 pl-4 py-4 border-l-[6px] border-[#F2EAD3]">
                <div className="w-20 h-28 shrink-0 bg-[#F2EAD3]" />
                <div className="flex-1 pt-1">
                  <div className="h-4 w-2/3 bg-[#F2EAD3] rounded mb-2" />
                  <div className="h-3 w-1/3 bg-[#F2EAD3] rounded mb-3" />
                  <div className="h-3 w-full bg-[#F2EAD3] rounded mb-1.5" />
                  <div className="h-3 w-4/5 bg-[#F2EAD3] rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && <div ref={sentinelRef} className="h-1" />}
      </div>
    </div>
  );
}
