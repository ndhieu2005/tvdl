import { Link } from 'react-router-dom';
import logoSvg from '../../assets/logo_gradient.svg';

const MENUS = [
  {
    to: '/about',
    text: 'VỀ THƯ VIỆN',
    className: 'bg-yellow duration-200 hover:bg-yellow-dark',
  },
  {
    to: '/schedule',
    text: 'LỊCH HOẠT ĐỘNG',
    className: 'bg-blue duration-200 hover:bg-blue-light',
  },
  {
    to: '/services',
    text: 'DỊCH VỤ THƯ VIỆN',
    className: 'bg-blue sm:bg-blue duration-200 hover:bg-blue-light',
  },
  {
    to: '/news',
    text: 'TIN TỨC',
    className: 'bg-yellow sm:bg-yellow duration-200 hover:bg-yellow-dark',
  },
];

function ArrowRightIcon({ className }) {
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

export default function HubPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="p-0 sm:p-16 lg:p-20 h-72 relative flex-1">
        <img
          src={logoSvg}
          alt="Thư viện Dương Liễu"
          className="h-16 w-32 sm:w-auto mx-auto mt-10 sm:m-0"
        />
        <p className="text-blue text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-bold text-center w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          Chào mừng bạn<span className="text-yellow">!</span>
        </p>
      </div>

      {/* Nav tiles */}
      <div>
        <div className="flex flex-wrap text-white">
          {MENUS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`w-full sm:w-1/2 h-20 text-base sm:text-xl flex items-center justify-center ${item.className}`}
            >
              <ArrowRightIcon className="max-h-2 mr-2 w-auto" />
              {item.text}
            </Link>
          ))}
        </div>

        {/* Search row — tra cứu trực tiếp trên Skoolib */}
        <a
          href="https://skoolib.net/li/tvdlcs1/opac-public"
          target="_blank"
          rel="noopener noreferrer"
          className="h-20 text-base sm:text-xl flex items-center justify-center bg-dark duration-200 hover:opacity-80 text-white"
        >
          <SearchIcon className="text-white h-3.5 mr-2 sm:mr-5 w-auto" />
          TÌM KIẾM
        </a>
      </div>
    </div>
  );
}
