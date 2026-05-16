import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { api } from '../../lib/api';

function BookCard({ book }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[3/4] bg-cream flex items-center justify-center">
        {book.cover_url
          ? <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
          : <div className="text-blue/30 text-4xl font-bold">📚</div>
        }
      </div>
      <div className="p-3">
        <p className="font-semibold text-blue text-sm leading-tight line-clamp-2">{book.title}</p>
        {book.author && <p className="text-muted text-xs mt-1">{book.author}</p>}
        <p className="text-xs text-yellow font-medium mt-1">{book.category?.name}</p>
      </div>
    </div>
  );
}

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [ageGroups, setAgeGroups] = useState([]);
  const [selectedAge, setSelectedAge] = useState('');

  useEffect(() => {
    api.get('/age-groups').then((r) => setAgeGroups(r.data.data || []));
  }, []);

  const fetchBooks = useCallback((reset = false) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 20 });
    if (search) params.set('search', search);
    if (selectedAge) params.set('age_group_id', selectedAge);
    if (!reset && cursor) params.set('cursor', cursor);

    api.get(`/books?${params}`)
      .then((r) => {
        const { data, meta } = r.data;
        setBooks((prev) => reset ? data : [...prev, ...data]);
        setCursor(meta?.nextCursor || null);
        setHasMore(!!meta?.nextCursor);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, selectedAge, cursor]);

  useEffect(() => {
    setCursor(null);
    setBooks([]);
    setHasMore(true);
    fetchBooks(true);
  }, [search, selectedAge]);

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchInput);
  }

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto">
      <h1 className="text-page font-bold text-blue mb-8">Tra cứu sách</h1>

      {/* Search & filter */}
      <div className="flex gap-3 mb-8">
        <form onSubmit={handleSearch} className="flex flex-1 border-2 border-blue rounded-lg overflow-hidden">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên sách, tác giả..."
            className="flex-1 px-4 py-2.5 text-sm text-blue placeholder-muted outline-none"
          />
          <button type="submit" className="px-4 bg-blue text-white hover:bg-blue-light transition-colors">
            <Search size={18} />
          </button>
        </form>
        <select
          value={selectedAge}
          onChange={(e) => setSelectedAge(e.target.value)}
          className="border-2 border-blue rounded-lg px-3 py-2 text-sm text-blue outline-none bg-white"
        >
          <option value="">Tất cả lứa tuổi</option>
          {ageGroups.map((ag) => (
            <option key={ag.id} value={ag.id}>{ag.name}</option>
          ))}
        </select>
      </div>

      {/* Book grid */}
      {books.length === 0 && !loading && (
        <p className="text-center text-muted py-16 italic">Không tìm thấy sách nào</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {books.map((b) => <BookCard key={b.id} book={b} />)}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => fetchBooks(false)}
            disabled={loading}
            className="border-2 border-blue text-blue px-8 py-2.5 font-semibold text-sm tracking-wide hover:bg-blue hover:text-white transition-colors rounded-lg disabled:opacity-50"
          >
            {loading ? 'Đang tải...' : '→ Xem thêm'}
          </button>
        </div>
      )}
    </div>
  );
}
