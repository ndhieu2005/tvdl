import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, Star } from 'lucide-react';
import { adminApi, api } from '../../lib/api';
import Modal from '../../components/Modal';

const EVENT_COLORS = ['#1B3F8B', '#F5C000', '#2E7D32', '#E65100', '#6A1B9A', '#C62828'];

const EMPTY_FORM = {
  name: '', date: '', start_time: '', end_time: '',
  location_id: '', custom_location_name: '', target_age_group_id: '',
  seat_count: '', organizer: '', description: '',
  is_featured: false, color: '',
};

// Ghép date + time thành ISO; trả null nếu thiếu
function toDatetime(date, time) {
  if (!date || !time) return null;
  return `${date}T${time}:00`;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  function fetchEvents(p = page) {
    setLoading(true);
    adminApi.get(`/events?page=${p}&limit=20`)
      .then((r) => {
        setEvents(r.data.data || []);
        setTotalPages(r.data.meta?.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchEvents(page); }, [page]);
  useEffect(() => {
    api.get('/locations').then((r) => setLocations(r.data.data || [])).catch(() => {});
    api.get('/age-groups').then((r) => setAgeGroups(r.data.data || [])).catch(() => {});
  }, []);

  function openCreate() { setForm(EMPTY_FORM); setModal('create'); }
  function openEdit(ev) {
    const start = ev.event_datetime ? new Date(ev.event_datetime) : null;
    const end = ev.end_datetime ? new Date(ev.end_datetime) : null;
    const pad = (n) => String(n).padStart(2, '0');
    setForm({
      name: ev.name || '',
      date: start ? `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}` : '',
      start_time: start ? `${pad(start.getHours())}:${pad(start.getMinutes())}` : '',
      end_time: end ? `${pad(end.getHours())}:${pad(end.getMinutes())}` : '',
      location_id: ev.location?.id || '',
      custom_location_name: ev.custom_location_name || '',
      target_age_group_id: ev.target_age_group?.id || '',
      seat_count: ev.seat_count ?? '',
      organizer: ev.organizer || '',
      description: ev.description || '',
      is_featured: ev.is_featured || false,
      color: ev.color || '',
    });
    setEditId(ev.id);
    setModal('edit');
  }

  async function handleSave() {
    if (!form.name || !form.date || !form.start_time) {
      alert('Cần nhập tối thiểu: tiêu đề, ngày và giờ bắt đầu');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        event_datetime: toDatetime(form.date, form.start_time),
        end_datetime: toDatetime(form.date, form.end_time),
        location_id: form.location_id || null,
        custom_location_name: form.location_id ? null : (form.custom_location_name || null),
        target_age_group_id: form.target_age_group_id || null,
        seat_count: form.seat_count || null,
        organizer: form.organizer || null,
        description: form.description || null,
        is_featured: form.is_featured,
        color: form.color || null,
      };
      if (modal === 'create') await adminApi.post('/events', payload);
      else await adminApi.put(`/events/${editId}`, payload);
      setModal(null);
      fetchEvents(page);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xoá sự kiện này?')) return;
    await adminApi.delete(`/events/${id}`).catch(() => {});
    fetchEvents(page);
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none';
  const labelCls = 'block text-xs font-semibold text-blue uppercase tracking-wide mb-1';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue">Sự kiện</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-light transition-colors">
          <Plus size={16} /> Thêm sự kiện
        </button>
      </div>

      {loading
        ? <p className="text-muted text-sm">Đang tải...</p>
        : events.length === 0
          ? <p className="text-muted text-sm italic">Chưa có sự kiện nào</p>
          : (
            <div className="space-y-2">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-3 hover:shadow-sm transition-shadow">
                  <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: ev.color || '#1B3F8B' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-blue text-sm truncate">
                      {ev.is_featured && <Star size={13} className="inline mr-1 text-yellow fill-yellow" />}
                      {ev.name}
                      {ev.is_featured && <span className="ml-2 text-yellow text-xs font-bold uppercase">Nổi bật</span>}
                    </p>
                    <p className="text-muted text-xs">
                      {new Date(ev.event_datetime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                      {ev.end_datetime && ` – ${new Date(ev.end_datetime).toLocaleTimeString('vi-VN', { timeStyle: 'short' })}`}
                      {' · '}{ev.location?.name || ev.custom_location_name || 'Chưa có địa điểm'}
                      {ev.seat_count ? ` · ${ev.seat_count} chỗ` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(ev)} className="p-2 text-blue hover:bg-blue/10 rounded-lg transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(ev.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-semibold ${p === page ? 'bg-blue text-white' : 'border border-blue text-blue hover:bg-blue/10'}`}>{p}</button>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'Thêm sự kiện' : 'Chỉnh sửa sự kiện'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Tiêu đề sự kiện *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Ngày tổ chức *</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Giờ bắt đầu *</label>
                <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Giờ kết thúc</label>
                <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Địa điểm</label>
              <select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })} className={inputCls}>
                <option value="">Khác (nhập tay bên dưới)</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            {!form.location_id && (
              <div>
                <label className={labelCls}>Tên địa điểm tùy chỉnh</label>
                <input value={form.custom_location_name} onChange={(e) => setForm({ ...form, custom_location_name: e.target.value })} className={inputCls} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nhóm tuổi</label>
                <select value={form.target_age_group_id} onChange={(e) => setForm({ ...form, target_age_group_id: e.target.value })} className={inputCls}>
                  <option value="">Tất cả</option>
                  {ageGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Số người tối đa</label>
                <input type="number" min="0" value={form.seat_count} onChange={(e) => setForm({ ...form, seat_count: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Đơn vị tổ chức</label>
              <input value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Mô tả</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Màu hiển thị trên lịch</label>
              <div className="flex gap-2">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: form.color === c ? '' : c })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${form.color === c ? 'border-dark scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-blue" />
              <span className="text-sm text-blue font-medium flex items-center gap-1">
                <Star size={14} className="text-yellow fill-yellow" /> Sự kiện nổi bật
              </span>
            </label>
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
