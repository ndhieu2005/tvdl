import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '../../lib/api';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-blue">{title}</h2>
          <button onClick={onClose}><X size={20} className="text-muted" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const EMPTY_FORM = { date: '', shift: 'morning', time_frame: '', location_id: '', custom_location_name: '', is_sudden_closed: false, closed_reason: '' };

export default function AdminSchedulesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  function fetchSchedules() {
    setLoading(true);
    adminApi.get(`/schedules?month=${month}&year=${year}`)
      .then((r) => setSchedules(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchSchedules(); }, [month, year]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function openCreate() { setForm({ ...EMPTY_FORM, date: `${year}-${String(month).padStart(2, '0')}-01` }); setModal('create'); }
  function openEdit(s) {
    setForm({
      date: s.date?.slice(0, 10) || '',
      shift: s.shift || 'morning',
      time_frame: s.time_frame || '',
      location_id: s.location?.id || '',
      custom_location_name: s.custom_location_name || '',
      is_sudden_closed: s.is_sudden_closed || false,
      closed_reason: s.closed_reason || '',
    });
    setEditId(s.id);
    setModal('edit');
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (modal === 'create') await adminApi.post('/schedules', form);
      else await adminApi.put(`/schedules/${editId}`, form);
      setModal(null);
      fetchSchedules();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xoá lịch này?')) return;
    await adminApi.delete(`/schedules/${id}`).catch(() => {});
    fetchSchedules();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-blue">Lịch hoạt động</h1>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue">
            <button onClick={prevMonth} className="p-1 hover:text-yellow"><ChevronLeft size={18} /></button>
            <span>Tháng {month}/{year}</span>
            <button onClick={nextMonth} className="p-1 hover:text-yellow"><ChevronRight size={18} /></button>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-light transition-colors">
          <Plus size={16} /> Thêm lịch
        </button>
      </div>

      {loading
        ? <p className="text-muted text-sm">Đang tải...</p>
        : schedules.length === 0
          ? <p className="text-muted text-sm italic">Không có lịch trong tháng này</p>
          : (
            <div className="space-y-2">
              {schedules.map((s) => (
                <div key={s.id} className={`flex items-center gap-4 bg-white border rounded-xl px-5 py-3 ${s.is_sudden_closed ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.location?.color_code || '#1B3F8B' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-blue text-sm">
                      {new Date(s.date).toLocaleDateString('vi-VN')} — {s.time_frame}
                      {s.is_sudden_closed && <span className="ml-2 text-red-500 text-xs font-medium">⚠ Đóng đột xuất</span>}
                    </p>
                    <p className="text-muted text-xs">{s.shift} · {s.location?.name || s.custom_location_name}</p>
                    {s.closed_reason && <p className="text-red-400 text-xs mt-0.5">{s.closed_reason}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(s)} className="p-2 text-blue hover:bg-blue/10 rounded-lg"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      {modal && (
        <Modal title={modal === 'create' ? 'Thêm lịch' : 'Chỉnh sửa lịch'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-blue uppercase tracking-wide mb-1">Ngày *</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue uppercase tracking-wide mb-1">Ca *</label>
              <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none">
                <option value="morning">Sáng</option>
                <option value="afternoon">Chiều</option>
                <option value="evening">Tối</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue uppercase tracking-wide mb-1">Khung giờ *</label>
              <input value={form.time_frame} onChange={(e) => setForm({ ...form, time_frame: e.target.value })}
                placeholder="VD: 08:00-11:00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue uppercase tracking-wide mb-1">ID Cơ sở</label>
              <input type="number" value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                placeholder="Để trống nếu dùng địa điểm tùy chỉnh"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue uppercase tracking-wide mb-1">Địa điểm tùy chỉnh</label>
              <input value={form.custom_location_name} onChange={(e) => setForm({ ...form, custom_location_name: e.target.value })}
                placeholder="Dùng nếu không chọn cơ sở"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_sudden_closed} onChange={(e) => setForm({ ...form, is_sudden_closed: e.target.checked })} className="accent-blue" />
              <span className="text-sm text-blue font-medium">Đóng đột xuất</span>
            </label>
            {form.is_sudden_closed && (
              <div>
                <label className="block text-xs font-semibold text-blue uppercase tracking-wide mb-1">Lý do</label>
                <input value={form.closed_reason} onChange={(e) => setForm({ ...form, closed_reason: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none" />
              </div>
            )}
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
