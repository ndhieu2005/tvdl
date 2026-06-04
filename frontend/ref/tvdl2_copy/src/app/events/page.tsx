'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star } from 'lucide-react';
import { DECEMBER_INDEX, ItemType, JANUARY_INDEX, MONTH_NAMES, SUNDAY_INDEX, WEEKDAY_LABELS } from './const';
import styles from './styles.module.css';
import clsx from 'clsx';
import Loading from './_components/Loading';
import Empty from './_components/Empty';
import { CalendarItem, Event, RoomBooking } from './type';
import shortArrowIcon from './assets/blue_arrow_icon.svg';
import mapsIcon from './assets/maps_icon.svg';
import timeIcon from './assets/time_icon.svg';
import Image from 'next/image';
import ItemInCalendar from './_components/ItemInCalendar';
import { getRoomNameByType } from '../services/room-booking/const';
import { ROOM_BOOKING_STATUS } from '../api/services/room-booking/const';

export default function EventsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState<Event[]>([]);
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // format: yyyy-MM-dd
  const [selectedItems, setSelectedItems] = useState<CalendarItem[]>([]);
  const [calendarHeight, setCalendarHeight] = useState<number>(0);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  const nextMonth = () => {
    if (currentMonth === DECEMBER_INDEX) {
      setCurrentMonth(JANUARY_INDEX);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    setSelectedItems([]);
  };

  const prevMonth = () => {
    if (currentMonth === JANUARY_INDEX) {
      setCurrentMonth(DECEMBER_INDEX);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    setSelectedItems([]);
  };

  const getMonthNameByMonthIndex = (month: number) => {
    if (month < JANUARY_INDEX) return MONTH_NAMES[DECEMBER_INDEX];
    if (month > DECEMBER_INDEX) return MONTH_NAMES[JANUARY_INDEX];
    return MONTH_NAMES[month];
  };

  useEffect(() => {
    if (calendarRef.current) {
      setCalendarHeight(calendarRef.current.offsetHeight);
    }
  }, [events, roomBookings]);

  // Combine events and room bookings for current month
  const currentMonthEvents: CalendarItem[] = useMemo(() => {
    return [
      ...events.filter((event) => {
        const eventDate = new Date(event.eventDate);
        return (
          eventDate.getMonth() === currentMonth &&
          eventDate.getFullYear() === currentYear
        );
      }),
      ...roomBookings.filter((booking) => {
        const bookingDate = new Date(booking.bookingDate);
        return (
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear
        );
      }),
    ];
  }, [events, roomBookings, currentYear, currentMonth]);

  // Generate calendar days
  const calendarGenerated = useMemo(() => {
    const days = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const startingDayOfWeekIndex = firstDay.getDay(); // index 0 = sunday, index 6 = saturday

    // Empty cells for days before month starts
    // Customize calendar start from MONDAY
    if (startingDayOfWeekIndex === SUNDAY_INDEX) {
      days.push(null, null, null, null, null, null);
    } else {
      for (let i = 0; i < startingDayOfWeekIndex - 1; i++) {
        days.push(null);
      }
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      days.push(day);
    }

    return days;
  }, [currentYear, currentMonth]);

  const getDateStringByDayNumber = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
  };

  const getEventsOfDay = (day: number): CalendarItem[] => {
    if (!day) return [];
    const selectedDateString = getDateStringByDayNumber(day);

    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.eventDate).toISOString().split("T")[0];
      return eventDate === selectedDateString;
    });

    const dayBookings = roomBookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate)
        .toISOString()
        .split("T")[0];
      return bookingDate === selectedDateString;
    });

    return [...dayEvents, ...dayBookings];
  };

  // Handle day click
  const handleDayClick = (day: number | null, isSelected: boolean) => {
    if (!day) return;
    if (isSelected) {
      setSelectedDate(null);
      setSelectedItems([]);
      return;
    }
    const selectedDateString = getDateStringByDayNumber(day);
    const dayEvents = getEventsOfDay(day);
    setSelectedDate(selectedDateString);
    setSelectedItems(dayEvents);
  };

  // Use effect to fetch data when month/year changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch events
        const eventsResponse = await fetch(
          `/api/public/events?status=SCHEDULED&month=${currentMonth + 1
          }&year=${currentYear}`
        );
        const eventsData = await eventsResponse.json();

        // Fetch APPROVED room bookings
        const bookingsResponse = await fetch(`/api/services/room-booking?status=${ROOM_BOOKING_STATUS.APPROVED}&month=${currentMonth + 1}&year=${currentYear}`);
        const bookingsData = await bookingsResponse.json();

        if (eventsData.success) {
          setEvents(
            eventsData.data.map((event: Event) => ({
              ...event,
              type: ItemType.EVENT,
            }))
          );
        }

        if (bookingsData.success) {
          setRoomBookings(
            bookingsData.data.map((booking: RoomBooking) => ({
              ...booking,
              type: ItemType.BOOKING,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentMonth, currentYear]);

  const renderEventList = () => {
    if (loading) return <Loading />;
    const data = selectedDate ? selectedItems : currentMonthEvents;
    if (data.length === 0) return <Empty />;
    return data.map((item) => (
      <div
        key={`${item.type}-${item.id}`}
        className="pl-4 transition-all"
        style={{
          borderLeftWidth: "6px",
          borderLeftColor:
            item.type === ItemType.EVENT
              ? (item as Event).color || "#033b93"
              : "",
        }}
      >
        {item.type === ItemType.EVENT ? (
          <>
            <h4 className="font-bold text-[#FFBF00] mb-1 flex items-center">
              {(item as Event).featured && (
                <Star className="h-4 w-4 mr-2 text-[#FFBF00] fill-current flex-shrink-0" />
              )}
              {(item as Event).title}
              {(item as Event).featured && (
                <span className="ml-2 px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded-full font-medium flex-shrink-0">
                  Nổi bật
                </span>
              )}
            </h4>
            <div className="space-y-1 text-xs sm:text-sm text-[#3F3F3F]">
              <div className="flex font-light">
                <Image
                  src={mapsIcon}
                  alt="maps-icon"
                  className="h-3 w-auto mt-0.5 sm:mt-1 mr-2"
                />
                Địa điểm: {(item as Event).location}
              </div>
              <div className="flex items-center font-semibold">
                <Image
                  src={timeIcon}
                  alt="time-icon"
                  className="h-2.5 sm:h-3 w-auto mr-1"
                />
                {new Date((item as Event).eventDate).toLocaleDateString(
                  "vi-VN"
                )}{" "}
                - {(item as Event).startTime}
                {(item as Event).endTime && ` - ${(item as Event).endTime}`}
              </div>
              {(item as Event).maxParticipants && (
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {(item as Event).currentParticipants}/
                  {(item as Event).maxParticipants} người tham gia
                </div>
              )}
            </div>
            {(item as Event).description && (
              <p className="text-xs sm:text-sm text-[#3F3F3F] mt-2">
                {(item as Event).description}
              </p>
            )}
          </>
        ) : (
          // Room booking display
          <>
              <h4 className="font-medium text-[#3F3F3F] mb-1">Người mượn phòng: {(item as RoomBooking).fullName}</h4>
              <div className="space-y-1 text-xs sm:text-sm text-[#3F3F3F] font-light">
              <div className="flex">
                <Image
                  src={mapsIcon}
                    alt='maps-icon'
                  className="h-3 w-auto mt-1 mr-2"
                />
                  Phòng: {getRoomNameByType((item as RoomBooking).roomType)}
                </div>
                <div className="flex items-center">
                  <Image
                    src={timeIcon}
                    alt='time-icon'
                    className="h-3 w-auto mr-1"
                  />
                  {new Date((item as RoomBooking).bookingDate).toLocaleDateString('vi-VN')} | {(item as RoomBooking).timeSlot}
                </div>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {(item as RoomBooking).participants} người
                </div>
              </div>
              <div className="flex items-center">
                <Image
                  src={timeIcon}
                  alt="time-icon"
                  className="h-3 w-auto mr-1"
                />
                {new Date((item as RoomBooking).bookingDate).toLocaleDateString(
                  "vi-VN"
                )}{" "}
                - {(item as RoomBooking).timeSlot}
              </div>
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {(item as RoomBooking).participants} người
              </div>
            <p className="text-xs sm:text-sm text-[#3F3F3F] mt-1 font-semibold">
              Mục đích: {(item as RoomBooking).purpose}
            </p>
            <p className="mt-1 w-fit px-2 py-1 text-xs rounded-full bg-dark-grey text-white">
              Mượn phòng
            </p>
          </>
        )}
      </div>
    ));
  };

  return (
    <div className={clsx(styles.eventsContainer, "py-5 sm:py-12")}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <h1 className="text-3xl sm:text-5xl font-semibold text-primary-blue mb-6 sm:mb-20 pl-5 sm:pl-10">
          Lịch hoạt động
        </h1>

        <div className="flex flex-col sm:flex-row gap-8">
          {/* Calendar */}
          <div className="flex-[2] h-fit" ref={calendarRef}>
            <Card className={styles.cardCustom}>
              <CardHeader className="text-[#2B2B2B] mb-5 sm:mb-3 p-0 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-base sm:text-2xl">
                    {getMonthNameByMonthIndex(currentMonth)} | {currentYear}
                  </CardTitle>
                  <div className="flex justify-between gap-4 w-40 sm:w-52 select-none font-light">
                    <div
                      className="flex items-center gap-1 cursor-pointer hover:text-primary-blue"
                      onClick={prevMonth}
                    >
                      <Image
                        src={shortArrowIcon}
                        alt="arrow-icon"
                        className="h-1.5 sm:h-2 w-auto text-primary-blue"
                      />
                      <p className="text-xs font-semibold sm:text-base pb-0.5 border-b border-[#003E9E] whitespace-nowrap">
                        {getMonthNameByMonthIndex(currentMonth - 1)}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1 cursor-pointer justify-end hover:text-primary-blue"
                      onClick={nextMonth}
                    >
                      <p className="text-xs font-semibold sm:text-base pb-0.5 border-b border-[#003E9E] whitespace-nowrap">
                        {getMonthNameByMonthIndex(currentMonth + 1)}
                      </p>
                      <Image
                        src={shortArrowIcon}
                        alt="arrow-icon"
                        className="h-1.5 sm:h-2 w-auto rotate-180"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 pt-0">
                <div className="grid grid-cols-7 gap-1 mb-1 sm:mb-2 ">
                  {WEEKDAY_LABELS.map((day) => (
                    <div
                      key={day}
                      className={clsx("font-bold text-[8px] sm:text-sm", {
                        "text-primary-blue": day === "THỨ 7",
                        "text-primary-yellow": day === "CHỦ NHẬT",
                        "text-[#2B2B2B]": !["THỨ 7", "CHỦ NHẬT"].includes(day),
                      })}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5 sm:gap-1.5">
                  {calendarGenerated.map((day, index) => {
                    const dayItems = day ? getEventsOfDay(day) : [];
                    const dateStr = day ? getDateStringByDayNumber(day) : "";
                    const isSelected = selectedDate === dateStr;
                    return (
                      <div
                        key={index}
                        className={clsx(
                          `min-h-[50px] sm:min-h-[80px] p-0.5 sm:p-1 border rounded sm:rounded-lg cursor-pointer transition-all`,
                          styles.calenderCell,
                          {
                            [styles.calenderSelected]: isSelected,
                          }
                        )}
                        onClick={() => handleDayClick(day, isSelected)}
                      >
                        {day && (
                          <>
                            <div className="text-xs sm:text-sm font-medium mb-0 sm:mb-1 pl-0.5 sm:pl-1">
                              {day}
                            </div>
                            {dayItems.map((item) => (
                              <ItemInCalendar
                                key={`${item.type}-${item.id}`}
                                item={item}
                              />
                            ))}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events list */}
          <div className="flex-1" style={{ height: calendarHeight || "auto" }}>
            <Card className={clsx(styles.cardCustom, "h-full flex flex-col")}>
              <CardHeader className="bg-white p-0 sm:p-6 pb-4">
                <CardTitle className="flex items-center justify-between text-xl sm:text-2xl pb-2 border-b-2 sm:border-b-4 border-[#424241]">
                  <span className="text-[#2B2B2B]">
                    {selectedDate
                      ? `Lịch ngày ${new Date(selectedDate).toLocaleDateString(
                        "vi-VN"
                      )}`
                      : "Lịch cả tháng"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-0 sm:p-6 sm:pt-0 overflow-y-auto flex-1">
                {renderEventList()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
