import { useState, useEffect } from 'react';
import { ExternalLink, Quote as QuoteIcon, BookOpen } from 'lucide-react';
import { api } from '../../lib/api';

function FeaturedBookCard({ book }) {
  if (!book) return null;

  return (
    <a
      href={book.skoolib_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col sm:flex-row gap-5 p-5 sm:p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue/40 hover:shadow-md transition-all h-full"
    >
      <div className="w-full sm:w-44 h-60 sm:h-auto shrink-0 bg-[#F9F3E1] rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 group-hover:scale-[1.02] transition-transform">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-blue/30">
            <BookOpen size={40} />
            <span className="text-xs font-semibold mt-1">TVDL</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="bg-yellow text-blue text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Sách nổi bật
            </span>
            {book.category?.name && (
              <span className="text-xs text-blue/70 font-semibold bg-blue/5 px-2 py-0.5 rounded">
                {book.category.name}
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-blue leading-snug line-clamp-2 group-hover:text-blue-light transition-colors">
            {book.title}
          </h3>

          {book.author && (
            <p className="text-sm text-[#424241] font-medium mt-1">
              Tác giả: <span className="text-blue font-semibold">{book.author}</span>
            </p>
          )}

          {book.short_description && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-4 mt-3 leading-relaxed font-light">
              {book.short_description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-blue font-semibold">
          <span className="flex items-center gap-1 group-hover:underline">
            Xem trên Skoolib <ExternalLink size={13} />
          </span>
          {book.location?.name && (
            <span className="text-muted text-[11px] font-normal">
              {book.location.name}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

function GridBookCard({ book }) {
  if (!book) return null;

  return (
    <a
      href={book.skoolib_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white border border-gray-200 rounded-xl p-3 hover:border-blue/40 hover:shadow-sm transition-all h-full"
    >
      <div className="w-full h-36 sm:h-40 bg-[#F9F3E1] rounded-lg overflow-hidden flex items-center justify-center border border-gray-100 shrink-0 group-hover:scale-[1.03] transition-transform">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-blue/30">
            <BookOpen size={24} />
            <span className="text-[10px] font-semibold mt-0.5">TVDL</span>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex-1 flex flex-col justify-between min-w-0">
        <div>
          <p className="font-bold text-blue text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-blue-light transition-colors" title={book.title}>
            {book.title}
          </p>
          {book.author && (
            <p className="text-muted text-[11px] sm:text-xs truncate mt-1">
              {book.author}
            </p>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1 text-[11px] text-blue/60 group-hover:text-blue group-hover:underline">
          <span>Chi tiết</span>
          <ExternalLink size={10} />
        </div>
      </div>
    </a>
  );
}

function QuoteSection({ quote }) {
  if (!quote?.content) return null;

  return (
    <div className="mt-6 bg-[#F9F3E1] border-l-4 border-yellow rounded-2xl p-5 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8">
        <div className="w-full sm:w-1/4 shrink-0 sm:text-right sm:border-r border-yellow/30 sm:pr-6">
          <div className="flex items-center gap-1.5 sm:justify-end text-yellow font-bold text-[11px] uppercase tracking-wider">
            <QuoteIcon size={14} className="fill-yellow" />
            <span>Trích dẫn</span>
          </div>
          {quote.author && (
            <p className="text-xs sm:text-sm font-bold text-blue mt-1">
              {quote.author}
            </p>
          )}
        </div>

        <div className="flex-1 sm:pl-2">
          <p className="text-sm sm:text-base md:text-lg font-medium text-[#2D2D2D] italic leading-relaxed">
            "{quote.content}"
          </p>
        </div>
      </div>
    </div>
  );
}

function MonthSection({ monthData }) {
  const { month_label, featured_book, grid_books, quote } = monthData;

  return (
    <section className="border-b border-gray-200/80 pb-12 sm:pb-16 last:border-none last:pb-0">
      {/* Tiêu đề tháng */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-2 h-7 bg-yellow rounded-full" />
        <h2 className="text-2xl sm:text-3xl font-bold text-blue uppercase tracking-tight">
          {month_label}
        </h2>
      </div>

      {/* Container chính: Chiếm 2/3 (Bên trái: Sách nổi bật, Bên phải: Grid 6 ô) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Nửa trái: Sách nổi bật */}
        <div className="h-full">
          {featured_book ? (
            <FeaturedBookCard book={featured_book} />
          ) : (
            <div className="h-full min-h-[260px] bg-gray-50 border border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-muted text-sm italic">
              Chưa có sách nổi bật
            </div>
          )}
        </div>

        {/* Nửa phải: Grid 6 ô (2 hàng x 3 cột) */}
        <div className="h-full">
          {grid_books && grid_books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 h-full content-start">
              {grid_books.map((book) => (
                <GridBookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[260px] bg-gray-50 border border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-muted text-sm italic p-6 text-center">
              Không có thêm sách khác trong tháng này
            </div>
          )}
        </div>
      </div>

      {/* Container Quote: Chiếm 1/4 */}
      <QuoteSection quote={quote} />
    </section>
  );
}

export default function NewBooksPage() {
  const [monthSections, setMonthSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/new-books')
      .then((r) => {
        setMonthSections(r.data.data || []);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] py-8 sm:py-14 bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12 text-center sm:text-left">
          <p className="text-yellow text-xs sm:text-sm font-bold uppercase tracking-widest mb-1">
            Không gian giới thiệu
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-blue">
            Sách Mới Mỗi Tháng
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-2xl font-light">
            Khám phá những cuốn sách tuyển chọn mới nhất tại Thư viện Dương Liễu theo từng tháng.
          </p>
        </div>

        {loading ? (
          <div className="space-y-12 animate-pulse">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-6">
                <div className="h-8 w-48 bg-gray-200 rounded" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64 bg-gray-200 rounded-2xl" />
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="h-32 bg-gray-200 rounded-xl" />
                    ))}
                  </div>
                </div>
                <div className="h-24 bg-gray-200 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : monthSections.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-20 px-4 text-center">
            <BookOpen size={48} className="mx-auto text-blue/30 mb-3" />
            <p className="text-gray-500 text-base font-medium">Chưa có danh sách sách mới nào</p>
            <p className="text-muted text-xs mt-1">Vui lòng quay lại sau để cập nhật các đầu sách mới nhất!</p>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16">
            {monthSections.map((m) => (
              <MonthSection key={m.month_key} monthData={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

