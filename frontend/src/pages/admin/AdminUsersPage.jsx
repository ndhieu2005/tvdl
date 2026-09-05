import { Plus, Pencil, Trash2, Check, ShieldCheck, User, Shield } from 'lucide-react';
import Modal from '../../components/Modal';
import { FormField, TextInput } from '../../components/ui/FormField';
import useCrudList from '../../hooks/useCrudList';

const EMPTY_FORM = {
  username: '',
  name: '',
  role: 'admin',
  password: '',
};

export default function AdminUsersPage() {
  const crud = useCrudList({
    endpoint: '/users',
    emptyForm: EMPTY_FORM,
    confirmDelete: 'Bạn có chắc chắn muốn xoá tài khoản admin này?',
    validate: (f, modal) => {
      const errs = {};
      if (modal === 'create') {
        if (!f.username.trim()) errs.username = 'Nhập tên đăng nhập';
        else if (f.username.trim().length < 3) errs.username = 'Tên đăng nhập phải từ 3 ký tự trở lên';
        else if (!/^[a-zA-Z0-9._-]+$/.test(f.username.trim())) {
          errs.username = 'Chỉ gồm chữ cái, chữ số, dấu chấm hoặc gạch nối';
        }

        if (!f.password) errs.password = 'Nhập mật khẩu ban đầu';
        else if (f.password.length < 6) errs.password = 'Mật khẩu phải từ 6 ký tự trở lên';
      }

      if (modal === 'edit' && f.password && f.password.length < 6) {
        errs.password = 'Mật khẩu mới phải từ 6 ký tự trở lên';
      }

      if (!f.name.trim()) {
        errs.name = 'Nhập tên hiển thị của admin';
      }

      return errs;
    },
    toForm: (u) => ({
      username: u.username || '',
      name: u.name || '',
      role: u.role || 'admin',
      password: '',
    }),
  });

  const { items: users, form, setForm } = crud;

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue flex items-center gap-2">
            <ShieldCheck className="text-blue" size={26} />
            Quản lý tài khoản Admin
          </h1>
          <p className="text-muted text-xs mt-1">
            Quản lý danh sách quản trị viên, thêm admin mới và phân quyền hệ thống.
          </p>
        </div>
        <button
          onClick={() => crud.openCreate()}
          className="flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-light transition-colors self-start sm:self-auto"
        >
          <Plus size={16} /> Thêm admin mới
        </button>
      </div>

      {crud.loading ? (
        <p className="text-muted text-sm">Đang tải...</p>
      ) : users.length === 0 ? (
        <p className="text-muted text-sm italic">Chưa có tài khoản nào</p>
      ) : (
        <div className="space-y-3">
          {users.map((u) => {
            const isSuper = u.role === 'super_admin';
            return (
              <div
                key={u.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                    isSuper ? 'bg-yellow text-blue border border-blue/20' : 'bg-blue/10 text-blue'
                  }`}>
                    {isSuper ? <Shield size={18} /> : <User size={18} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-blue text-sm">{u.name || u.username}</p>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isSuper
                            ? 'bg-yellow text-blue border border-yellow-dark'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {isSuper ? 'Admin tổng' : 'Quản trị viên'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted mt-1 flex-wrap">
                      <span>@{u.username}</span>
                      <span>·</span>
                      <span>{u.post_count || 0} bài viết đã đăng</span>
                      <span>·</span>
                      <span>Tạo ngày {new Date(u.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => crud.openEdit(u)}
                    className="p-2 text-blue hover:bg-blue/10 rounded-lg transition-colors"
                    title="Chỉnh sửa thông tin"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => crud.handleDelete(u.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xoá tài khoản"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {crud.modal && (
        <Modal
          title={crud.modal === 'create' ? 'Thêm tài khoản admin mới' : 'Chỉnh sửa tài khoản admin'}
          onClose={() => crud.setModal(null)}
        >
          <div className="space-y-4">
            {crud.modal === 'create' ? (
              <FormField label="Tên đăng nhập (username)" required error={crud.errors.username}>
                <TextInput
                  placeholder="Ví dụ: quantrivien1"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </FormField>
            ) : (
              <FormField label="Tên đăng nhập">
                <TextInput value={form.username} disabled className="bg-gray-100 text-gray-500 cursor-not-allowed" />
              </FormField>
            )}

            <FormField label="Tên hiển thị (Tác giả bài viết)" required error={crud.errors.name}>
              <TextInput
                placeholder="Ví dụ: Ban Quản Trị TVDL, Nguyễn Văn A,..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <p className="text-muted text-[11px] mt-1">
                Tên này sẽ hiển thị làm Tác giả trên các bài viết do tài khoản này đăng tải.
              </p>
            </FormField>

            <FormField label="Vai trò / Phân quyền" required>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <label
                  className={`flex items-center gap-2.5 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    form.role === 'admin' ? 'border-blue bg-blue/5 text-blue font-semibold' : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={form.role === 'admin'}
                    onChange={() => setForm({ ...form, role: 'admin' })}
                    className="accent-blue"
                  />
                  <div>
                    <p className="text-xs uppercase font-bold tracking-wide">Quản trị viên</p>
                    <p className="text-[11px] text-muted font-normal">Quản lý bài viết, lịch, sách...</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-2.5 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    form.role === 'super_admin' ? 'border-yellow bg-yellow/10 text-blue font-semibold' : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="super_admin"
                    checked={form.role === 'super_admin'}
                    onChange={() => setForm({ ...form, role: 'super_admin' })}
                    className="accent-yellow"
                  />
                  <div>
                    <p className="text-xs uppercase font-bold tracking-wide">Admin tổng</p>
                    <p className="text-[11px] text-muted font-normal">Toàn quyền, thêm/xoá admin</p>
                  </div>
                </label>
              </div>
            </FormField>

            <FormField
              label={crud.modal === 'create' ? 'Mật khẩu ban đầu' : 'Đổi mật khẩu mới (tuỳ chọn)'}
              required={crud.modal === 'create'}
              error={crud.errors.password}
            >
              <div className="relative">
                <TextInput
                  type="password"
                  placeholder={crud.modal === 'create' ? 'Tối thiểu 6 ký tự' : 'Để trống nếu giữ nguyên mật khẩu cũ'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </FormField>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => crud.setModal(null)}
              className="px-4 py-2 text-sm text-muted hover:text-blue"
            >
              Huỷ
            </button>
            <button
              onClick={() => crud.handleSave()}
              disabled={crud.saving}
              className="flex items-center gap-2 bg-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-light disabled:opacity-50"
            >
              <Check size={15} /> {crud.saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
