import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';

function SearchIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}

function ShortArrowRightIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12.69 8.88" fill="currentColor" className={className}>
      <path d="m12.69,4.48c0-.1-.02-.21-.12-.3-.17-.17-.33-.34-.5-.5-1.17-1.19-2.33-2.37-3.5-3.56-.37-.38-.95.2-.58.58.17.17.33.34.5.5.94.95,1.87,1.9,2.81,2.85H.4c-.53,0-.53.82,0,.82h10.88c-1.11,1.1-2.23,2.2-3.35,3.3-.38.37.2.95.58.58.17-.17.34-.34.51-.51,1.18-1.17,2.36-2.33,3.54-3.49.07-.07.11-.16.11-.25,0-.01,0-.02,0-.03Z"/>
    </svg>
  );
}

function BookCard({ book }) {
  return (
    <div className="border border-[#424241] overflow-hidden">
      <div className="aspect-[3/4] bg-[#F9F3E1] flex items-center justify-center">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-blue/20 text-4xl font-bold">TV</div>
        )}
      </div>
      <div className="p-3 border-t border-[#424241]">
        <p className="font-semibold text-blue text-sm leading-tight line-clamp-2">{book.title}</p>
        {book.author && <p className="text-[#9CA3AF] text-xs mt-1">{book.author}</p>}
        {book.category?.name && (
          <p className="text-xs text-yellow font-medium mt-1">{book.category.name}</p>
        )}
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

  const fetchBooks = useCallback(
    (reset = false) => {
      setLoading(true);
      const params = new URLSearchParams({ limit: 20 });
      if (search) params.set('search', search);
      if (selectedAge) params.set('age_group_id', selectedAge);
      if (!reset && cursor) params.set('cursor', cursor);

      api.get(`/books?${params}`)
        .then((r) => {
          const { data, meta } = r.data;
          setBooks((prev) => (reset ? data : [...prev, ...data]));
          setCursor(meta?.nextCursor || null);
          setHasMore(!!meta?.nextCursor);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    },
    [search, selectedAge, cursor]
  );

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
    <div className="min-h-[calc(100vh-64px)] py-5 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-5xl font-semibold text-blue mb-6 sm:mb-12">
          Tra cứu tài liệu
        </h1>

        {/* Search & filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <form onSubmit={handleSearch} className="flex flex-1 border border-[#424241] overflow-hidden">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên sách, tác giả..."
              className="flex-1 px-4 py-2.5 text-sm text-[#2B2B2B] placeholder-[#9CA3AF] outline-none"
            />
            <button
              type="submit"
              className="px-4 bg-blue text-white hover:bg-blue-light transition-colors"
            >
              <SearchIcon className="h-4 w-4" />
            </button>
          </form>
          <select
            value={selectedAge}
            onChange={(e) => setSelectedAge(e.target.value)}
            className="border border-[#424241] px-3 py-2 text-sm text-[#2B2B2B] outline-none bg-white"
          >
            <option value="">Tất cả lứa tuổi</option>
            {ageGroups.map((ag) => (
              <option key={ag.id} value={ag.id}>{ag.name}</option>
            ))}
          </select>
        </div>

        {/* Book grid */}
        {books.length === 0 && !loading && (
          <p className="text-center text-[#9CA3AF] py-16 italic">Không tìm thấy sách nào</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {books.map((b) => <BookCard key={b.id} book={b} />)}
        </div>

        {loading && (
          <p className="text-center text-[#9CA3AF] text-sm py-6">Đang tải...</p>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={() => fetchBooks(false)}
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
