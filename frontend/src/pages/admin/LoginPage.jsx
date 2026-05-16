import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/v1/admin/auth/login', form);
      localStorage.setItem('tvdl_token', data.data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm">
        {/* Logo placeholder */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue rounded-xl mx-auto flex items-center justify-center text-white font-black text-xl mb-3">TV</div>
          <p className="text-blue font-bold text-lg tracking-wide">THƯ VIỆN DƯƠNG LIỄU</p>
          <p className="text-muted text-xs mt-1 uppercase tracking-widest">Quản trị</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-blue uppercase tracking-wide mb-1.5">
              Tên đăng nhập
            </label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm text-blue focus:border-blue outline-none transition-colors"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-blue uppercase tracking-wide mb-1.5">
              Mật khẩu
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm text-blue focus:border-blue outline-none transition-colors"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue text-white font-semibold py-2.5 rounded-lg hover:bg-blue-light transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Đang đăng nhập...' : '→ Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
