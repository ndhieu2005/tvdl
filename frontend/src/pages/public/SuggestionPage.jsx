import { useState } from 'react';
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

  const [form, setForm] = useState({
    reader_name: '',
    reader_code: '',
    email: '',
    book_name: '',
    buy_link: '',
    info_link: '',
    description: '',
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.book_name.trim()) {
      setError('Vui lòng nhập tên sách đề xuất.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/suggestions', {
        reader_name: form.reader_name.trim() || undefined,
        reader_code: form.reader_code.trim() || undefined,
        email: form.email.trim() || undefined,
        book_name: form.book_name.trim(),
        buy_link: form.buy_link.trim() || undefined,
        info_link: form.info_link.trim() || undefined,
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
    setForm({
      reader_name: '',
      reader_code: '',
      email: '',
      book_name: '',
      buy_link: '',
      info_link: '',
      description: '',
    });
    setError('');
  }

  if (submitted || alreadySubmitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] px-6 py-8 sm:px-16 sm:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-bold text-blue mb-8 sm:mb-16">
            Đề xuất sách
          </h1>
          <div className="max-w-md mx-auto text-center py-12 px-6">
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
    <div className="min-h-[calc(100vh-64px)] px-6 py-8 sm:px-16 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-bold text-blue mb-4 sm:mb-6">
          Đề xuất sách
        </h1>

        <p className="text-sm text-[#9CA3AF] mb-10 sm:mb-14 leading-relaxed">
          Bạn muốn thư viện bổ sung một cuốn sách? Hãy điền thông tin bên dưới —
          chúng tôi sẽ xem xét và cố gắng đáp ứng nhu cầu của bạn đọc.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
          {/* Reader name */}
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[240px_1fr] items-center gap-2 sm:gap-6">
            <label className="text-sm sm:text-base text-[#333333] font-medium">
              Tên bạn đọc:
            </label>
            <div>
              <input
                type="text"
                name="reader_name"
                value={form.reader_name}
                onChange={handleChange}
                placeholder="VD: Nguyễn Văn A"
                className="w-full border-b border-gray-400 bg-transparent py-1.5 text-sm sm:text-base text-[#2B2B2B] placeholder:text-gray-400 focus:outline-none focus:border-blue transition-colors"
              />
            </div>
          </div>

          {/* Reader code */}
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[240px_1fr] items-center gap-2 sm:gap-6">
            <label className="text-sm sm:text-base text-[#333333] font-medium">
              Mã bạn đọc:
            </label>
            <div>
              <input
                type="text"
                name="reader_code"
                value={form.reader_code}
                onChange={handleChange}
                placeholder="VD: BĐ00123 (nếu có)"
                className="w-full border-b border-gray-400 bg-transparent py-1.5 text-sm sm:text-base text-[#2B2B2B] placeholder:text-gray-400 focus:outline-none focus:border-blue transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[240px_1fr] items-center gap-2 sm:gap-6">
            <label className="text-sm sm:text-base text-[#333333] font-medium">
              Địa chỉ email:
            </label>
            <div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full border-b border-gray-400 bg-transparent py-1.5 text-sm sm:text-base text-[#2B2B2B] placeholder:text-gray-400 focus:outline-none focus:border-blue transition-colors"
              />
            </div>
          </div>

          {/* Book name */}
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[240px_1fr] items-center gap-2 sm:gap-6">
            <label className="text-sm sm:text-base text-[#333333] font-medium">
              Tên sách đề xuất: <span className="text-yellow font-bold">*</span>
            </label>
            <div>
              <input
                type="text"
                name="book_name"
                value={form.book_name}
                onChange={handleChange}
                placeholder="Tên sách hoặc tác giả"
                className="w-full border-b border-gray-400 bg-transparent py-1.5 text-sm sm:text-base text-[#2B2B2B] placeholder:text-gray-400 focus:outline-none focus:border-blue transition-colors"
              />
            </div>
          </div>

          {/* Buy link */}
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[240px_1fr] items-center gap-2 sm:gap-6">
            <label className="text-sm sm:text-base text-[#333333] font-medium">
              Link mua sách:
            </label>
            <div>
              <input
                type="url"
                name="buy_link"
                value={form.buy_link}
                onChange={handleChange}
                placeholder="https://... (Tiki, Shopee, Fahasa, ...)"
                className="w-full border-b border-gray-400 bg-transparent py-1.5 text-sm sm:text-base text-[#2B2B2B] placeholder:text-gray-400 focus:outline-none focus:border-blue transition-colors"
              />
            </div>
          </div>

          {/* Info link */}
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[240px_1fr] items-center gap-2 sm:gap-6">
            <label className="text-sm sm:text-base text-[#333333] font-medium">
              Link thông tin sách:
            </label>
            <div>
              <input
                type="url"
                name="info_link"
                value={form.info_link}
                onChange={handleChange}
                placeholder="https://... (Goodreads, bài viết giới thiệu, ...)"
                className="w-full border-b border-gray-400 bg-transparent py-1.5 text-sm sm:text-base text-[#2B2B2B] placeholder:text-gray-400 focus:outline-none focus:border-blue transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[240px_1fr] items-start gap-2 sm:gap-6">
            <label className="text-sm sm:text-base text-[#333333] font-medium pt-1.5 sm:pt-2">
              Lý do đề xuất và<br className="hidden sm:inline" /> lời nhắn (nếu có):
            </label>
            <div>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Lý do đề xuất, thông tin xuất bản hoặc ghi chú thêm..."
                className="w-full border border-gray-400 bg-transparent p-3 text-sm sm:text-base text-[#2B2B2B] placeholder:text-gray-400 focus:outline-none focus:border-blue transition-colors resize-none"
              />
            </div>
          </div>

          {/* Error & Submit Button */}
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[240px_1fr] gap-2 sm:gap-6 pt-2">
            <div className="hidden sm:block" />
            <div className="space-y-4">
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow hover:bg-yellow-dark text-white font-semibold py-3 sm:py-3.5 px-8 rounded-full uppercase tracking-wider text-sm sm:text-base shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang gửi...' : 'GỬI ĐỀ XUẤT'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
