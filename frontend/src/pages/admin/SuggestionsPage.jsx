import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import Pagination from '../../components/ui/Pagination';

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch pattern: bật loading sync khi đổi trang
    setLoading(true);
    adminApi.get(`/suggestions?page=${page}&limit=20`)
      .then((r) => {
        setSuggestions(r.data.data || []);
        setTotalPages(r.data.meta?.totalPages || 1);
        setTotal(r.data.meta?.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue">Đề xuất sách</h1>
        <span className="bg-yellow text-blue text-xs font-bold px-3 py-1 rounded-full">{total} đề xuất</span>
      </div>

      {loading
        ? <p className="text-muted text-sm">Đang tải...</p>
        : suggestions.length === 0
          ? <p className="text-muted text-sm italic">Chưa có đề xuất nào</p>
          : (
            <div className="space-y-3">
              {suggestions.map((s) => (
                <div key={s.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-blue text-sm">
                        {s.book_name || <span className="text-muted italic">Không có tên sách</span>}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        Bạn đọc:{' '}
                        <span className="text-blue font-medium">
                          {s.reader_name || s.reader_code || 'Bạn đọc'}
                        </span>
                        {s.reader_code && s.reader_name && ` (${s.reader_code})`}
                        {s.email && ` · ${s.email}`}
                      </p>
                      {s.category && (
                        <p className="text-xs text-yellow font-medium mt-1">{s.age_group?.name} · {s.category?.name}</p>
                      )}
                      {s.description && (
                        <p className="text-xs text-dark mt-2 leading-relaxed">{s.description}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted shrink-0">{new Date(s.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
