import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CalendarDays, Sparkles, BookPlus, Newspaper, MessageSquare, Quote, LogOut } from 'lucide-react';

const ADMIN_NAV = [
  { label: 'Lịch hoạt động', to: '/admin/schedules', icon: CalendarDays },
  { label: 'Sự kiện', to: '/admin/events', icon: Sparkles },
  { label: 'Sách mới', to: '/admin/new-books', icon: BookPlus },
  { label: 'Trích dẫn', to: '/admin/quotes', icon: Quote },
  { label: 'Bài viết', to: '/admin/posts', icon: Newspaper },
  { label: 'Đề xuất', to: '/admin/suggestions', icon: MessageSquare },
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
          {ADMIN_NAV.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors ` +
                (isActive ? 'bg-yellow text-blue' : 'text-white/80 hover:bg-white/10')
              }
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-5 py-4 text-xs text-white/40 hover:text-white text-left border-t border-white/10 transition-colors"
        >
          <LogOut size={14} className="shrink-0" />
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
