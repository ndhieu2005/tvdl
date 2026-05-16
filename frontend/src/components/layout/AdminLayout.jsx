import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const ADMIN_NAV = [
  { label: 'Đồng bộ Skoolib', to: '/admin/sync' },
  { label: 'Sách mới', to: '/admin/new-books' },
  { label: 'Lịch hoạt động', to: '/admin/schedules' },
  { label: 'Đề xuất', to: '/admin/suggestions' },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('tvdl_token');
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-blue text-white flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-white/10">
          <p className="font-bold text-sm tracking-wide">THƯ VIỆN DƯƠNG LIỄU</p>
          <p className="text-white/50 text-xs mt-0.5 uppercase tracking-widest">Admin</p>
        </div>
        <nav className="flex-1 py-4">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-5 py-3 text-sm font-semibold transition-colors ` +
                (isActive ? 'bg-yellow text-blue' : 'text-white/80 hover:bg-white/10')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="px-5 py-4 text-xs text-white/40 hover:text-white text-left border-t border-white/10 transition-colors"
        >
          Đăng xuất
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
