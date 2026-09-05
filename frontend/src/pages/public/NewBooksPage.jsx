import { useState, useEffect } from 'react';
import { Search, ChevronDown, Star, User, BookOpen, ExternalLink, X } from 'lucide-react';
import { api } from '../../lib/api';

function FeaturedBookCard({ book }) {
  if (!book) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 items-start h-full">
      {/* Ảnh bìa sách lớn */}
      <a
        href={book.skoolib_url || '#'}
        target={book.skoolib_url ? '_blank' : undefined}
        rel="noopener noreferrer"
        className="w-full sm:w-56 lg:w-64 shrink-0 aspect-[3/4] bg-white rounded-none overflow-hidden shadow-xs flex items-center justify-center border border-black/5 hover:opacity-95 transition-opacity"
      >
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-blue/30 p-4 text-center">
            <BookOpen size={48} />
            <span className="text-xs font-semibold mt-2">Thư viện Dương Liễu</span>
          </div>
        )}
      </a>

      {/* Thông tin sách nổi bật */}
      <div className="flex-1 flex flex-col justify-between min-w-0 h-full">
        <div>
          {/* Tên sách với Icon ngôi sao */}
          <div className="flex items-start gap-2.5">
            <Star size={22} className="text-[#1B3F8B] shrink-0 mt-1 stroke-[1.8]" />
            <h3 className="text-2xl sm:text-3xl font-bold text-[#1B3F8B] leading-tight line-clamp-2">
              {book.title}
            </h3>
          </div>

          {/* Tên tác giả với Icon người */}
          {book.author && (
            <div className="flex items-center gap-2.5 mt-2 sm:mt-3">
              <User size={20} className="text-[#1B3F8B] shrink-0 stroke-[1.8]" />
              <p className="text-lg sm:text-xl font-bold text-[#1B3F8B] truncate">
                {book.author}
              </p>
            </div>
          )}

          {/* Đường kẻ ngang phân cách */}
          <div className="w-full border-b border-[#1B3F8B]/30 my-4" />

          {/* Đoạn trích dẫn / mô tả */}
          {book.short_description && (
            <p className="text-sm sm:text-[15px] text-[#374151] leading-relaxed font-normal text-justify line-clamp-6 sm:line-clamp-none">
              “{book.short_description}”
            </p>
          )}
        </div>

        {/* Link tra cứu nếu có */}
        {book.skoolib_url && (
          <div className="mt-4 pt-2">
            <a
              href={book.skoolib_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1B3F8B] hover:underline"
            >
              <span>Xem chi tiết trên Skoolib</span>
              <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function GridBookCard({ book }) {
  if (!book) return null;

  return (
    <div className="flex flex-col group h-full">
      {/* Bìa sách */}
      <a
        href={book.skoolib_url || '#'}
        target={book.skoolib_url ? '_blank' : undefined}
        rel="noopener noreferrer"
        className="w-full aspect-[3/4] bg-white rounded-none overflow-hidden shadow-xs border border-black/5 flex items-center justify-center group-hover:shadow-md transition-all duration-200"
      >
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-blue/30 p-2 text-center">
            <BookOpen size={28} />
            <span className="text-[10px] font-semibold mt-1">TVDL</span>
          </div>
        )}
      </a>

      {/* Thông tin: Tên sách (xanh) & Tác giả (vàng cam) */}
      <div className="mt-2.5 space-y-1">
        <div className="flex items-center gap-1.5">
          <Star size={13} className="text-[#1B3F8B] shrink-0 stroke-[1.8]" />
          <p
            className="text-xs sm:text-sm font-bold text-[#1B3F8B] truncate group-hover:text-blue-light transition-colors"
            title={book.title}
          >
            {book.title}
          </p>
        </div>

        {book.author && (
          <div className="flex items-center gap-1.5">
            <User size={13} className="text-[#E5A000] shrink-0 stroke-[1.8]" />
            <p
              className="text-[11px] sm:text-xs font-bold text-[#E5A000] truncate"
              title={book.author}
            >
              {book.author}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function QuoteSection({ quote }) {
  if (!quote?.content) return null;

  return (
    <div className="w-full bg-white py-10 sm:py-14 px-6 sm:px-12 lg:px-16">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-12">
        {/* Tác giả câu nói (Màu vàng cam) */}
        {quote.author && (
          <div className="w-full sm:w-1/4 shrink-0">
            <p className="text-xl sm:text-2xl font-bold text-[#F5A623]">
              {quote.author}
            </p>
          </div>
        )}

        {/* Nội dung câu nói (Màu xanh đậm lớn) */}
        <div className="flex-1">
          <p className="text-2xl sm:text-3xl lg:text-[40px] font-extrabold text-[#1B3F8B] leading-tight tracking-tight">
            “{quote.content}”
          </p>
        </div>
      </div>
    </div>
  );
}

function MonthSection({ monthData }) {
  const { featured_book, grid_books, quote } = monthData;

  // Đảm bảo grid có tối đa 6 sách (2 hàng x 3 cột)
  const displayGridBooks = (grid_books || []).slice(0, 6);

  return (
    <div className="w-full space-y-0">
      {/* Khối chính 2 cột: Bên trái nền vàng kem (#FAF3DE), bên phải nền xám xanh (#F0F4F8) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-stretch shadow-xs">
        {/* Nửa trái: Sách nổi bật (Nền vàng kem nhạt) */}
        <div className="bg-[#FAF3DE] p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
          {featured_book ? (
            <FeaturedBookCard book={featured_book} />
          ) : (
            <div className="h-64 flex items-center justify-center text-[#4B5563] text-sm italic">
              Chưa có sách nổi bật
            </div>
          )}
        </div>

        {/* Nửa phải: Grid 6 cuốn sách (Nền xám xanh nhạt) */}
        <div className="bg-[#F0F4F8] p-6 sm:p-8 lg:p-12">
          {displayGridBooks.length > 0 ? (
            <div className="grid grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-6 sm:gap-y-8">
              {displayGridBooks.map((book) => (
                <GridBookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[220px] flex items-center justify-center text-[#4B5563] text-sm italic p-6 text-center">
              Không có thêm sách khác trong đợt này
            </div>
          )}
        </div>
      </div>

      {/* Khối Quote trích dẫn nằm trên nền trắng ngay bên dưới */}
      <QuoteSection quote={quote} />
    </div>
  );
}

export default function NewBooksPage() {
  const [monthSections, setMonthSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');

  // Fetch dữ liệu categories và locations
  useEffect(() => {
    Promise.all([
      api.get('/categories').catch(() => ({ data: { data: [] } })),
      api.get('/locations').catch(() => ({ data: { data: [] } })),
    ]).then(([catRes, locRes]) => {
      setCategories(catRes.data.data || []);
      setLocations(locRes.data.data || []);
    });
  }, []);

  // Fetch danh sách sách mới
  const fetchNewBooks = () => {
    setLoading(true);
    const params = {};
    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (selectedCategoryId) params.category_id = selectedCategoryId;
    if (selectedLocationId) params.location_id = selectedLocationId;

    api.get('/new-books', { params })
      .then((r) => {
        setMonthSections(r.data.data || []);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  // Debounce search / filter
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNewBooks();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategoryId, selectedLocationId]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* Container Top: Tiêu đề & Thanh Tìm kiếm / Bộ lọc */}
      <div className="px-10 pt-8 pb-8 sm:px-28 sm:pt-12 sm:pb-10">
        <div className="max-w-7xl mx-auto">
          {/* Tiêu đề trang */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1B3F8B] tracking-tight">
              Sách mới, sách mới đây!
            </h1>
          </div>

          {/* Thanh tìm kiếm và Bộ lọc (1 hàng 3 ô như trong ảnh) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
          {/* Ô Tìm kiếm (chiếm 6 cột) */}
          <div className="md:col-span-6 relative flex items-center">
            <Search size={18} className="absolute left-3.5 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm sách theo tên sách, tác giả"
              className="w-full h-11 pl-10 pr-9 bg-white border border-[#4B5563] text-sm text-[#2D2D2D] placeholder-gray-500 focus:outline-none focus:border-[#1B3F8B] transition-colors rounded-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 text-gray-400 hover:text-gray-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Ô Thể loại (chiếm 3 cột) */}
          <div className="md:col-span-3 relative flex items-center">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full h-11 px-3.5 pr-8 bg-white border border-[#4B5563] text-sm text-[#2D2D2D] appearance-none focus:outline-none focus:border-[#1B3F8B] cursor-pointer rounded-none"
            >
              <option value="">Tất cả thể loại</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-3 text-[#4B5563] pointer-events-none" />
          </div>

          {/* Ô Bộ lọc (chi nhánh / cơ sở) (chiếm 3 cột) */}
          <div className="md:col-span-3 relative flex items-center">
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full h-11 px-3.5 pr-8 bg-white border border-[#4B5563] text-sm text-[#2D2D2D] appearance-none focus:outline-none focus:border-[#1B3F8B] cursor-pointer rounded-none"
            >
              <option value="">Bộ lọc</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  Cơ sở: {loc.name}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-3 text-[#4B5563] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>

      {/* Danh sách các khối sách theo tháng */}
      <div className="px-10 pb-12 sm:px-28 sm:pb-16">
        {loading ? (
          <div className="max-w-7xl mx-auto py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 animate-pulse border border-gray-200">
              <div className="bg-[#FAF3DE]/70 p-8 h-80 flex gap-6">
                <div className="w-48 bg-gray-300/60 rounded" />
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-gray-300/60 rounded w-3/4" />
                  <div className="h-4 bg-gray-300/60 rounded w-1/2" />
                  <div className="h-24 bg-gray-300/40 rounded w-full" />
                </div>
              </div>
              <div className="bg-[#F0F4F8] p-8 grid grid-cols-3 gap-4">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-300/50 rounded" />
                ))}
              </div>
            </div>
          </div>
        ) : monthSections.length === 0 ? (
          <div className="max-w-7xl mx-auto py-16">
            <div className="bg-[#FAF3DE]/50 border border-dashed border-gray-300 rounded-lg py-16 px-4 text-center">
              <BookOpen size={48} className="mx-auto text-blue/30 mb-3" />
              <p className="text-gray-700 text-base font-semibold">Không tìm thấy sách phù hợp</p>
              <p className="text-gray-500 text-xs mt-1">Vui lòng thử tìm kiếm bằng từ khóa hoặc bộ lọc khác!</p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
            {monthSections.map((m) => (
              <MonthSection key={m.month_key} monthData={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

