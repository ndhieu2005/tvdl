import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { adminApi } from '../../lib/api';

export default function SyncPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const inputRef = useRef();

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setStatus('loading');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await adminApi.post('/sync', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('success');
      setMessage(data.message || 'Đồng bộ thành công');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Đồng bộ thất bại');
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-blue mb-2">Đồng bộ Skoolib</h1>
      <p className="text-muted text-sm mb-8">Upload file Excel (.xlsx) từ Skoolib để cập nhật danh sách sách và bạn đọc.</p>

      <form onSubmit={handleSubmit}>
        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-blue rounded-xl p-12 text-center cursor-pointer hover:bg-blue/5 transition-colors mb-6"
        >
          <Upload className="w-10 h-10 text-blue/40 mx-auto mb-3" />
          {file
            ? <p className="font-semibold text-blue">{file.name}</p>
            : <p className="text-muted text-sm">Kéo thả hoặc <span className="text-blue font-semibold underline">chọn file</span> .xlsx</p>
          }
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Status */}
        {status === 'success' && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            <CheckCircle size={16} /> {message}
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            <AlertCircle size={16} /> {message}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || status === 'loading'}
          className="bg-blue text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-light transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {status === 'loading' ? 'Đang đồng bộ...' : '→ Bắt đầu đồng bộ'}
        </button>
      </form>

      <div className="mt-10 p-5 bg-yellow/10 border border-yellow rounded-xl text-sm text-blue">
        <p className="font-semibold mb-2">⚠ Lưu ý</p>
        <ul className="space-y-1 text-blue/80 list-disc list-inside">
          <li>Thao tác này sẽ <strong>xóa toàn bộ</strong> dữ liệu Sách và Bạn đọc hiện tại</li>
          <li>File Excel cần có 2 sheet: <strong>Readers</strong> và <strong>Books</strong></li>
          <li>Dung lượng tối đa: 10MB</li>
        </ul>
      </div>
    </div>
  );
}
