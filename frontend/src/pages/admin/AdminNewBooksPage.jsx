import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, Star, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';
import Modal from '../../components/Modal';
import ImageUploadField from '../../components/ImageUploadField';
import Pagination from '../../components/ui/Pagination';
import { FormField, TextInput, Select, TextArea } from '../../components/ui/FormField';
import useCrudList from '../../hooks/useCrudList';

const getCurrentMonthYear = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const EMPTY_FORM = {
  title: '', author: '', book_code: '', cover_image: '', short_description: '',
  publisher: '', publish_year: '', page_count: '', location_id: '', category_id: '',
  month_year: getCurrentMonthYear(), is_featured: false, skoolib_url: '',
};

export default function AdminNewBooksPage() {
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingAux, setLoadingAux] = useState(false);

  const fetchAuxData = async () => {
    setLoadingAux(true);
    try {
      const [locRes, catRes] = await Promise.all([
        api.get('/locations').catch(() => ({ data: { data: [] } })),
        api.get('/categories').catch(() => ({ data: { data: [] } })),
      ]);
      setLocations(locRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    } catch (e) {
      console.error('Lỗi tải danh mục cơ sở/thể loại', e);
    } finally {
      setLoadingAux(false);
    }
  };

  useEffect(() => {
    fetchAuxData();
  }, []);

  const crud = useCrudList({
    endpoint: '/new-books',
    emptyForm: EMPTY_FORM,
    confirmDelete: 'Xoá sách này?',
    validate: (f) => {
      const errs = {};
      if (!f.title?.trim()) errs.title = 'Nhập tên sách';
      if (!f.location_id) errs.location_id = 'Chọn cơ sở';
      if (!f.category_id) errs.category_id = 'Chọn thể loại';
      if (!f.skoolib_url?.trim()) errs.skoolib_url = 'Nhập đường link sách Skoolib';
      return errs;
    },
    toForm: (b) => ({
      title: b.title || '',
      author: b.author || '',
      book_code: b.book_code || '',
      cover_image: b.cover_image || '',
      short_description: b.short_description || '',
      publisher: b.publisher || '',
      publish_year: b.publish_year ?? '',
      page_count: b.page_count ?? '',
      month_year: b.month_year || getCurrentMonthYear(),
      is_featured: !!b.is_featured,
      skoolib_url: b.skoolib_url || '',
      location_id: b.location?.id ? String(b.location.id) : (b.location_id ? String(b.location_id) : ''),
      category_id: b.category?.id ? String(b.category.id) : (b.category_id ? String(b.category_id) : ''),
    }),
  });
  const { items: books, form, setForm } = crud;

  const handleOpenCreate = () => {
    if (locations.length === 0 || categories.length === 0) {
      fetchAuxData();
    }
    crud.openCreate();
  };

  const handleOpenEdit = (book) => {
    if (locations.length === 0 || categories.length === 0) {
      fetchAuxData();
    }
    crud.openEdit(book);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue">Sách mới</h1>
          <p className="text-muted text-xs mt-1">Quản lý sách mới theo tháng. Mỗi tháng có 1 sách nổi bật và tối đa 6 sách trong danh sách phụ.</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-light transition-colors">
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
                  <div className="w-10 h-14 bg-cream rounded flex items-center justify-center shrink-0 overflow-hidden">
                    {b.cover_image ? <img src={b.cover_image} alt="" className="w-full h-full object-cover rounded" /> : <span>📚</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-blue text-sm truncate">
                        {b.title}
                        {b.book_code && <span className="ml-2 text-muted text-xs font-normal">({b.book_code})</span>}
                      </p>
                      {b.is_featured && (
                        <span className="inline-flex items-center gap-1 bg-yellow/20 text-[#92400E] border border-yellow/40 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          <Star size={11} className="fill-yellow text-yellow" /> Nổi bật
                        </span>
                      )}
                      {b.month_year && (
                        <span className="bg-blue/10 text-blue text-[11px] font-medium px-2 py-0.5 rounded">
                          Tháng {b.month_year}
                        </span>
                      )}
                    </div>
                    <p className="text-muted text-xs mt-0.5">
                      {b.author} · {b.category?.name} · {b.location?.name}
                      {b.publisher && ` · ${b.publisher}${b.publish_year ? ` ${b.publish_year}` : ''}`}
                    </p>
                    {b.skoolib_url && (
                      <a
                        href={b.skoolib_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue/70 hover:text-blue hover:underline mt-1"
                      >
                        <ExternalLink size={11} /> {b.skoolib_url}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleOpenEdit(b)} className="p-2 text-blue hover:bg-blue/10 rounded-lg transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => crud.handleDelete(b.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      <Pagination page={crud.page} totalPages={crud.totalPages} onChange={crud.setPage} />

      {crud.modal && (
        <Modal
          title={crud.modal === 'create' ? 'Thêm sách mới' : 'Chỉnh sửa sách'}
          onClose={() => crud.setModal(null)}
          wide={true}
        >
          <div className="space-y-4">
            <FormField label="Tên sách" required error={crud.errors.title}>
              <TextInput
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Nhập tên sách..."
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Tháng / Năm" required>
                <TextInput
                  type="month"
                  value={form.month_year}
                  onChange={(e) => setForm({ ...form, month_year: e.target.value })}
                />
              </FormField>

              <FormField label="Sách nổi bật tháng này?">
                <label className="flex items-center gap-2 mt-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="w-4 h-4 text-blue rounded border-gray-300 focus:ring-blue cursor-pointer"
                  />
                  <span className="text-sm font-medium text-blue">Đặt làm sách nổi bật</span>
                </label>
              </FormField>
            </div>

            <FormField label="Đường link sách Skoolib" required error={crud.errors.skoolib_url}>
              <TextInput
                placeholder="https://skoolib.net/..."
                value={form.skoolib_url}
                onChange={(e) => setForm({ ...form, skoolib_url: e.target.value })}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Tác giả">
                <TextInput
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Nhập tên tác giả..."
                />
              </FormField>
              <FormField label="Mã sách">
                <TextInput
                  value={form.book_code}
                  onChange={(e) => setForm({ ...form, book_code: e.target.value })}
                  placeholder="Ví dụ: VHT-001..."
                />
              </FormField>
            </div>

            <ImageUploadField label="Ảnh bìa" value={form.cover_image} onChange={(url) => setForm({ ...form, cover_image: url })} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Nhà xuất bản">
                <TextInput
                  value={form.publisher}
                  onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                  placeholder="Ví dụ: NXB Kim Đồng..."
                />
              </FormField>
              <FormField label="Năm XB">
                <TextInput type="number" min="1900" max="2100" value={form.publish_year} onChange={(e) => setForm({ ...form, publish_year: e.target.value })} />
              </FormField>
              <FormField label="Số trang">
                <TextInput type="number" min="1" value={form.page_count} onChange={(e) => setForm({ ...form, page_count: e.target.value })} />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Cơ sở" required error={crud.errors.location_id}>
                <Select
                  value={form.location_id ? String(form.location_id) : ''}
                  onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                >
                  <option value="">— Chọn cơ sở —</option>
                  {locations.map((l) => (
                    <option key={l.id} value={String(l.id)}>
                      {l.name} {l.address ? `(${l.address})` : ''}
                    </option>
                  ))}
                </Select>
                {locations.length === 0 && !loadingAux && (
                  <p className="text-xs text-amber-600 mt-1">Chưa có cơ sở nào trong hệ thống</p>
                )}
              </FormField>

              <FormField label="Thể loại" required error={crud.errors.category_id}>
                <Select
                  value={form.category_id ? String(form.category_id) : ''}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                >
                  <option value="">— Chọn thể loại —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name} {c.age_group?.name ? `(${c.age_group.name})` : ''}
                    </option>
                  ))}
                </Select>
                {categories.length === 0 && !loadingAux && (
                  <p className="text-xs text-amber-600 mt-1">Chưa có thể loại nào trong hệ thống</p>
                )}
              </FormField>
            </div>

            <FormField label="Mô tả ngắn">
              <TextArea
                rows={3}
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                placeholder="Nhập phần tóm tắt / trích đoạn giới thiệu sách..."
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button onClick={() => crud.setModal(null)} className="px-4 py-2 text-sm text-muted hover:text-blue transition-colors">
              Huỷ
            </button>
            <button
              onClick={() => crud.handleSave()}
              disabled={crud.saving}
              className="flex items-center gap-2 bg-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-light disabled:opacity-50 transition-colors"
            >
              <Check size={15} /> {crud.saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
