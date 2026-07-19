import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check } from 'lucide-react';
import { api } from '../../lib/api';
import Modal from '../../components/Modal';
import ImageUploadField from '../../components/ImageUploadField';
import Pagination from '../../components/ui/Pagination';
import { FormField, TextInput, Select, TextArea } from '../../components/ui/FormField';
import useCrudList from '../../hooks/useCrudList';

const EMPTY_FORM = {
  title: '', author: '', book_code: '', cover_image: '', short_description: '',
  publisher: '', publish_year: '', page_count: '', location_id: '', category_id: '',
};

export default function AdminNewBooksPage() {
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);

  const crud = useCrudList({
    endpoint: '/new-books',
    emptyForm: EMPTY_FORM,
    confirmDelete: 'Xoá sách này?',
    toForm: (b) => ({
      title: b.title || '',
      author: b.author || '',
      book_code: b.book_code || '',
      cover_image: b.cover_image || '',
      short_description: b.short_description || '',
      publisher: b.publisher || '',
      publish_year: b.publish_year ?? '',
      page_count: b.page_count ?? '',
      location_id: b.location?.id || '',
      category_id: b.category?.id || '',
    }),
  });
  const { items: books, form, setForm } = crud;

  useEffect(() => {
    api.get('/locations').then((r) => setLocations(r.data.data || [])).catch(() => {});
    api.get('/categories').then((r) => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue">Sách mới</h1>
        <button onClick={() => crud.openCreate()} className="flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-light transition-colors">
          <Plus size={16} /> Thêm sách
        </button>
      </div>

      {crud.loading
        ? <p className="text-muted text-sm">Đang tải...</p>
        : books.length === 0
          ? <p className="text-muted text-sm italic">Chưa có sách mới nào</p>
          : (
            <div className="space-y-2">
              {books.map((b) => (
                <div key={b.id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-3 hover:shadow-sm transition-shadow">
                  <div className="w-10 h-14 bg-cream rounded flex items-center justify-center shrink-0">
                    {b.cover_image ? <img src={b.cover_image} alt="" className="w-full h-full object-cover rounded" /> : <span>📚</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-blue text-sm truncate">
                      {b.title}
                      {b.book_code && <span className="ml-2 text-muted text-xs font-normal">({b.book_code})</span>}
                    </p>
                    <p className="text-muted text-xs">
                      {b.author} · {b.category?.name} · {b.location?.name}
                      {b.publisher && ` · ${b.publisher}${b.publish_year ? ` ${b.publish_year}` : ''}`}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => crud.openEdit(b)} className="p-2 text-blue hover:bg-blue/10 rounded-lg transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => crud.handleDelete(b.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      <Pagination page={crud.page} totalPages={crud.totalPages} onChange={crud.setPage} />

      {crud.modal && (
        <Modal title={crud.modal === 'create' ? 'Thêm sách mới' : 'Chỉnh sửa sách'} onClose={() => crud.setModal(null)}>
          <div className="space-y-3">
            <FormField label="Tên sách" required>
              <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tác giả">
                <TextInput value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </FormField>
              <FormField label="Mã sách">
                <TextInput value={form.book_code} onChange={(e) => setForm({ ...form, book_code: e.target.value })} />
              </FormField>
            </div>
            <ImageUploadField label="Ảnh bìa" value={form.cover_image} onChange={(url) => setForm({ ...form, cover_image: url })} />
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Nhà xuất bản">
                <TextInput value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
              </FormField>
              <FormField label="Năm XB">
                <TextInput type="number" min="1900" max="2100" value={form.publish_year} onChange={(e) => setForm({ ...form, publish_year: e.target.value })} />
              </FormField>
              <FormField label="Số trang">
                <TextInput type="number" min="1" value={form.page_count} onChange={(e) => setForm({ ...form, page_count: e.target.value })} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Cơ sở" required>
                <Select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })}>
                  <option value="">— Chọn cơ sở —</option>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Thể loại" required>
                <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">— Chọn thể loại —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </FormField>
            </div>
            <FormField label="Mô tả ngắn">
              <TextArea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
            </FormField>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => crud.setModal(null)} className="px-4 py-2 text-sm text-muted hover:text-blue">Huỷ</button>
            <button onClick={() => crud.handleSave()} disabled={crud.saving} className="flex items-center gap-2 bg-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-light disabled:opacity-50">
              <Check size={15} /> {crud.saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
