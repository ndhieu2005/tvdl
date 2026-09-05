import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Sparkles,
  BookPlus,
  Newspaper,
  MessageSquare,
  Quote,
  ShieldCheck,
  User,
  LogOut,
  Pencil,
  Check,
  Shield,
  Tags,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import { useToast } from '../ui/Toast';
import Modal from '../Modal';
import { FormField, TextInput } from '../ui/FormField';

const BASE_NAV = [
  { label: 'Lịch hoạt động', to: '/admin/schedules', icon: CalendarDays },
  { label: 'Sự kiện', to: '/admin/events', icon: Sparkles },
  { label: 'Sách mới', to: '/admin/new-books', icon: BookPlus },
  { label: 'Cơ sở & Thể loại', to: '/admin/taxonomy', icon: Tags },
  { label: 'Trích dẫn', to: '/admin/quotes', icon: Quote },
  { label: 'Bài viết', to: '/admin/posts', icon: Newspaper },
  { label: 'Đề xuất', to: '/admin/suggestions', icon: MessageSquare },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [profileModal, setProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', current_password: '', new_password: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});

  useEffect(() => {
    adminApi
      .get('/auth/me')
      .then((r) => {
        setUser(r.data.data);
      })
      .catch(() => {
        // If auth failed, interceptor will redirect to login
      });
  }, []);

  function logout() {
    localStorage.removeItem('tvdl_token');
    navigate('/admin/login');
  }

  function openProfileModal() {
    setProfileForm({
      name: user?.name || user?.username || '',
      current_password: '',
      new_password: '',
    });
    setProfileErrors({});
    setProfileModal(true);
  }

  async function handleSaveProfile(e) {
    e?.preventDefault();
    const errs = {};
    if (!profileForm.name.trim()) {
      errs.name = 'Vui lòng nhập tên hiển thị';
    }
    if (profileForm.new_password) {
      if (!profileForm.current_password) {
        errs.current_password = 'Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu';
      }
      if (profileForm.new_password.length < 6) {
        errs.new_password = 'Mật khẩu mới phải từ 6 ký tự trở lên';
      }
    }

    setProfileErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingProfile(true);
    try {
      const payload = {
        name: profileForm.name.trim(),
        ...(profileForm.new_password && {
          current_password: profileForm.current_password,
          new_password: profileForm.new_password,
        }),
      };
      const res = await adminApi.put('/auth/profile', payload);
      const { admin, token } = res.data.data;
      if (token) {
        localStorage.setItem('tvdl_token', token);
      }
      setUser(admin);
      setProfileModal(false);
      toast.success('Cập nhật thông tin thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setSavingProfile(false);
    }
  }

  const isSuperAdmin = user?.role === 'super_admin';
  const navItems = isSuperAdmin
    ? [...BASE_NAV, { label: 'Tài khoản admin', to: '/admin/users', icon: ShieldCheck }]
    : BASE_NAV;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-blue text-white flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-white/10">
          <p className="font-bold text-sm tracking-wide">THƯ VIỆN DƯƠNG LIỄU</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-white/60 text-xs uppercase tracking-widest">Admin</span>
            {isSuperAdmin && (
              <span className="bg-yellow text-blue text-[10px] font-black px-1.5 py-0.2 rounded uppercase">
                Tổng
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map(({ label, to, icon: Icon }) => (
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

        {/* User profile & edit name section */}
        {user && (
          <div className="p-3 border-t border-white/10 bg-black/10">
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-yellow text-blue font-black text-xs flex items-center justify-center shrink-0">
                  {isSuperAdmin ? <Shield size={14} /> : <User size={14} />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate" title={user.name || user.username}>
                    {user.name || user.username}
                  </p>
                  <p className="text-[11px] text-white/50 truncate">
                    {isSuperAdmin ? 'Admin tổng' : 'Quản trị viên'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={openProfileModal}
                className="p-1.5 text-white/60 hover:text-yellow hover:bg-white/10 rounded transition-colors shrink-0"
                title="Chỉnh sửa tên hiển thị"
              >
                <Pencil size={13} />
              </button>
            </div>
          </div>
        )}

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

      {/* Modal Chỉnh sửa thông tin cá nhân / Tên hiển thị */}
      {profileModal && (
        <Modal title="Chỉnh sửa thông tin cá nhân" onClose={() => setProfileModal(false)}>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <FormField label="Tên đăng nhập (username)">
              <TextInput value={user?.username || ''} disabled className="bg-gray-100 text-gray-500 cursor-not-allowed" />
            </FormField>

            <FormField label="Tên hiển thị của bạn (Tác giả bài viết)" required error={profileErrors.name}>
              <TextInput
                placeholder="Ví dụ: Nguyễn Văn A, Admin TVDL,..."
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                autoFocus
              />
              <p className="text-muted text-[11px] mt-1">
                Tên này sẽ hiển thị là Tác giả trên các bài viết do bạn đăng tải.
              </p>
            </FormField>

            <div className="border-t border-gray-100 pt-4 mt-2">
              <p className="text-xs font-bold text-blue uppercase tracking-wide mb-3">
                Đổi mật khẩu (Không bắt buộc)
              </p>

              <div className="space-y-3">
                <FormField label="Mật khẩu hiện tại" error={profileErrors.current_password}>
                  <TextInput
                    type="password"
                    placeholder="Nhập mật khẩu hiện tại nếu muốn đổi"
                    value={profileForm.current_password}
                    onChange={(e) => setProfileForm({ ...profileForm, current_password: e.target.value })}
                  />
                </FormField>

                <FormField label="Mật khẩu mới" error={profileErrors.new_password}>
                  <TextInput
                    type="password"
                    placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                    value={profileForm.new_password}
                    onChange={(e) => setProfileForm({ ...profileForm, new_password: e.target.value })}
                  />
                </FormField>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setProfileModal(false)}
                className="px-4 py-2 text-sm text-muted hover:text-blue"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 bg-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-light disabled:opacity-50"
              >
                <Check size={15} /> {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

