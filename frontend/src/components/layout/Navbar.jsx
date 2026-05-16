import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'VỀ THƯ VIỆN', to: '/about' },
  { label: 'LỊCH HOẠT ĐỘNG', to: '/schedule' },
  { label: 'DỊCH VỤ THƯ VIỆN', to: '/services' },
  { label: 'TIN TỨC', to: '/news' },
];

export default function Navbar() {
  return (
    <nav className="flex items-stretch h-14 w-full sticky top-0 z-50 bg-white">
      {/* Logo */}
      <NavLink to="/" className="flex items-center px-5 shrink-0">
        {/* Thay bằng <img src="/logo.png" alt="Thư viện Dương Liễu" className="h-9" /> khi có file */}
        <div className="w-9 h-9 bg-blue rounded flex items-center justify-center text-white text-xs font-bold">TV</div>
        <div className="ml-2 leading-tight">
          <div className="text-[10px] font-semibold text-blue uppercase tracking-wide">thư viện</div>
          <div className="text-[10px] font-semibold text-blue uppercase tracking-wide">dương liễu</div>
        </div>
      </NavLink>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center px-6 text-nav font-semibold tracking-wider uppercase transition-colors border-r border-gray-100 ` +
            (isActive
              ? 'bg-yellow text-blue'
              : 'text-blue hover:bg-yellow/20')
          }
        >
          {item.label}
        </NavLink>
      ))}

      {/* Search */}
      <NavLink
        to="/search"
        className="flex items-center px-5 text-blue hover:bg-yellow/20 transition-colors ml-auto border-l border-gray-100"
        title="Tìm kiếm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
      </NavLink>

      {/* Social */}
      <div className="flex items-center gap-1 px-4 bg-dark">
        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white hover:text-yellow transition-colors p-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white hover:text-yellow transition-colors p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
          </svg>
        </a>
        <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-white hover:text-yellow transition-colors p-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
            <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
          </svg>
        </a>
      </div>
    </nav>
  );
}
