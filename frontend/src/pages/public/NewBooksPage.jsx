import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';

function NewBookCard({ book }) {
  return (
    <div className="flex gap-4 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="w-20 h-28 shrink-0 bg-cream rounded-lg overflow-hidden flex items-center justify-center">
        {book.cover_image
          ? <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
          : <span className="text-3xl">📚</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-blue text-sm leading-snug line-clamp-2">{book.title}</p>
        {book.author && <p className="text-muted text-xs mt-1">{book.author}</p>}
        <p className="text-xs text-yellow font-semibold mt-1">{book.category?.name}</p>
        {book.short_description && (
          <p className="text-xs text-dark mt-2 line-clamp-3 leading-relaxed">{book.short_description}</p>
        )}
        <p className="text-xs text-muted mt-2">{book.location?.name}</p>
      </div>
    </div>
  );
}

export default function NewBooksPage() {
  const [books, setBooks] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchMore = useCallback((reset = false) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 12 });
    if (!reset && cursor) params.set('cursor', cursor);

    api.get(`/new-books?${params}`)
      .then((r) => {
        const { data, meta } = r.data;
        setBooks((prev) => reset ? data : [...prev, ...data]);
        setCursor(meta?.nextCursor || null);
        setHasMore(!!meta?.nextCursor);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cursor]);

  useEffect(() => { fetchMore(true); }, []);

  return (
    <div className="px-8 py-10 max-w-4xl mx-auto">
      <h1 className="text-page font-bold text-blue mb-8">Sách mới</h1>

      {books.length === 0 && !loading && (
        <p className="text-center text-muted py-16 italic">Chưa có sách mới nào</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.map((b) => <NewBookCard key={b.id} book={b} />)}
      </div>

      {loading && <p className="text-center text-muted text-sm py-6">Đang tải...</p>}

      {hasMore && !loading && (
        <div className="text-center mt-8">
          <button
            onClick={() => fetchMore(false)}
            className="border-2 border-blue text-blue px-8 py-2.5 font-semibold text-sm tracking-wide hover:bg-blue hover:text-white transition-colors rounded-lg"
          >
            → Xem thêm
          </button>
        </div>
      )}
    </div>
  );
}
