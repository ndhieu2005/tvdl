"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import logoSvg from "./assets/logo_gradient.svg";
import { ArrowRightIcon } from "@/components/ui/icons/ArrowRightIcon";
import { SearchIcon } from "@/components/ui/icons/SearchIcon";
import clsx from "clsx";

export default function HomePage() {
  const menus = [
    {
      url: "/about",
      text: "VỀ THƯ VIỆN",
      background:
        "bg-primary-yellow duration-200 hover:bg-primary-yellow-hover",
    },
    {
      url: "/events",
      text: "LỊCH HOẠT ĐỘNG",
      background: "bg-primary-blue duration-200 hover:bg-primary-blue-hover",
    },
    {
      url: "/services",
      text: "DỊCH VỤ THƯ VIỆN",
      background:
        "bg-primary-yellow sm:bg-primary-blue duration-200 hover:bg-primary-blue-hover",
    },
    {
      url: "/news",
      text: "TIN TỨC",
      background:
        "bg-primary-blue sm:bg-primary-yellow duration-200 hover:bg-primary-yellow-hover",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-0 sm:p-16 lg:p-20 h-72 relative flex-1">
        <Image
          width={145}
          height={64}
          src={logoSvg}
          alt="Thư viện Dương Liễu"
          className="h-16 w-32 sm:w-auto mx-auto mt-10 sm:m-0"
        />
        <p className="text-primary-blue text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-bold text-center w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          Chào mừng bạn<span className="text-primary-yellow">!</span>
        </p>
      </div>
      <div className="">
        <div className="flex flex-wrap text-white">
          {menus.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              className={clsx(
                "w-full sm:w-1/2 h-20 text-base sm:text-xl flex items-center justify-center",
                item.background
              )}
            >
              <ArrowRightIcon className="max-h-2 mr-2 w-auto" />
              {item.text}
            </Link>
          ))}
        </div>
        <Link
          href={`/search`}
          className="h-20 text-base sm:text-xl flex items-center justify-center bg-dark-grey duration-200 hover:bg-dark-grey-hover text-white"
        >
          <SearchIcon className="text-white h-3.5 mr-2 sm:mr-5 w-auto" />
          TÌM KIẾM
        </Link>
      </div>
    </div>
  );
}
