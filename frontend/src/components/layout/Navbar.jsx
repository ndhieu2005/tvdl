import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logoSvg from '../../assets/logo_gradient.svg';

const SERVICES_SUBMENU = [
  { text: 'Sách mới', to: '/new-books' },
  { text: 'Tra cứu tài liệu', to: '/search' },
  { text: 'Đề xuất sách', to: '/suggest' },
];

const MOBILE_NAV = [
  { name: 'Trang chủ', to: '/' },
  { name: 'Về thư viện', to: '/about' },
  { name: 'Lịch hoạt động', to: '/schedule' },
  { name: 'Dịch vụ thư viện', to: '/services' },
  { name: 'Đề xuất sách', to: '/suggest' },
  { name: 'Tin tức', to: '/news' },
];

function ShortArrowRightIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12.69 8.88" fill="currentColor" className={className}>
      <path d="m12.69,4.48c0-.1-.02-.21-.12-.3-.17-.17-.33-.34-.5-.5-1.17-1.19-2.33-2.37-3.5-3.56-.37-.38-.95.2-.58.58.17.17.33.34.5.5.94.95,1.87,1.9,2.81,2.85H.4c-.53,0-.53.82,0,.82h10.88c-1.11,1.1-2.23,2.2-3.35,3.3-.38.37.2.95.58.58.17-.17.34-.34.51-.51,1.18-1.17,2.36-2.33,3.54-3.49.07-.07.11-.16.11-.25,0-.01,0-.02,0-.03Z"/>
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const serviceMenuRef = useRef(null);

  return (
    <header className="w-full z-50 sticky top-0 bg-light-blue sm:bg-transparent">
      <nav className="flex w-full h-16">
        {/* Logo */}
        <div className="flex items-center justify-center bg-light-blue w-40 sm:w-60 shrink-0">
          <Link to="/">
            <img src={logoSvg} alt="Thư viện Dương Liễu" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Main menu (desktop) */}
        <ul className="hidden sm:flex flex-1 text-white text-base font-semibold">
          <li className="flex-grow basis-auto bg-yellow duration-200 hover:bg-yellow-dark">
            <Link to="/about" className="uppercase w-full h-full flex items-center justify-center">
              Về thư viện
            </Link>
          </li>

          <li className="flex-grow basis-auto bg-blue duration-200 hover:bg-blue-light">
            <Link to="/schedule" className="uppercase w-full h-full flex items-center justify-center">
              Lịch hoạt động
            </Link>
          </li>

          <li
            className="flex-grow basis-auto relative bg-yellow duration-200 hover:bg-yellow-dark flex items-center justify-center"
            onMouseEnter={() => setIsServicesOpen(true)}
            onMouseLeave={() => setIsServicesOpen(false)}
            ref={serviceMenuRef}
          >
            <Link to="/services" className="w-full flex justify-center items-center gap-4 h-full">
              <span className="uppercase">Dịch vụ thư viện</span>
              <ShortArrowRightIcon className="h-3 w-auto rotate-90" />
            </Link>
            {isServicesOpen && (
              <ul
                className="absolute left-0 top-full bg-blue text-sm font-normal shadow-lg z-10"
                style={{ width: serviceMenuRef.current?.offsetWidth || 'auto' }}
              >
                {SERVICES_SUBMENU.map((item) => (
                  <li key={item.to} className="border-b border-white/20 hover:text-yellow h-10">
                    <Link to={item.to} className="w-full h-full flex items-center gap-8 pl-5">
                      <ShortArrowRightIcon className="h-2 w-auto" />
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li className="flex-grow basis-auto bg-blue duration-200 hover:bg-blue-light">
            <Link to="/news" className="uppercase w-full h-full flex items-center justify-center">
              Tin tức
            </Link>
          </li>
        </ul>

        {/* Search */}
        <Link
          to="/search"
          className="w-28 hidden sm:flex items-center justify-center bg-dark duration-200 hover:opacity-80"
        >
          <SearchIcon className="text-white max-h-5 w-auto" />
        </Link>

        {/* Social icons */}
        <div className="flex items-center justify-center gap-4 bg-light-blue w-48 shrink-0">
          <a
            href="https://www.facebook.com/duonglieulibrary"
            target="_blank"
            rel="noreferrer"
            className="text-blue hover:scale-125 duration-200"
          >
            <svg className="h-6 w-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/duonglieulibrary"
            target="_blank"
            rel="noreferrer"
            className="text-blue hover:scale-125 duration-200"
          >
            <svg className="h-6 w-auto" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a
            href="https://www.youtube.com/@duonglieulibrary"
            target="_blank"
            rel="noreferrer"
            className="text-blue hover:scale-125 duration-200"
          >
            <svg className="h-6 w-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
              <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
            </svg>
          </a>
        </div>

        {/* Mobile hamburger */}
        <div className="flex sm:hidden items-center justify-end flex-1 pr-5">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="text-blue min-h-6 min-w-6"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <div className="sm:hidden border-b border-[#c9d7ec]">
          {MOBILE_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-blue border-t border-[#c9d7ec] block px-3 py-2 text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
