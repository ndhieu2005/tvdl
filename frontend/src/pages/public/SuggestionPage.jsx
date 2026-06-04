import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

const STORAGE_KEY = 'tvdl_suggestion_submitted';

function CheckIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function SuggestionPage() {
  const [alreadySubmitted, setAlreadySubmitted] = useState(
    () => !!localStorage.getItem(STORAGE_KEY)
  );
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [ageGroups, setAgeGroups] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    reader_code: '',
    email: '',
    book_name: '',
    age_group_id: '',
    category_id: '',
    description: '',
  });

  useEffect(() => {
    api.get('/age-groups').then((r) => setAgeGroups(r.data.data || [])).catch(() => {});
    api.get('/categories').then((r) => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.reader_code.trim()) {
      setError('Vui lòng nhập mã bạn đọc.');
      return;
    }
    if (!form.book_name.trim()) {
      setError('Vui lòng nhập tên sách đề xuất.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/suggestions', {
        reader_code: form.reader_code.trim(),
        email: form.email.trim() || undefined,
        book_name: form.book_name.trim(),
        age_group_id: form.age_group_id || undefined,
        category_id: form.category_id || undefined,
        description: form.description.trim() || undefined,
      });
      localStorage.setItem(STORAGE_KEY, '1');
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmitAnother() {
    localStorage.removeItem(STORAGE_KEY);
    setAlreadySubmitted(false);
    setSubmitted(false);
    setForm({ reader_code: '', email: '', book_name: '', age_group_id: '', category_id: '', description: '' });
    setError('');
  }

  if (submitted || alreadySubmitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] py-5 sm:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-5xl font-semibold text-blue mb-6 sm:mb-20 pl-5 sm:pl-10">
            Đề xuất sách
          </h1>
          <div className="max-w-lg mx-auto text-center py-16 px-6">
            <div className="w-16 h-16 border-2 border-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckIcon className="h-7 w-7 text-blue" />
            </div>
            <h2 className="text-xl font-semibold text-blue mb-3">
              {submitted ? 'Cảm ơn bạn đã đề xuất!' : 'Bạn đã gửi đề xuất trước đó'}
            </h2>
            <p className="text-sm text-[#9CA3AF] mb-8 leading-relaxed">
              {submitted
                ? 'Chúng tôi đã nhận được đề xuất của bạn và sẽ xem xét trong thời gian sớm nhất.'
                : 'Bạn đã gửi đề xuất sách trước đó. Cảm ơn bạn đã đóng góp cho thư viện!'}
            </p>
            <button
              onClick={handleSubmitAnother}
              className="text-sm font-semibold text-blue border-b border-blue pb-0.5 hover:text-blue/70 transition-colors"
            >
              Gửi đề xuất khác →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] py-5 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-5xl font-semibold text-blue mb-6 sm:mb-20 pl-5 sm:pl-10">
          Đề xuất sách
        </h1>

        <div className="max-w-lg mx-auto">
          <p className="text-sm text-[#9CA3AF] mb-8 leading-relaxed">
            Bạn muốn thư viện bổ sung một cuốn sách? Hãy điền thông tin bên dưới —
            chúng tôi sẽ xem xét và cố gắng đáp ứng nhu cầu của bạn đọc.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Reader code */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-blue mb-2">
                Mã bạn đọc <span className="text-yellow">*</span>
              </label>
              <input
                type="text"
                name="reader_code"
                value={form.reader_code}
                onChange={handleChange}
                placeholder="VD: BĐ00123"
                className="w-full border border-[#424241] bg-[#F9F3E1] px-4 py-3 text-sm text-[#2B2B2B] placeholder:text-[#9CA3AF] focus:outline-none focus:border-blue transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-blue mb-2">
                Email <span className="text-[#9CA3AF] font-normal normal-case tracking-normal">(không bắt buộc)</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full border border-[#424241] bg-[#F9F3E1] px-4 py-3 text-sm text-[#2B2B2B] placeholder:text-[#9CA3AF] focus:outline-none focus:border-blue transition-colors"
              />
            </div>

            {/* Book name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-blue mb-2">
                Tên sách đề xuất <span className="text-yellow">*</span>
              </label>
              <input
                type="text"
                name="book_name"
                value={form.book_name}
                onChange={handleChange}
                placeholder="Tên sách hoặc tác giả"
                className="w-full border border-[#424241] bg-[#F9F3E1] px-4 py-3 text-sm text-[#2B2B2B] placeholder:text-[#9CA3AF] focus:outline-none focus:border-blue transition-colors"
              />
            </div>

            {/* Age group + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-blue mb-2">
                  Độ tuổi
                </label>
                <select
                  name="age_group_id"
                  value={form.age_group_id}
                  onChange={handleChange}
                  className="w-full border border-[#424241] bg-[#F9F3E1] px-4 py-3 text-sm text-[#2B2B2B] focus:outline-none focus:border-blue transition-colors appearance-none cursor-pointer"
                >
                  <option value="">— Tất cả —</option>
                  {ageGroups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-blue mb-2">
                  Thể loại
                </label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="w-full border border-[#424241] bg-[#F9F3E1] px-4 py-3 text-sm text-[#2B2B2B] focus:outline-none focus:border-blue transition-colors appearance-none cursor-pointer"
                >
                  <option value="">— Tất cả —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-blue mb-2">
                Ghi chú thêm <span className="text-[#9CA3AF] font-normal normal-case tracking-normal">(không bắt buộc)</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Lý do đề xuất, thể loại mong muốn..."
                className="w-full border border-[#424241] bg-[#F9F3E1] px-4 py-3 text-sm text-[#2B2B2B] placeholder:text-[#9CA3AF] focus:outline-none focus:border-blue transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue text-white text-sm font-bold uppercase tracking-widest py-4 hover:bg-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang gửi...' : 'Gửi đề xuất →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
