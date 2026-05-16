
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { adminApi } from '../../lib/api';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-blue">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-blue"><X size={20} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const EMPTY_FORM = { title: '', author: '', cover_image: '', short_description: '', location_id: '', category_id: '' };

export default function AdminNewBooksPage() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  function fetchBooks(p = page) {
    setLoading(true);
    adminApi.get(`/new-books?page=${p}&limit=20`)
      .then((r) => {
        setBooks(r.data.data || []);
        setTotalPages(r.data.meta?.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchBooks(page); }, [page]);

  function openCreate() { setForm(EMPTY_FORM); setModal('create'); }
  function openEdit(book) {
    setForm({
      title: book.title || '',
      author: book.author || '',
      cover_image: book.cover_image || '',
      short_description: book.short_description || '',
      location_id: book.location?.id || '',
      category_id: book.category?.id || '',
    });
    setEditId(book.id);
    setModal('edit');
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (modal === 'create') {
        await adminApi.post('/new-books', form);
      } else {
        await adminApi.put(`/new-books/${editId}`, form);
      }
      setModal(null);
      fetchBooks(page);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xoá sách này?')) return;
    await adminApi.delete(`/new-books/${id}`).catch(() => {});
    fetchBooks(page);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue">Sách mới</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-light transition-colors">
          <Plus size={16} /> Thêm sách
        </button>
      </div>

      {loading
        ? <p className="text-muted text-sm">Đang tải...</p>
        : (
          <div className="space-y-2">
            {books.map((b) => (
              <div key={b.id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-3 hover:shadow-sm transition-shadow">
                <div className="w-10 h-14 bg-cream rounded flex items-center justify-center shrink-0">
                  {b.cover_image ? <img src={b.cover_image} alt="" className="w-full h-full object-cover rounded" /> : <span>📚</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-blue text-sm truncate">{b.title}</p>
                  <p className="text-muted text-xs">{b.author} · {b.category?.name} · {b.location?.name}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(b)} className="p-2 text-blue hover:bg-blue/10 rounded-lg transition-colors"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-semibold ${p === page ? 'bg-blue text-white' : 'border border-blue text-blue hover:bg-blue/10'}`}>{p}</button>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal title={modal === 'create' ? 'Thêm sách mới' : 'Chỉnh sửa sách'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {[
              { key: 'title', label: 'Tên sách *' },
              { key: 'author', label: 'Tác giả' },
              { key: 'cover_image', label: 'URL ảnh bìa' },
              { key: 'location_id', label: 'ID Cơ sở *' },
              { key: 'category_id', label: 'ID Thể loại *' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-blue uppercase tracking-wide mb-1">{label}</label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-blue uppercase tracking-wide mb-1">Mô tả ngắn</label>
              <textarea
                rows={3}
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-muted hover:text-blue">Huỷ</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-light disabled:opacity-50">
              <Check size={15} /> {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
