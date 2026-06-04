'use client';

import React from 'react';

export default function RoomBookingPolicyPage() {
  const array = [
    'Sử dụng đúng mục đích đã đăng ký (học tập, họp nhóm, họp ban/dự án,…).',
    'Giữ gìn tài sản chung, không làm hư hỏng, mất mát trang thiết bị trong phòng.',
    'Giữ vệ sinh chung trong suốt thời gian sử dụng.',
    'Hoàn trả phòng đúng giờ và báo lại cho đại diện Thư viện khi kết thúc.',
    'Chịu trách nhiệm bồi thường nếu làm hư hại hoặc mất tài sản của Thư viện.'
  ];
  return (
    <div className="pt-[64px] px-10 md:px-32">
      <h1 className="text-2xl font-bold text-primary-blue text-center mb-16">
        CAM KẾT THỦ TỤC MƯỢN PHÒNG TẠI THƯ VIỆN DƯƠNG LIỄU
      </h1>
      {array.map((item, index) => (
        <div className="flex gap-4 mt-5 items-center" key={index}>
          <div className="text-primary-yellow text-4xl font-semibold">{index + 1}</div>
          <div className="">{item}</div>
        </div>
      ))}
    </div>
  );
}