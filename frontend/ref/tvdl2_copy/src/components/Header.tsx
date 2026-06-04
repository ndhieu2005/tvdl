"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { SITE_CONTENT, LIBRARY_SERVICES_SUBMENU } from "@/lib/constants";
import logoSvg from "@/app/assets/logo_gradient.svg";
import { Menu, X } from "lucide-react";
import { FacebookIcon } from "./ui/icons/FacebookIcon";
import { InstagramIcon } from "./ui/icons/InstagramIcon";
import { YoutubeIcon } from "./ui/icons/YoutubeIcon";
import { SearchIcon } from "./ui/icons/SearchIcon";
import { ShortArrowRightIcon } from "./ui/icons/ShortArrowRightIcon";

const mobileNavigation = [
  { name: SITE_CONTENT.navigation.home, href: "/" },
  { name: SITE_CONTENT.navigation.about, href: "/about" },
  { name: SITE_CONTENT.navigation.events, href: "/events" },
  { name: SITE_CONTENT.navigation.services, href: "/services" },
  { name: SITE_CONTENT.navigation.news, href: "/news" },
  { name: SITE_CONTENT.navigation.contact, href: "/contact" },
];

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpenSubMenuServices, setIsOpenSubMenuServices] = useState(false);
  const serviceMenuRef = useRef<HTMLLIElement | null>(null);

  return (
    <header className="w-full z-50 sticky top-0 bg-light-blue sm:bg-transparent">
      <nav className="flex w-full h-16">
        {/* Logo */}
        <div className="flex items-center justify-center bg-light-blue w-40 sm:w-60">
          <Link href="/">
            <Image
              width={91}
              height={40}
              src={logoSvg}
              alt="Thư viện Dương Liễu"
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Main menu */}
        <ul className="hidden sm:flex flex-1 text-white text-base font-semibold">
          <li className="flex-grow basis-auto bg-primary-yellow duration-200 hover:bg-primary-yellow-hover">
            <Link
              href="/about"
              className="uppercase w-full h-full flex items-center justify-center"
            >
              {SITE_CONTENT.navigation.about}
            </Link>
          </li>

          <li className="flex-grow basis-auto bg-primary-blue duration-200 hover:bg-primary-blue-hover">
            <Link
              href="/events"
              className="uppercase w-full h-full flex items-center justify-center"
            >
              {SITE_CONTENT.navigation.events}
            </Link>
          </li>

          {/* menu + submenu */}
          <li
            className="flex-grow basis-auto relative bg-primary-yellow duration-200 hover:bg-primary-yellow-hover flex items-center justify-center"
            onMouseEnter={() => setIsOpenSubMenuServices(true)}
            onMouseLeave={() => setIsOpenSubMenuServices(false)}
            ref={serviceMenuRef}
          >
            <div className="w-full flex justify-center items-center gap-10">
              <span className="uppercase">
                {SITE_CONTENT.navigation.services}
              </span>
              <ShortArrowRightIcon className="h-3 w-auto rotate-90" />
            </div>
            {isOpenSubMenuServices && (
              <ul
                className="absolute left-0 top-full w-56 bg-primary-blue text-sm font-normal shadow-lg"
                style={{ width: serviceMenuRef.current?.offsetWidth || "auto" }}
              >
                {LIBRARY_SERVICES_SUBMENU.map((item) => (
                  <li
                    key={item.href}
                    className="border-b border-white/20 hover:text-primary-yellow h-10"
                  >
                    <Link
                      href={item.href}
                      className="w-full h-full flex items-center gap-8 pl-5"
                    >
                      <ShortArrowRightIcon className="h-2 w-auto" />
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li className="flex-grow basis-auto bg-primary-blue duration-200 hover:bg-primary-blue-hover">
            <Link
              href="/news"
              className="uppercase w-full h-full flex items-center justify-center"
            >
              {SITE_CONTENT.navigation.news}
            </Link>
          </li>
        </ul>

        <Link
          href={`/search`}
          className="w-28 hidden sm:flex items-center justify-center bg-dark-grey duration-200 hover:bg-dark-grey-hover"
        >
          <SearchIcon className="text-white max-h-5 w-auto" />
        </Link>

        {/* Social */}
        <div className="flex items-center justify-center gap-4 bg-light-blue w-48">
          <FacebookIcon
            className="max-h-6 w-auto cursor-pointer hover:scale-125 duration-200 text-[#003d9d]"
            onClick={() =>
              window.open("https://www.facebook.com/duonglieulibrary", "_blank")
            }
          />
          <InstagramIcon
            className="max-h-6 w-auto cursor-pointer hover:scale-125 duration-200 text-[#003d9d]"
            onClick={() =>
              window.open(
                "https://www.instagram.com/duonglieulibrary",
                "_blank"
              )
            }
          />
          <YoutubeIcon
            className="max-h-6 w-auto cursor-pointer hover:scale-125 duration-200 text-[#003d9d]"
            onClick={() =>
              window.open("https://www.youtube.com/@duonglieulibrary", "_blank")
            }
          />
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center justify-end flex-1 pr-5">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="text-primary-blue min-h-6 min-w-6"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="sm:hidden border-b border-[#c9d7ec]">
          {mobileNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-primary-blue border-t border-[#c9d7ec] block px-3 py-2 text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
