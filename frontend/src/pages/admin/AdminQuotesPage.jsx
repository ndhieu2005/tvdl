import { Plus, Pencil, Trash2, Check, Quote } from 'lucide-react';
import Modal from '../../components/Modal';
import Pagination from '../../components/ui/Pagination';
import { FormField, TextInput, TextArea } from '../../components/ui/FormField';
import useCrudList from '../../hooks/useCrudList';

const EMPTY_FORM = {
  content: '',
  author: '',
};

export default function AdminQuotesPage() {
  const crud = useCrudList({
    endpoint: '/quotes',
    emptyForm: EMPTY_FORM,
    confirmDelete: 'Xoá câu trích dẫn này?',
    validate: (f) => {
      const errs = {};
      if (!f.content.trim()) errs.content = 'Nhập nội dung trích dẫn';
      return errs;
    },
    toForm: (q) => ({
      content: q.content || '',
      author: q.author || '',
    }),
  });

  const { items: quotes, form, setForm } = crud;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue">Danh sách trích dẫn (Quotes)</h1>
          <p className="text-muted text-xs mt-1">Các câu trích dẫn này sẽ được hiển thị ngẫu nhiên / lần lượt ở container cuối mỗi tháng trong trang Sách mới.</p>
        </div>
        <button
          onClick={() => crud.openCreate()}
          className="flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-light transition-colors"
        >
          <Plus size={16} /> Thêm trích dẫn
        </button>
      </div>

      {crud.loading ? (
        <p className="text-muted text-sm">Đang tải...</p>
      ) : quotes.length === 0 ? (
        <p className="text-muted text-sm italic">Chưa có câu trích dẫn nào</p>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="flex items-start justify-between gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Quote size={20} className="text-yellow shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#2D2D2D] text-sm font-medium leading-relaxed italic">
                    "{q.content}"
                  </p>
                  {q.author && (
                    <p className="text-blue text-xs font-semibold mt-1.5 uppercase tracking-wide">
                      — {q.author}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => crud.openEdit(q)}
                  className="p-2 text-blue hover:bg-blue/10 rounded-lg transition-colors"
                  title="Chỉnh sửa"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => crud.handleDelete(q.id)}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xoá"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={crud.page} totalPages={crud.totalPages} onChange={crud.setPage} />

      {crud.modal && (
        <Modal
          title={crud.modal === 'create' ? 'Thêm trích dẫn mới' : 'Chỉnh sửa trích dẫn'}
          onClose={() => crud.setModal(null)}
        >
          <div className="space-y-4">
            <FormField label="Nội dung trích dẫn" required error={crud.errors.content}>
              <TextArea
                rows={4}
                placeholder="Nhập câu trích dẫn truyền cảm hứng về sách/văn hóa đọc..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </FormField>
            <FormField label="Tác giả">
              <TextInput
                placeholder="Ví dụ: Victor Hugo, Nguyễn Du,..."
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => crud.setModal(null)}
              className="px-4 py-2 text-sm text-muted hover:text-blue"
            >
              Huỷ
            </button>
            <button
              onClick={() => crud.handleSave()}
              disabled={crud.saving}
              className="flex items-center gap-2 bg-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-light disabled:opacity-50"
            >
              <Check size={15} /> {crud.saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
