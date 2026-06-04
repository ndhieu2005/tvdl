"use client";

import React from "react";
import styles from "./styles.module.css";

export default function CardRegistrationPage() {
  return (
    <div className={styles.cardRegistrationContainer}>
      <h1 className="text-2xl lg:text-5xl font-bold text-primary-blue p-10 sm:p-20">
        Đăng ký làm thẻ bạn đọc
      </h1>

      <div className="bg-[#F2F5FA] py-10 flex-1">
        <form className="space-y-8 max-w-3xl mx-auto px-4 sm:px-0">
          {/* Họ và tên */}
          <div className="flex">
            <p className={styles.label}>Họ và tên:</p>
            <input
              type="text"
              className="w-full border-b outline-none bg-transparent py-1"
            />
          </div>

          {/* Ngày tháng năm sinh */}
          <div className="flex">
            <p className={styles.label}>Ngày tháng năm sinh:</p>
            <div className="flex w-full">
              <input
                type="text"
                className="w-1/3 border-b outline-none bg-transparent py-1 text-center"
              />
              <div className={styles.splitBirthDay}>/</div>
              <input
                type="text"
                className="w-1/3 border-b outline-none bg-transparent py-1 text-center"
              />
              <div className={styles.splitBirthDay}>/</div>
              <input
                type="text"
                className="w-1/3 border-b outline-none bg-transparent py-1 text-center"
              />
            </div>
          </div>

          {/* Địa chỉ nhà */}
          <div className="flex">
            <p className={styles.label}>Địa chỉ nhà:</p>
            <input
              type="text"
              className="w-full border-b outline-none bg-transparent py-1"
            />
          </div>

          {/* Số điện thoại */}
          <div className="flex">
            <p className={styles.label}>Số điện thoại*:</p>
            <input
              type="tel"
              className="w-full border-b outline-none bg-transparent py-1"
            />
          </div>

          {/* Địa chỉ email */}
          <div className="flex">
            <p className={styles.label}>Địa chỉ email (nếu có):</p>
            <input
              type="email"
              className="w-full border-b outline-none bg-transparent py-1"
            />
          </div>

          {/* Cam kết */}
          <div className="flex justify-end items-start space-x-2">
            <p className="text-xs text-primary-blue font-normal">
              Tôi cam kết các thông tin trên là đúng
            </p>
            <input type="checkbox" className="mt-0.5" />
          </div>

          <button
            type="button"
            className="w-full bg-primary-yellow hover:bg-primary-blue text-white py-3 rounded-full transition"
          >
            ĐĂNG KÝ
          </button>

          <p className="text-xs font-normal text-[#3F3F3F] mt-10 pt-5 border-t border-[#3F3F3F]">
            (dưới 15 tuổi cần cung cấp số điện thoại của bố hoặc mẹ)
          </p>
        </form>
      </div>
    </div>
  );
}
