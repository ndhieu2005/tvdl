import React from 'react';
import Link from 'next/link';
import { LIBRARY_SERVICES_SUBMENU } from '@/lib/constants';
import { ShortArrowRightIcon } from '@/components/ui/icons/ShortArrowRightIcon';
import clsx from 'clsx';
import styles from './styles.module.css';

const renderServiceName = (index: number) => {
  switch (index) {
    case 0:
      return (<>Đăng ký<br />làm thẻ<br />bạn đọc</>)
    case 1:
      return (<>Đăng ký<br />mượn<br />phòng</>)
    case 2:
      return (<>Sách mới</>)
    default:
      return (<>Tra cứu<br />tài liệu</>)
  }
}

export default function ServicesPage() {
  return (
    <div className={clsx(styles.servicesContainer, "flex flex-col")}>
      <h1 className="text-3xl lg:text-5xl font-semibold text-primary-blue text-center sm:text-left px-10 py-20 sm:p-28">
        Dịch vụ thư viện
      </h1>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {LIBRARY_SERVICES_SUBMENU.map((item, index) => (
          <Link key={index} href={item.href} className={clsx('flex flex-col items-center text-white h-36 sm:h-auto py-5 sm:py-14 px-6 duration-150', {
            'bg-primary-blue hover:bg-primary-blue-hover': index % 2 === 0,
            'bg-primary-yellow hover:bg-primary-yellow-hover': index % 2 !== 0,
          })}>
            <ShortArrowRightIcon className="h-3.5 sm:h-7 w-auto rotate-90" />
            <p className="text-center font-medium text-base sm:text-3xl h-full flex items-center">
              {renderServiceName(index)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}