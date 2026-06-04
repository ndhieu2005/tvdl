'use client';

import React from 'react';
import Image from 'next/image';
import mapsIcon from './assets/maps_icon.svg';
import timeIcon from './assets/time_icon.svg';

export default function RoomBookingSuccessPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center mt-10 md:mt-0 px-4">
      <div className="w-full max-w-5xl shadow-lg overflow-hidden">

        <div className="bg-light-blue px-20 py-16 flex flex-col md:flex-row md:items-center gap-6">
          <h1 className="text-6xl font-bold text-primary-yellow whitespace-nowrap">
            Ting ting!
          </h1>
          <p className="text-gray-700 text-base leading-relaxed font-medium">
            Xin chúc mừng! bạn đã đăng ký mượn phòng thành công, trong 24 - 48h tới,
            Thư viện sẽ liên lạc với bạn để xác nhận và gửi hướng dẫn chi tiết.
            Bạn vui lòng kiểm tra email nhé!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">

          <div className="bg-primary-yellow text-white px-8 py-10">
            <h2 className="text-xl font-bold mb-6 uppercase">
              Thư viện Dương Liễu cơ sở 1:
            </h2>

            <div className="space-y-4 text-lg">
              <p className="flex items-start gap-2">
                <Image
                  src={mapsIcon}
                  alt='maps-icon'
                  className="h-5 w-auto mt-1.5 sm:mt-1"
                />
                <span>
                  18/56 Đường Thống Nhất, Thôn Thống Nhất, Dương Hoà, Hà Nội.
                </span>
              </p>

              <div>
                <p className="flex items-center gap-2 mb-2">
                  <Image
                    src={timeIcon}
                    alt='time-icon'
                    className="h-4 w-auto sm:mt-1"
                  />
                  <span className="font-semibold">Lịch mở cửa:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-6">
                  <li>Thứ 3, 5: 19h45 - 21h30</li>
                  <li>Thứ 7: 14h - 17h; 19h45 - 21h30</li>
                  <li>Chủ Nhật: 8h - 11h; 14h - 17h</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-primary-blue text-white px-8 py-10">
            <h2 className="text-xl font-bold mb-6 uppercase">
              Thư viện Dương Liễu cơ sở 2:
            </h2>

            <div className="space-y-4 text-lg">
              <p className="flex items-start gap-2">
                <Image
                  src={mapsIcon}
                  alt='maps-icon'
                  className="h-5 w-auto mt-1.5 sm:mt-1"
                />
                <span>
                  28 Đường Thanh Niên, Thôn Me Táo, Dương Hoà, Hà Nội.
                </span>
              </p>

              <div>
                <p className="flex items-center gap-2 mb-2">
                  <Image
                    src={timeIcon}
                    alt='time-icon'
                    className="h-4 w-auto sm:mt-1"
                  />
                  <span className="font-semibold">Lịch mở cửa:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-6">
                  <li>Thứ 4, 6: 19h45 - 21h30</li>
                  <li>Chủ Nhật: 8h - 11h; 14h - 17h</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}