import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, BookOpen, Newspaper, Calendar, Globe, ExternalLink, Loader2, ArrowRight, Target } from 'lucide-react';
import { api } from '../../lib/api';
import { searchStaticPages } from '../../data/staticPagesIndex';
import { SKOOLIB_URL } from '../../components/search/SearchModal';
import { HighlightedText } from '../../utils/searchHighlight';

const FILTERS = [
  { key: 'all', label: 'Tất cả kết quả' },
  { key: 'post', label: 'Tin tức & Bài viết' },
  { key: 'book', label: 'Sách mới' },
  { key: 'event', label: 'Sự kiện' },
  { key: 'page', label: 'Trang thông tin' },
];

function getItemIcon(type) {
  switch (type) {
    case 'post':
      return <Newspaper className="w-5 h-5 text-blue" />;
    case 'book':
      return <BookOpen className="w-5 h-5 text-emerald-600" />;
    case 'event':
      return <Calendar className="w-5 h-5 text-amber-600" />;
    case 'page':
    default:
      return <Globe className="w-5 h-5 text-indigo-600" />;
  }
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [dbData, setDbData] = useState({ posts: [], books: [], events: [] });
  const [staticData, setStaticData] = useState([]);

  useEffect(() => {
    setInputValue(initialQuery);
    if (!initialQuery.trim()) {
      setDbData({ posts: [], books: [], events: [] });
      setStaticData([]);
      return;
    }

    setLoading(true);
    setStaticData(searchStaticPages(initialQuery));

    api
      .get('/search', { params: { q: initialQuery, limit: 20 } })
      .then((res) => {
        if (res.data?.data) {
          setDbData(res.data.data);
        }
      })
      .catch((err) => console.error('Error fetching search results:', err))
      .finally(() => setLoading(false));
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  const allResults = [
    ...(dbData.posts || []),
    ...(dbData.books || []),
    ...(dbData.events || []),
    ...staticData,
  ];

  const filteredResults =
    activeFilter === 'all'
      ? allResults
      : allResults.filter((item) => item.type === activeFilter);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-dark mb-2">Tìm kiếm nội dung</h1>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập từ khóa cần tìm..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue focus:border-blue text-base"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue text-white font-semibold rounded-lg hover:bg-blue-light transition shadow-2xs shrink-0 flex items-center gap-2"
          >
            <span>Tìm kiếm</span>
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      {initialQuery.trim() && (
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-3">
          {FILTERS.map((f) => {
            const count =
              f.key === 'all'
                ? allResults.length
                : allResults.filter((i) => i.type === f.key).length;

            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  activeFilter === f.key
                    ? 'bg-blue text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-blue">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-gray-600 font-medium">Đang tìm kiếm kết quả...</span>
        </div>
      )}

      {/* Results List */}
      {!loading && initialQuery.trim() && (
        <>
          {filteredResults.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500 my-4">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Không tìm thấy kết quả nào cho "{initialQuery}"
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Hãy thử kiểm tra lại chính tả hoặc thử lại bằng các từ khóa phổ biến khác.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue hover:shadow-md transition group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue/10 transition shrink-0">
                      {getItemIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                          {item.typeLabel}
                        </span>
                        {item.matchArea && (
                          <span className="text-xs font-medium bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-sm inline-flex items-center gap-1">
                            <Target className="w-3.5 h-3.5 text-amber-600" />
                            <span>Vùng khớp: <strong>{item.matchArea}</strong></span>
                          </span>
                        )}
                        {item.badge && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">
                            {item.badge}
                          </span>
                        )}
                        {item.date && (
                          <span className="text-xs text-gray-400 ml-auto">
                            {new Date(item.date).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue transition mb-1 leading-snug">
                        {item.externalUrl ? (
                          <a
                            href={item.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5"
                          >
                            <HighlightedText text={item.title} query={initialQuery} />
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </a>
                        ) : (
                          <Link to={item.url} className="inline-flex items-center gap-1.5">
                            <HighlightedText text={item.title} query={initialQuery} />
                          </Link>
                        )}
                      </h3>

                      {item.subtitle && (
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          <HighlightedText text={item.subtitle} query={initialQuery} />
                        </p>
                      )}

                      {item.snippet && (
                        <p className="text-sm text-gray-600 line-clamp-3 bg-gray-50/90 p-2.5 rounded-lg border border-gray-100 mt-2 leading-relaxed">
                          <HighlightedText text={item.snippet} query={initialQuery} />
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-4">
                        {item.externalUrl ? (
                          <a
                            href={item.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-blue hover:underline inline-flex items-center gap-1"
                          >
                            <span>Xem trên Skoolib OPAC</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <Link
                            to={item.url}
                            className="text-xs font-semibold text-blue hover:underline inline-flex items-center gap-1"
                          >
                            <span>Truy cập nội dung</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* External Skoolib Catalog Box */}
          <div className="mt-10 bg-linear-to-r from-blue/5 to-yellow/10 border border-blue/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-dark text-base">Cần tra cứu mục lục sách thư viện trên Skoolib?</h4>
            </div>
            <a
              href={SKOOLIB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-dark text-white rounded-lg font-semibold hover:opacity-90 transition text-sm flex items-center gap-2 shrink-0"
            >
              <span>Mở Skoolib OPAC</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </>
      )}
    </div>
  );
}
