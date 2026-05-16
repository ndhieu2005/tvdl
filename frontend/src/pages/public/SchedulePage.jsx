import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';

const DAY_LABELS = ['THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7', 'CHỦ NHẬT'];

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const totalDays = new Date(year, month, 0).getDate();
  // Shift so Monday=0
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const cells = Array(startOffset).fill(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function SchedulePage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/schedules?month=${month}&year=${year}`)
      .then((r) => setSchedules(r.data.data || []))
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false));
  }, [month, year]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const cells = buildCalendarDays(year, month);

  const schedulesByDay = {};
  schedules.forEach((s) => {
    const d = new Date(s.date).getDate();
    if (!schedulesByDay[d]) schedulesByDay[d] = [];
    schedulesByDay[d].push(s);
  });

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto">
      <h1 className="text-page font-bold text-blue mb-8 italic">Lịch hoạt động</h1>

      <div className="flex gap-6">
        {/* Calendar */}
        <div className="flex-1 border border-gray-200 rounded-xl p-6">
          {/* Month header */}
          <div className="flex items-center justify-between mb-6">
            <span className="font-bold text-xl text-blue">
              Tháng {month} | {year}
            </span>
            <div className="flex gap-4 text-sm font-semibold">
              <button onClick={prevMonth} className="flex items-center gap-1 text-blue hover:text-yellow transition-colors">
                <ChevronLeft size={16} /> Tháng {month === 1 ? 12 : month - 1}
              </button>
              <button onClick={nextMonth} className="flex items-center gap-1 text-blue hover:text-yellow transition-colors">
                Tháng {month === 12 ? 1 : month + 1} <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_LABELS.map((d, i) => (
              <div key={d} className={`text-center text-xs font-semibold py-1 ${i === 6 ? 'text-yellow' : 'text-blue'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              const daySchedules = day ? (schedulesByDay[day] || []) : [];
              const isToday = day && year === now.getFullYear() && month === now.getMonth() + 1 && day === now.getDate();
              return (
                <div
                  key={i}
                  className={`min-h-[72px] rounded-lg p-1.5 ${
                    day ? 'bg-cream' : 'bg-transparent'
                  } ${isToday ? 'ring-2 ring-blue' : ''}`}
                >
                  {day && (
                    <>
                      <span className={`text-xs font-semibold ${i % 7 === 6 ? 'text-yellow' : 'text-blue'}`}>{day}</span>
                      <div className="mt-1 space-y-0.5">
                        {daySchedules.map((s) => (
                          <div
                            key={s.id}
                            className="text-[9px] leading-tight px-1 py-0.5 rounded truncate text-white font-medium"
                            style={{ backgroundColor: s.location?.color_code || '#1B3F8B' }}
                            title={`${s.shift} ${s.time_frame} — ${s.location?.name || s.custom_location_name}`}
                          >
                            {s.time_frame}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-blue text-lg pb-3 border-b-2 border-blue mb-4">Lịch cả tháng</h2>
          {loading && <p className="text-muted text-sm text-center py-8">Đang tải...</p>}
          {!loading && schedules.length === 0 && (
            <p className="text-muted text-sm text-center py-8 italic">Không có sự kiện</p>
          )}
          {!loading && schedules.map((s) => (
            <div key={s.id} className="mb-4 border-l-4 pl-3" style={{ borderColor: s.location?.color_code || '#1B3F8B' }}>
              <p className="text-xs text-muted">{new Date(s.date).toLocaleDateString('vi-VN')}</p>
              <p className="text-sm font-semibold text-blue">{s.time_frame} — {s.shift}</p>
              <p className="text-xs text-dark">{s.location?.name || s.custom_location_name}</p>
              {s.is_sudden_closed && (
                <p className="text-xs text-red-500 font-medium mt-0.5">⚠ {s.closed_reason || 'Đột xuất đóng cửa'}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
