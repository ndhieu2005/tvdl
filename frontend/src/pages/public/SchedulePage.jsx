import { useState, useEffect, useRef, useMemo } from 'react';
import { Star } from 'lucide-react';
import { api } from '../../lib/api';

function formatTimeRange(ev) {
  const fmt = (d) => new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return ev.end_datetime ? `${fmt(ev.event_datetime)}–${fmt(ev.end_datetime)}` : fmt(ev.event_datetime);
}

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];
const WEEKDAY_LABELS = ['THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7', 'CHỦ NHẬT'];
const SHIFT_LABELS = { morning: 'Ca sáng', afternoon: 'Ca chiều', evening: 'Ca tối' };

// "Cơ sở 1 — 18/56 Đường Thống Nhất..." hoặc tên địa điểm tự nhập
function formatLocation(loc, customName) {
  if (!loc) return customName || '';
  return loc.address ? `${loc.name} — ${loc.address}` : loc.name;
}

const TODAY = new Date();

function ShortArrowRightIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12.69 8.88" fill="currentColor" className={className}>
      <path d="m12.69,4.48c0-.1-.02-.21-.12-.3-.17-.17-.33-.34-.5-.5-1.17-1.19-2.33-2.37-3.5-3.56-.37-.38-.95.2-.58.58.17.17.33.34.5.5.94.95,1.87,1.9,2.81,2.85H.4c-.53,0-.53.82,0,.82h10.88c-1.11,1.1-2.23,2.2-3.35,3.3-.38.37.2.95.58.58.17-.17.34-.34.51-.51,1.18-1.17,2.36-2.33,3.54-3.49.07-.07.11-.16.11-.25,0-.01,0-.02,0-.03Z"/>
    </svg>
  );
}

export default function SchedulePage() {
  const [month, setMonth] = useState(TODAY.getMonth()); // 0-indexed
  const [year, setYear] = useState(TODAY.getFullYear());
  const [schedules, setSchedules] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // 'yyyy-MM-dd'
  const calendarRef = useRef(null);
  const [calendarHeight, setCalendarHeight] = useState(0);

  useEffect(() => {
    if (calendarRef.current) {
      setCalendarHeight(calendarRef.current.offsetHeight);
    }
  }, [schedules]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch pattern: bật loading sync khi đổi tháng
    setLoading(true);
    Promise.all([
      api.get(`/schedules?month=${month + 1}&year=${year}`),
      api.get(`/events?month=${month + 1}&year=${year}`),
    ])
      .then(([rs, re]) => {
        setSchedules(rs.data.data || []);
        setEvents(re.data.data || []);
      })
      .catch(() => { setSchedules([]); setEvents([]); })
      .finally(() => setLoading(false));
  }, [month, year]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDate(null);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDate(null);
  }

  function getMonthName(idx) {
    if (idx < 0) return MONTH_NAMES[11];
    if (idx > 11) return MONTH_NAMES[0];
    return MONTH_NAMES[idx];
  }

  const calendarDays = useMemo(() => {
    const days = [];
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    // Shift to Monday-start grid
    if (firstDay === 0) {
      for (let i = 0; i < 6; i++) days.push(null);
    } else {
      for (let i = 0; i < firstDay - 1; i++) days.push(null);
    }
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= totalDays; d++) days.push(d);
    return days;
  }, [year, month]);

  const schedulesByDay = useMemo(() => {
    const map = {};
    schedules.forEach((s) => {
      const d = new Date(s.date).getDate();
      if (!map[d]) map[d] = [];
      map[d].push(s);
    });
    return map;
  }, [schedules]);

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const d = new Date(ev.event_datetime).getDate();
      if (!map[d]) map[d] = [];
      map[d].push(ev);
    });
    return map;
  }, [events]);

  function getDateString(day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function handleDayClick(day, isSelected) {
    if (!day) return;
    setSelectedDate(isSelected ? null : getDateString(day));
  }

  const selectedDaySchedules = useMemo(() => {
    if (!selectedDate) return null;
    const day = parseInt(selectedDate.split('-')[2], 10);
    return schedulesByDay[day] || [];
  }, [selectedDate, schedulesByDay]);

  const displaySchedules = selectedDate ? selectedDaySchedules : schedules;

  const displayEvents = useMemo(() => {
    if (!selectedDate) return events;
    const day = parseInt(selectedDate.split('-')[2], 10);
    return eventsByDay[day] || [];
  }, [selectedDate, events, eventsByDay]);

  const displayTitle = selectedDate
    ? `Lịch ngày ${selectedDate.split('-').reverse().join('/')}`
    : 'Lịch cả tháng';

  return (
    <div className="min-h-[calc(100vh-64px)] py-5 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-5xl font-semibold text-blue mb-6 sm:mb-20 pl-5 sm:pl-10">
          Lịch hoạt động
        </h1>

        <div className="flex flex-col sm:flex-row gap-8">
          {/* Calendar */}
          <div className="flex-[2] h-fit" ref={calendarRef}>
            <div className="border-0 sm:border sm:border-[#424241]">
              {/* Month header */}
              <div className="p-0 sm:p-6 mb-5 sm:mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-2xl font-medium text-[#2B2B2B]">
                    {MONTH_NAMES[month]} | {year}
                  </span>
                  <div className="flex justify-between gap-4 w-40 sm:w-52 select-none font-light">
                    <button
                      className="flex items-center gap-1 cursor-pointer hover:text-blue"
                      onClick={prevMonth}
                    >
                      <ShortArrowRightIcon className="h-1.5 sm:h-2 w-auto rotate-180 text-blue" />
                      <span className="text-xs font-semibold sm:text-base pb-0.5 border-b border-blue whitespace-nowrap">
                        {getMonthName(month - 1)}
                      </span>
                    </button>
                    <button
                      className="flex items-center gap-1 cursor-pointer justify-end hover:text-blue"
                      onClick={nextMonth}
                    >
                      <span className="text-xs font-semibold sm:text-base pb-0.5 border-b border-blue whitespace-nowrap">
                        {getMonthName(month + 1)}
                      </span>
                      <ShortArrowRightIcon className="h-1.5 sm:h-2 w-auto text-blue" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar content — mobile ẩn grid, chỉ hiện danh sách bên dưới */}
              <div className="hidden sm:block p-0 sm:p-6 pt-0">
                <div className="grid grid-cols-7 gap-1 mb-1 sm:mb-2">
                  {WEEKDAY_LABELS.map((day) => (
                    <div
                      key={day}
                      className={`font-bold text-[8px] sm:text-sm ${
                        day === 'THỨ 7' ? 'text-blue' :
                        day === 'CHỦ NHẬT' ? 'text-yellow' :
                        'text-[#2B2B2B]'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar cells */}
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1.5">
                  {calendarDays.map((day, index) => {
                    const dateStr = day ? getDateString(day) : '';
                    const isSelected = selectedDate === dateStr;
                    const isToday =
                      day &&
                      year === TODAY.getFullYear() &&
                      month === TODAY.getMonth() &&
                      day === TODAY.getDate();
                    const daySchedules = day ? (schedulesByDay[day] || []) : [];
                    const dayEvents = day ? (eventsByDay[day] || []) : [];

                    return (
                      <div
                        key={index}
                        className={`relative group min-h-[50px] sm:min-h-[80px] p-0.5 sm:p-1 border rounded cursor-pointer transition-all ${
                          day ? '' : 'opacity-0 pointer-events-none'
                        } ${
                          isSelected ? 'bg-white' : 'bg-[#F9F3E1] hover:bg-[#f9efd4]'
                        } border-[#424241] ${isToday ? 'ring-2 ring-blue ring-inset rounded' : ''}`}
                        onClick={() => handleDayClick(day, isSelected)}
                      >
                        {day && (
                          <>
                            <div className="text-xs sm:text-sm font-medium mb-0 sm:mb-1 pl-0.5 sm:pl-1 text-[#2B2B2B]">
                              {day}
                            </div>
                            <div className="space-y-0.5">
                              {daySchedules.map((s) => (
                                <div
                                  key={s.id}
                                  className="text-[7px] sm:text-[9px] leading-tight px-0.5 sm:px-1 py-0.5 rounded truncate text-white font-medium"
                                  style={{ backgroundColor: s.location?.color_code || '#1B3F8B' }}
                                >
                                  Mở cửa {s.location?.name || s.custom_location_name}
                                </div>
                              ))}
                              {dayEvents.map((ev) => (
                                <div
                                  key={`ev-${ev.id}`}
                                  className={`text-[7px] sm:text-[9px] leading-tight px-0.5 sm:px-1 py-0.5 rounded truncate font-medium ${
                                    ev.is_featured ? 'text-[#2B2B2B] font-bold' : 'text-white'
                                  }`}
                                  style={{ backgroundColor: ev.is_featured ? '#F5C000' : (ev.color || '#1B3F8B') }}
                                >
                                  {ev.is_featured && '★ '}{ev.name}
                                </div>
                              ))}
                            </div>

                            {/* Tooltip chi tiết khi hover (desktop) */}
                            {(daySchedules.length > 0 || dayEvents.length > 0) && (
                              <div className="hidden group-hover:block absolute z-20 top-full left-1/2 -translate-x-1/2 mt-1 w-max max-w-[240px] bg-white border border-[#424241] rounded p-2.5 text-left shadow-lg pointer-events-none">
                                {daySchedules.map((s) => (
                                  <div key={s.id} className="text-[11px] leading-snug text-[#2B2B2B] py-0.5">
                                    <span className="font-bold text-blue">{s.time_frame} ({SHIFT_LABELS[s.shift] || s.shift})</span>
                                    {' · '}{formatLocation(s.location, s.custom_location_name)}
                                    {s.is_sudden_closed && <span className="text-red-500 font-medium"> — đóng đột xuất</span>}
                                  </div>
                                ))}
                                {dayEvents.map((ev) => (
                                  <div key={`ev-${ev.id}`} className="text-[11px] leading-snug text-[#2B2B2B] py-0.5">
                                    {ev.is_featured && <span className="text-yellow-dark">★ </span>}
                                    <span className="font-bold text-blue">{ev.name}</span>
                                    {' · '}{formatTimeRange(ev)}
                                    {(ev.location?.name || ev.custom_location_name) && <> · {ev.location?.name || ev.custom_location_name}</>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule list — cao bằng calendar trên desktop, tự do trên mobile */}
          <div
            className="flex-1 sm:h-[var(--cal-h)]"
            style={{ '--cal-h': calendarHeight ? `${calendarHeight}px` : 'auto' }}
          >
            <div className="border-0 sm:border sm:border-[#424241] h-full flex flex-col">
              <div className="bg-white p-0 sm:p-6 pb-4">
                <h2 className="text-xl sm:text-2xl pb-2 border-b-2 sm:border-b-4 border-[#424241] font-medium text-[#2B2B2B]">
                  {displayTitle}
                </h2>
              </div>
              <div className="space-y-4 p-0 sm:p-6 sm:pt-0 overflow-y-auto flex-1">
                {loading && (
                  <div className="space-y-4 py-2 animate-pulse">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="pl-4 border-l-[6px] border-[#F2EAD3]">
                        <div className="h-3 w-20 bg-[#F2EAD3] rounded mb-2" />
                        <div className="h-4 w-40 bg-[#F2EAD3] rounded mb-2" />
                        <div className="h-3 w-28 bg-[#F2EAD3] rounded" />
                      </div>
                    ))}
                  </div>
                )}
                {!loading && displaySchedules.length === 0 && displayEvents.length === 0 && (
                  <p className="text-[#9CA3AF] text-center py-8 italic">Không có lịch</p>
                )}
                {!loading && displayEvents.map((ev) => (
                  <div
                    key={`ev-${ev.id}`}
                    className={`pl-4 transition-all ${ev.is_featured ? 'bg-yellow/10 py-2 rounded-r' : ''}`}
                    style={{
                      borderLeftWidth: '6px',
                      borderLeftColor: ev.is_featured ? '#F5C000' : (ev.color || '#1B3F8B'),
                    }}
                  >
                    <h4 className="font-bold text-blue mb-1 flex items-center gap-1.5 flex-wrap">
                      {ev.name}
                      {ev.is_featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-yellow text-[#2B2B2B] px-1.5 py-0.5 rounded">
                          <Star size={10} className="fill-[#2B2B2B]" /> Nổi bật
                        </span>
                      )}
                    </h4>
                    <div className="text-xs sm:text-sm text-[#3F3F3F] font-light">
                      {formatTimeRange(ev)} · {formatLocation(ev.location, ev.custom_location_name)}
                    </div>
                    {ev.description && (
                      <p className="text-xs text-[#9CA3AF] mt-0.5 line-clamp-2">{ev.description}</p>
                    )}
                  </div>
                ))}
                {!loading && displaySchedules.map((s) => (
                  <div
                    key={s.id}
                    className="pl-4 transition-all"
                    style={{
                      borderLeftWidth: '6px',
                      borderLeftColor: s.location?.color_code || '#1B3F8B',
                    }}
                  >
                    <h4 className="font-bold text-yellow mb-1">
                      {s.time_frame} — {SHIFT_LABELS[s.shift] || s.shift}
                    </h4>
                    <div className="text-xs sm:text-sm text-[#3F3F3F] font-light">
                      {formatLocation(s.location, s.custom_location_name)}
                    </div>
                    {s.is_sudden_closed && (
                      <p className="text-xs text-red-500 font-medium mt-0.5">
                        ⚠ {s.closed_reason || 'Đột xuất đóng cửa'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
