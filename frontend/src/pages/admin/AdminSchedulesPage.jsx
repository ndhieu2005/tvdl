import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Check, ChevronLeft, ChevronRight, Eye, CalendarRange, Repeat } from 'lucide-react';
import { adminApi, api } from '../../lib/api';
import Modal from '../../components/Modal';
import { FormField, TextInput, Select } from '../../components/ui/FormField';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/ConfirmDialog';

const SHIFT_LABELS = { morning: 'Sáng', afternoon: 'Chiều', evening: 'Tối' };
const WEEKDAYS = [
  { value: 1, label: 'T2' }, { value: 2, label: 'T3' }, { value: 3, label: 'T4' },
  { value: 4, label: 'T5' }, { value: 5, label: 'T6' }, { value: 6, label: 'T7' },
  { value: 0, label: 'CN' },
];
const weekdayName = (dow) => WEEKDAYS.find((w) => w.value === dow)?.label || '?';

const EMPTY_SCHEDULE_FORM = {
  date: '', shift: 'morning', start_time: '', end_time: '',
  location_id: '', custom_location_name: '',
  is_sudden_closed: false, closed_reason: '',
  multiDay: false, from: '', to: '', weekdays: [],
};

const EMPTY_TEMPLATE_FORM = {
  day_of_week: 6, shift: 'morning', start_time: '', end_time: '',
  location_id: '', custom_location_name: '',
};

// "08:00-11:00" ⇄ 2 ô time
function splitTimeFrame(tf) {
  const m = /^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/.exec(tf || '');
  return m ? [m[1], m[2]] : ['', ''];
}
const joinTimeFrame = (start, end) => `${start}-${end}`;

function datesInRange(from, to, weekdays) {
  if (!from || !to || weekdays.length === 0) return [];
  const out = [];
  const end = new Date(to);
  for (let d = new Date(from); d <= end && out.length <= 100; d.setDate(d.getDate() + 1)) {
    if (weekdays.includes(d.getDay())) {
      out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
  }
  return out;
}

/* ---------- Shared form pieces (dùng chung modal lịch + modal ca chuẩn) ---------- */

function LocationFields({ value, onChange, locations, errors = {} }) {
  return (
    <>
      <FormField label="Cơ sở">
        <Select value={value.location_id} onChange={(e) => onChange({ ...value, location_id: e.target.value })}>
          <option value="">Khác (nhập tay bên dưới)</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </Select>
      </FormField>
      {!value.location_id && (
        <FormField label="Tên địa điểm tùy chỉnh" error={errors.custom_location_name}>
          <TextInput value={value.custom_location_name} onChange={(e) => onChange({ ...value, custom_location_name: e.target.value })} />
        </FormField>
      )}
    </>
  );
}

function TimeFields({ value, onChange, errors = {} }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField label="Giờ bắt đầu" required error={errors.start_time}>
        <TextInput type="time" value={value.start_time} onChange={(e) => onChange({ ...value, start_time: e.target.value })} />
      </FormField>
      <FormField label="Giờ kết thúc" required error={errors.end_time}>
        <TextInput type="time" value={value.end_time} onChange={(e) => onChange({ ...value, end_time: e.target.value })} />
      </FormField>
    </div>
  );
}

export default function AdminSchedulesPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [schedules, setSchedules] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // modal: null | {type:'schedule-create'|'schedule-edit'|'template-create'|'template-edit', id?}
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_SCHEDULE_FORM);
  const [tplForm, setTplForm] = useState(EMPTY_TEMPLATE_FORM);
  const [formErrors, setFormErrors] = useState({}); // lỗi validate inline cho cả 2 modal

  function fetchSchedules() {
    setLoading(true);
    adminApi.get(`/schedules?month=${month}&year=${year}`)
      .then((r) => setSchedules(r.data.data || []))
      .catch(() => toast.error('Không tải được lịch'))
      .finally(() => setLoading(false));
  }
  function fetchTemplates() {
    adminApi.get('/schedule-templates')
      .then((r) => setTemplates(r.data.data || []))
      .catch(() => {});
  }

  // fetch pattern: bật loading sync khi đổi tháng là chủ đích, không gây cascade
  useEffect(() => { fetchSchedules(); }, [month, year]); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    fetchTemplates();
    api.get('/locations').then((r) => setLocations(r.data.data || [])).catch(() => {});
  }, []);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const previewDates = useMemo(
    () => (form.multiDay ? datesInRange(form.from, form.to, form.weekdays) : []),
    [form.multiDay, form.from, form.to, form.weekdays]
  );

  /* ---------- Schedule modal ---------- */

  function openCreateSchedule() {
    setForm({ ...EMPTY_SCHEDULE_FORM, date: `${year}-${String(month).padStart(2, '0')}-01` });
    setFormErrors({});
    setModal({ type: 'schedule-create' });
  }

  function openEditSchedule(s) {
    const [start_time, end_time] = splitTimeFrame(s.time_frame);
    setForm({
      ...EMPTY_SCHEDULE_FORM,
      date: s.date?.slice(0, 10) || '',
      shift: s.shift || 'morning',
      start_time, end_time,
      location_id: s.location?.id || '',
      custom_location_name: s.custom_location_name || '',
      is_sudden_closed: s.is_sudden_closed || false,
      closed_reason: s.closed_reason || '',
    });
    setFormErrors({});
    setModal({ type: 'schedule-edit', id: s.id });
  }

  async function saveSchedule() {
    const errs = {};
    if (!form.start_time) errs.start_time = 'Chọn giờ bắt đầu';
    if (!form.end_time) errs.end_time = 'Chọn giờ kết thúc';
    if (!form.location_id && !form.custom_location_name.trim()) errs.custom_location_name = 'Chọn cơ sở hoặc điền tên địa điểm';
    if (modal.type === 'schedule-create' && !form.multiDay && !form.date) errs.date = 'Chọn ngày';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const base = {
      shift: form.shift,
      time_frame: joinTimeFrame(form.start_time, form.end_time),
      location_id: form.location_id || null,
      custom_location_name: form.location_id ? null : (form.custom_location_name || null),
    };

    setSaving(true);
    try {
      if (modal.type === 'schedule-create' && form.multiDay) {
        if (previewDates.length === 0) {
          toast.error('Chưa có ngày nào khớp — kiểm tra khoảng ngày và thứ đã chọn');
          return;
        }
        if (previewDates.length > 100) {
          toast.error('Tối đa 100 ngày mỗi lần');
          return;
        }
        const r = await adminApi.post('/schedules/bulk', { ...base, dates: previewDates });
        toast.success(`Đã tạo ${r.data.data.created} lịch`);
      } else if (modal.type === 'schedule-create') {
        await adminApi.post('/schedules', { ...base, date: form.date });
        toast.success('Đã thêm lịch');
      } else {
        await adminApi.put(`/schedules/${modal.id}`, {
          ...base,
          date: form.date,
          is_sudden_closed: form.is_sudden_closed,
          closed_reason: form.is_sudden_closed ? form.closed_reason : null,
        });
        toast.success('Đã cập nhật lịch');
      }
      setModal(null);
      fetchSchedules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSchedule(id) {
    if (!(await confirm('Xoá lịch này?'))) return;
    try {
      await adminApi.delete(`/schedules/${id}`);
      toast.success('Đã xoá');
      fetchSchedules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    }
  }

  /* ---------- Template modal ---------- */

  function openCreateTemplate() {
    setTplForm(EMPTY_TEMPLATE_FORM);
    setFormErrors({});
    setModal({ type: 'template-create' });
  }

  function openEditTemplate(t) {
    const [start_time, end_time] = splitTimeFrame(t.time_frame);
    setTplForm({
      day_of_week: t.day_of_week,
      shift: t.shift || 'morning',
      start_time, end_time,
      location_id: t.location?.id || '',
      custom_location_name: t.custom_location_name || '',
    });
    setFormErrors({});
    setModal({ type: 'template-edit', id: t.id });
  }

  async function saveTemplate() {
    const errs = {};
    if (!tplForm.start_time) errs.start_time = 'Chọn giờ bắt đầu';
    if (!tplForm.end_time) errs.end_time = 'Chọn giờ kết thúc';
    if (!tplForm.location_id && !tplForm.custom_location_name.trim()) errs.custom_location_name = 'Chọn cơ sở hoặc điền tên địa điểm';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const payload = {
      day_of_week: tplForm.day_of_week,
      shift: tplForm.shift,
      time_frame: joinTimeFrame(tplForm.start_time, tplForm.end_time),
      location_id: tplForm.location_id || null,
      custom_location_name: tplForm.location_id ? null : (tplForm.custom_location_name || null),
    };
    setSaving(true);
    try {
      if (modal.type === 'template-create') await adminApi.post('/schedule-templates', payload);
      else await adminApi.put(`/schedule-templates/${modal.id}`, payload);
      toast.success('Đã lưu lịch chuẩn');
      setModal(null);
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate(id) {
    if (!(await confirm('Xoá lịch chuẩn này?'))) return;
    try {
      await adminApi.delete(`/schedule-templates/${id}`);
      toast.success('Đã xoá');
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    }
  }

  async function generateToYearEnd() {
    const today = new Date();
    const from = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const to = `${today.getFullYear()}-12-31`;
    if (!(await confirm(`Sinh lịch từ hôm nay đến 31/12/${today.getFullYear()} theo ${templates.length} lịch chuẩn?`))) return;
    setGenerating(true);
    try {
      const r = await adminApi.post('/schedules/generate', { from, to });
      const { created, skipped } = r.data.data;
      toast.success(`Đã tạo ${created} lịch, bỏ qua ${skipped} lịch trùng`);
      fetchSchedules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sinh lịch thất bại');
    } finally {
      setGenerating(false);
    }
  }

  const isScheduleModal = modal?.type?.startsWith('schedule');
  const isTemplateModal = modal?.type?.startsWith('template');

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-blue">Lịch hoạt động</h1>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue">
            <button onClick={prevMonth} className="p-1 hover:text-yellow"><ChevronLeft size={18} /></button>
            <span>Tháng {month}/{year}</span>
            <button onClick={nextMonth} className="p-1 hover:text-yellow"><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open('/schedule', '_blank', 'noopener')}
            className="flex items-center gap-2 border border-blue text-blue px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue/10 transition-colors"
          >
            <Eye size={15} /> Xem như bạn đọc
          </button>
          <button onClick={openCreateSchedule} className="flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-light transition-colors">
            <Plus size={16} /> Thêm lịch
          </button>
        </div>
      </div>

      {/* Schedule list */}
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
                    <p className="text-muted text-xs">{SHIFT_LABELS[s.shift] || s.shift} · {s.location?.name || s.custom_location_name}</p>
                    {s.closed_reason && <p className="text-red-400 text-xs mt-0.5">{s.closed_reason}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEditSchedule(s)} className="p-2 text-blue hover:bg-blue/10 rounded-lg"><Pencil size={15} /></button>
                    <button onClick={() => deleteSchedule(s.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      {/* Weekly templates */}
      <div className="mt-10 bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-blue flex items-center gap-2">
              <Repeat size={17} /> Lịch chuẩn hàng tuần
            </h2>
            <p className="text-muted text-xs mt-0.5">Định nghĩa các ca mở cửa cố định theo thứ, rồi sinh lịch hàng loạt</p>
          </div>
          <div className="flex gap-2">
            <button onClick={openCreateTemplate} className="flex items-center gap-2 border border-blue text-blue px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue/10 transition-colors">
              <Plus size={15} /> Thêm ca chuẩn
            </button>
            <button
              onClick={generateToYearEnd}
              disabled={templates.length === 0 || generating}
              className="flex items-center gap-2 bg-yellow text-blue px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-dark transition-colors disabled:opacity-50"
            >
              <CalendarRange size={15} /> {generating ? 'Đang sinh lịch...' : 'Sinh lịch đến cuối năm'}
            </button>
          </div>
        </div>

        {templates.length === 0
          ? <p className="text-muted text-sm italic">Chưa có ca chuẩn nào — thêm ca chuẩn (VD: T7 sáng 08:00-11:00 Cơ sở 1) để dùng nút sinh lịch</p>
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2.5">
                  <span className="w-8 h-8 rounded-full bg-cream text-blue text-xs font-bold flex items-center justify-center shrink-0">
                    {weekdayName(t.day_of_week)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-blue">{t.time_frame} · {SHIFT_LABELS[t.shift] || t.shift}</p>
                    <p className="text-muted text-xs truncate">{t.location?.name || t.custom_location_name}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEditTemplate(t)} className="p-1.5 text-blue hover:bg-blue/10 rounded"><Pencil size={13} /></button>
                    <button onClick={() => deleteTemplate(t.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* ===== Schedule modal ===== */}
      {isScheduleModal && (
        <Modal title={modal.type === 'schedule-create' ? 'Thêm lịch' : 'Chỉnh sửa lịch'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {modal.type === 'schedule-create' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.multiDay}
                  onChange={(e) => setForm({ ...form, multiDay: e.target.checked })}
                  className="accent-blue"
                />
                <span className="text-sm text-blue font-medium">Thêm cho nhiều ngày</span>
              </label>
            )}

            {form.multiDay && modal.type === 'schedule-create' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Từ ngày" required>
                    <TextInput type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
                  </FormField>
                  <FormField label="Đến ngày" required>
                    <TextInput type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
                  </FormField>
                </div>
                <FormField label="Lặp vào các thứ" required>
                  <div className="flex gap-1.5 flex-wrap">
                    {WEEKDAYS.map((w) => {
                      const on = form.weekdays.includes(w.value);
                      return (
                        <button
                          key={w.value}
                          type="button"
                          onClick={() => setForm({
                            ...form,
                            weekdays: on ? form.weekdays.filter((x) => x !== w.value) : [...form.weekdays, w.value],
                          })}
                          className={`w-10 h-9 rounded-lg text-xs font-bold transition-colors ${
                            on ? 'bg-blue text-white' : 'border border-gray-200 text-muted hover:border-blue hover:text-blue'
                          }`}
                        >
                          {w.label}
                        </button>
                      );
                    })}
                  </div>
                  {previewDates.length > 0 && (
                    <p className="text-xs text-blue font-medium mt-1.5">
                      Sẽ tạo {previewDates.length} lịch{previewDates.length > 100 ? ' (vượt giới hạn 100!)' : ''}
                    </p>
                  )}
                </FormField>
              </>
            ) : (
              <FormField label="Ngày" required error={formErrors.date}>
                <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </FormField>
            )}

            <FormField label="Ca" required>
              <Select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}>
                <option value="morning">Sáng</option>
                <option value="afternoon">Chiều</option>
                <option value="evening">Tối</option>
              </Select>
            </FormField>

            <TimeFields value={form} onChange={setForm} errors={formErrors} />
            <LocationFields value={form} onChange={setForm} locations={locations} errors={formErrors} />

            {modal.type === 'schedule-edit' && (
              <>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_sudden_closed} onChange={(e) => setForm({ ...form, is_sudden_closed: e.target.checked })} className="accent-blue" />
                  <span className="text-sm text-blue font-medium">Đóng đột xuất</span>
                </label>
                {form.is_sudden_closed && (
                  <FormField label="Lý do">
                    <TextInput value={form.closed_reason} onChange={(e) => setForm({ ...form, closed_reason: e.target.value })} />
                  </FormField>
                )}
              </>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-muted hover:text-blue">Huỷ</button>
            <button onClick={saveSchedule} disabled={saving} className="flex items-center gap-2 bg-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-light disabled:opacity-50">
              <Check size={15} /> {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </Modal>
      )}

      {/* ===== Template modal ===== */}
      {isTemplateModal && (
        <Modal title={modal.type === 'template-create' ? 'Thêm ca chuẩn' : 'Chỉnh sửa ca chuẩn'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <FormField label="Thứ trong tuần" required>
              <div className="flex gap-1.5 flex-wrap">
                {WEEKDAYS.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => setTplForm({ ...tplForm, day_of_week: w.value })}
                    className={`w-10 h-9 rounded-lg text-xs font-bold transition-colors ${
                      tplForm.day_of_week === w.value ? 'bg-blue text-white' : 'border border-gray-200 text-muted hover:border-blue hover:text-blue'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="Ca" required>
              <Select value={tplForm.shift} onChange={(e) => setTplForm({ ...tplForm, shift: e.target.value })}>
                <option value="morning">Sáng</option>
                <option value="afternoon">Chiều</option>
                <option value="evening">Tối</option>
              </Select>
            </FormField>
            <TimeFields value={tplForm} onChange={setTplForm} errors={formErrors} />
            <LocationFields value={tplForm} onChange={setTplForm} locations={locations} errors={formErrors} />
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-muted hover:text-blue">Huỷ</button>
            <button onClick={saveTemplate} disabled={saving} className="flex items-center gap-2 bg-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-light disabled:opacity-50">
              <Check size={15} /> {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
