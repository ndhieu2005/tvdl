import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, Star } from 'lucide-react';
import { api } from '../../lib/api';
import Modal from '../../components/Modal';
import Pagination from '../../components/ui/Pagination';
import { FormField, TextInput, Select, TextArea } from '../../components/ui/FormField';
import useCrudList from '../../hooks/useCrudList';

const EVENT_COLORS = ['#1B3F8B', '#F5C000', '#2E7D32', '#E65100', '#6A1B9A', '#C62828'];

const EMPTY_FORM = {
  name: '', date: '', start_time: '', end_time: '',
  location_id: '', custom_location_name: '', target_age_group_id: '',
  seat_count: '', organizer: '', description: '',
  is_featured: false, color: '',
};

const pad = (n) => String(n).padStart(2, '0');

function toDatetime(date, time) {
  if (!date || !time) return null;
  return `${date}T${time}:00`;
}

export default function AdminEventsPage() {
  const [locations, setLocations] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);

  const crud = useCrudList({
    endpoint: '/events',
    emptyForm: EMPTY_FORM,
    confirmDelete: 'Xoá sự kiện này?',
    validate: (f) => {
      const errs = {};
      if (!f.name.trim()) errs.name = 'Nhập tiêu đề sự kiện';
      if (!f.date) errs.date = 'Chọn ngày tổ chức';
      if (!f.start_time) errs.start_time = 'Chọn giờ bắt đầu';
      if (f.end_time && f.start_time && f.end_time <= f.start_time) errs.end_time = 'Phải sau giờ bắt đầu';
      return errs;
    },
    toForm: (ev) => {
      const start = ev.event_datetime ? new Date(ev.event_datetime) : null;
      const end = ev.end_datetime ? new Date(ev.end_datetime) : null;
      return {
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
      };
    },
  });
  const { items: events, form, setForm } = crud;

  useEffect(() => {
    api.get('/locations').then((r) => setLocations(r.data.data || [])).catch(() => {});
    api.get('/age-groups').then((r) => setAgeGroups(r.data.data || [])).catch(() => {});
  }, []);

  function save() {
    crud.handleSave((f) => ({
      name: f.name,
      event_datetime: toDatetime(f.date, f.start_time),
      end_datetime: toDatetime(f.date, f.end_time),
      location_id: f.location_id || null,
      custom_location_name: f.location_id ? null : (f.custom_location_name || null),
      target_age_group_id: f.target_age_group_id || null,
      seat_count: f.seat_count || null,
      organizer: f.organizer || null,
      description: f.description || null,
      is_featured: f.is_featured,
      color: f.color || null,
    }));
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue">Sự kiện</h1>
        <button onClick={() => crud.openCreate()} className="flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-light transition-colors">
          <Plus size={16} /> Thêm sự kiện
        </button>
      </div>

      {crud.loading
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
                    <button onClick={() => crud.openEdit(ev)} className="p-2 text-blue hover:bg-blue/10 rounded-lg transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => crud.handleDelete(ev.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      <Pagination page={crud.page} totalPages={crud.totalPages} onChange={crud.setPage} />

      {crud.modal && (
        <Modal title={crud.modal === 'create' ? 'Thêm sự kiện' : 'Chỉnh sửa sự kiện'} onClose={() => crud.setModal(null)}>
          <div className="space-y-3">
            <FormField label="Tiêu đề sự kiện" required error={crud.errors.name}>
              <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Ngày tổ chức" required error={crud.errors.date}>
                <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </FormField>
              <FormField label="Giờ bắt đầu" required error={crud.errors.start_time}>
                <TextInput type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </FormField>
              <FormField label="Giờ kết thúc" error={crud.errors.end_time}>
                <TextInput type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Địa điểm">
              <Select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })}>
                <option value="">Khác (nhập tay bên dưới)</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
            </FormField>
            {!form.location_id && (
              <FormField label="Tên địa điểm tùy chỉnh">
                <TextInput value={form.custom_location_name} onChange={(e) => setForm({ ...form, custom_location_name: e.target.value })} />
              </FormField>
            )}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Nhóm tuổi">
                <Select value={form.target_age_group_id} onChange={(e) => setForm({ ...form, target_age_group_id: e.target.value })}>
                  <option value="">Tất cả</option>
                  {ageGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Số người tối đa">
                <TextInput type="number" min="0" value={form.seat_count} onChange={(e) => setForm({ ...form, seat_count: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Đơn vị tổ chức">
              <TextInput value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} />
            </FormField>
            <FormField label="Mô tả">
              <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </FormField>
            <FormField label="Màu hiển thị trên lịch">
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
            </FormField>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-blue" />
              <span className="text-sm text-blue font-medium flex items-center gap-1">
                <Star size={14} className="text-yellow fill-yellow" /> Sự kiện nổi bật
              </span>
            </label>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => crud.setModal(null)} className="px-4 py-2 text-sm text-muted hover:text-blue">Huỷ</button>
            <button onClick={save} disabled={crud.saving} className="flex items-center gap-2 bg-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-light disabled:opacity-50">
              <Check size={15} /> {crud.saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
