import clsx from 'clsx';
import React, { useState } from 'react';
import { CalendarItem, Event, RoomBooking } from '../type';
import { ItemType } from '../const';
import { Star } from 'lucide-react';

type Props = {
  item: CalendarItem;
}
const ItemInCalendar = ({ item }: Props) => {
  const [isShowTooltip, setIsShowTooltip] = useState(false);

  return (
    <div
      className={clsx('px-1 sm:px-1.5 py-0.5 rounded sm:rounded-full mb-1 flex items-center relative', {
        'bg-dark-grey': item.type !== ItemType.EVENT,
      })}
      style={{
        backgroundColor: item.type === ItemType.EVENT ? (item as Event).color || '#033b93' : 'var(--dark-grey-color)'
      }}
      onMouseEnter={() => setIsShowTooltip(true)}
      onMouseLeave={() => setIsShowTooltip(false)}
    >
      {item.type === ItemType.EVENT && (item as Event).featured && (
        <Star className="h-2 sm:h-2.5 w-2 sm:w-2.5 mr-0.5 sm:mr-1 text-yellow-300 fill-current flex-shrink-0" />
      )}
      <span className='text-[9px] font-light text-white line-clamp-1'>
        {item.type === ItemType.EVENT
          ? (item as Event).title
          : `Mượn phòng`
        }
      </span>
      <span
        className={clsx('absolute z-10 top-[-200%] whitespace-nowrap text-sm text-white shadow-xl rounded-md px-3 py-1 border-2 border-white', {
          'hidden': !isShowTooltip,
          'block': isShowTooltip,
        })}
        style={{
          backgroundColor: item.type === ItemType.EVENT ? (item as Event).color || '#033b93' : 'var(--dark-grey-color)'
        }}
      >{item.type === ItemType.EVENT
        ? (item as Event).title
        : `Mượn phòng: ${(item as RoomBooking).fullName}`
        }</span>
    </div>
  )
}

export default ItemInCalendar;