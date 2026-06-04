"use client";

import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import { ROOM_TYPE_OPTIONS } from './const';
import useRoomBooking from './useRoomBooking';
import { RecaptchaV3 } from '@/components/RecaptchaV3';

export default function RoomBookingPage() {
  const { formData, isSubmitting, validationErrors, handleInputChange, handleSubmit, getMinDateCanBorrow, getMaxDateCanBorrow } = useRoomBooking();
  return (
    <div className={clsx(styles.roomBookingContainer)}>
      <h1 className="text-3xl lg:text-5xl font-bold text-primary-blue p-10 sm:p-20">
        Đăng ký mượn phòng thư viện
      </h1>

      <div className='bg-[#F2F5FA] py-10'>
        <form className="space-y-6 max-w-3xl mx-auto px-4 sm:px-0" onSubmit={handleSubmit}>
          <div className='flex'>
            <p className={clsx(styles.label, styles.labelInput)}>
              Họ và tên:
            </p>
            <div className="w-full relative">
              <input
                id='fullName'
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                type="text"
                className="w-full border-b outline-none bg-transparent py-1"
              />
              <p className="absolute text-red-500 text-xs font-bold">{validationErrors.fullName}</p>
            </div>
          </div>

          <div className="flex">
            <p className={clsx(styles.label, styles.labelInput)}>
              Số thẻ thư viện:
            </p>
            <div className="w-full relative">
              <input
                id='cardNumber'
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                type="text"
                className="w-full border-b outline-none bg-transparent py-1"
              />
              <p className="absolute text-red-500 text-xs font-bold">{validationErrors.cardNumber}</p>
            </div>
          </div>

          <div className="flex">
            <p className={clsx(styles.label, styles.labelInput)}>
              Địa chỉ email:
            </p>
            <div className="w-full relative">
              <input
                id='email'
                onChange={(e) => handleInputChange('email', e.target.value)}
                type="email"
                className="w-full border-b outline-none bg-transparent py-1"
              />
              <p className="absolute text-red-500 text-xs font-bold">{validationErrors.email}</p>
            </div>
          </div>

          <div className="flex">
            <p className={clsx(styles.label, styles.labelInput)}>
              Số điện thoại:
            </p>
            <div className="w-full relative">
              <input
                id='phone'
                onChange={(e) => handleInputChange('phone', e.target.value)}
                type="tel"
                className="w-full border-b outline-none bg-transparent py-1"
              />
              <p className="absolute text-red-500 text-xs font-bold">{validationErrors.phone}</p>
            </div>
          </div>

          <div className="flex">
            <p className={clsx(styles.label, styles.labelInput)}>
              Số người mượn:
            </p>
            <div className="w-full relative">
              <input
                id='numberOfPeople'
                onChange={(e) => handleInputChange('numberOfPeople', e.target.value)}
                type="number"
                min={1}
                className="w-full border-b outline-none bg-transparent py-1"
              />
              <p className="absolute text-red-500 text-xs font-bold">{validationErrors.numberOfPeople}</p>
            </div>
          </div>

          <div className="flex">
            <p className={styles.label}>
              Loại phòng:
            </p>
            <select
              id='roomType'
              onChange={(e) => handleInputChange('roomType', e.target.value)}
              className="text-xs sm:text-sm w-full border px-1 sm:px-3 py-1 sm:py-2 bg-transparent outline-none"
            >
              {ROOM_TYPE_OPTIONS.map((room) => (<option key={room.value} value={room.value}>{room.label}</option>))}
            </select>
          </div>

          <div className="flex">
            <p className={styles.label}>
              Thời gian mượn:
            </p>
            <div className="w-full flex justify-between gap-1 sm:gap-5">
              <div className="w-full relative">

                <input
                  id='bookingDate'
                  onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                  type="date"
                  min={getMinDateCanBorrow()}
                  max={getMaxDateCanBorrow()}
                  className="w-full text-xs sm:text-sm border px-1 sm:px-3 py-1 sm:py-2 bg-transparent outline-none"
                />
                <p className="absolute text-red-500 text-xs font-bold">{validationErrors.bookingDate}</p>
              </div>
              <div className="flex items-center gap-2 relative">
                <input
                  id='startTime'
                  type="time"
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className='text-xs sm:text-sm border px-1 sm:px-3 py-1 sm:py-2 bg-transparent outline-none'
                />
                <p>~</p>
                <input
                  id='endTime'
                  type="time"
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className='text-xs sm:text-sm border px-1 sm:px-3 py-1 sm:py-2 bg-transparent outline-none'
                />
                <p className="absolute text-red-500 text-xs font-bold bottom-[-16px]">{validationErrors.startTime}</p>
              </div>
            </div>
          </div>

          <div className="flex">
            <p className={styles.label}>
              Mục đích mượn
              <br />
              và lời nhắn (nếu có):
            </p>
            <div className="w-full relative">
              <textarea
                id='note'
                onChange={(e) => handleInputChange('note', e.target.value)}
                rows={4}
                className="w-full border px-3 py-2 bg-transparent resize-none outline-none"
              />
              <p className="absolute text-red-500 text-xs font-bold">{validationErrors.note}</p>
            </div>
          </div>

          <div className="flex justify-end items-start space-x-2">
            <div className="relative">
              <p className="text-xs text-[#3F3F3F] font-light">
                Tôi đồng ý với các{" "}
                <a
                  target='_blank'
                  href="/services/room-booking/policy"
                  className="text-primary-yellow hover:text-primary-yellow-hover"
                >
                  cam kết về sử dụng phòng
                </a>{" "}
                của Thư viện Dương Liễu
              </p>
              <p className="absolute text-red-500 text-xs font-bold">{validationErrors.agreeTerms}</p>
            </div>
            <input id='agreeTerms' type="checkbox" className="mt-0.5" checked={formData.agreeTerms} onChange={(e) => handleInputChange('agreeTerms', e.target.checked)} />
          </div>

          <div className="pl-0 sm:pl-[200px]">
            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-primary-yellow hover:bg-primary-blue text-white font-extralight py-3 rounded-full transition"
            >
              ĐĂNG KÝ
            </button>
          </div>
        </form>
        {/* reCAPTCHA v3 - Invisible, loaded automatically */}
        <RecaptchaV3
          onToken={() => { }}
          action="room_booking"
        />
      </div>
    </div>
  );
}
