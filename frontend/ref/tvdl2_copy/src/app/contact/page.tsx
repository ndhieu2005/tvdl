import React from 'react';
import Link from 'next/link';
import { PhoneIcon } from '@/components/ui/icons/PhoneIcon';
import { MailIcon } from '@/components/ui/icons/MailIcon';
import { MapsFillIcon } from '@/components/ui/icons/MapsFillIcon';
import styles from './styles.module.css';
import clsx from 'clsx';
import { MessageIcon } from '@/components/ui/icons/MessageIcon';

export default function ContactPage() {
  const contactInfo = [
    { icon: <MapsFillIcon className="w-3 pt-1.5" />, text: 'Cơ sở 1: 18/56 Đường Thống Nhất, Thôn Thống Nhất, Dương Hoà, Hà Nội.' },
    { icon: <MapsFillIcon className="w-3 pt-1.5" />, text: 'Cơ sở 2: 28 Đường Thanh Niên, Thôn Me Táo, Dương Hoà, Hà Nội.' },
    { icon: <MailIcon className="w-3 pt-1.5" />, text: 'thuvienduonglieu@gmail.com' },
    { icon: <PhoneIcon className="w-3 pt-1.5" />, text: '0906-1515-66' },
  ];

  // const handleSubmit = (e: FormEvent) => {
  //   e.preventDefault();
  //   // TODO: xử lý submit
  //   console.log("Đã gửi!", e);
  // };

  return (
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-20 py-5 sm:py-32 px-5 sm:px-12 lg:px-20 xl:px-40 2xl:px-64">
      <div className={styles.leftSection}>
        <div className='hidden sm:block'>
          <p className='text-6xl font-medium'>Liên hệ,</p>
          <p className='text-6xl font-medium mt-4'>góp ý cho</p>
          <p className='text-6xl font-medium mt-4'>Thư viện</p>
          <p className='text-6xl font-medium mt-4'>Dương Liễu</p>
        </div>
        <p className='block sm:hidden text-2xl font-bold py-3'>Liên hệ, góp ý cho<br /> Thư viện Dương Liễu</p>
        <div className={styles.contactBorder}></div>
        {contactInfo.map(item => (
          <div className="flex items-start gap-4 mt-3" key={item.text}>
            {item.icon}
            <p className='text-sm font-light'>
              {item.text}
            </p>
          </div>
        ))}
        <div className="flex items-start gap-4 mt-3">
          <MessageIcon className="w-3 pt-1.5" />
          <p className='text-sm font-light'>
            Thông tin chung:
            <Link target='_blank' href='https://linktr.ee/duonglieu' className='font-medium ml-1'>linktr.ee/duonglieu</Link>
          </p>
        </div>
      </div>
      <div className="flex-1 bg-primary-blue px-5 sm:px-16 py-5 sm:py-10">
        <p className="text-white text-xl sm:text-4xl font-medium mb-8">
          Gửi tin nhắn cho chúng tôi:
        </p>
        <form
          // onSubmit={handleSubmit}
          className={clsx(styles.form, "space-y-6 text-white")}
        >
          <div>
            <label htmlFor="name" className={styles.label}>Họ và tên:</label>
            <input id="name" name="name" type="text" className={styles.input} />
          </div>

          <div className="flex flex-col md:flex-row gap-6 sm:gap-16">
            <div className="flex-1">
              <label htmlFor="email" className={styles.label}>Địa chỉ email:</label>
              <input id="email" name="email" type="email" className={styles.input} />
            </div>
            <div className="flex-1">
              <label htmlFor="phone" className={styles.label}>Số điện thoại:</label>
              <input id="phone" name="phone" type="tel" className={styles.input} />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className={styles.label}>Tiêu đề:</label>
            <input id="subject" name="subject" type="text" className={styles.input} />
          </div>

          <div>
            <label htmlFor="message" className={styles.label}>Lời nhắn:</label>
            <textarea
              id="message"
              name="message"
              rows={3}
              className="w-full bg-white focus:outline-none p-2 resize-none text-black mt-1.5"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full text-sm sm:text-base border-2 border-primary-yellow bg-primary-yellow hover:bg-primary-blue font-extralight px-10 py-3 rounded-full duration-200"
          >
            GỬI TIN NHẮN
          </button>
        </form>
      </div>
    </div>
  );
}