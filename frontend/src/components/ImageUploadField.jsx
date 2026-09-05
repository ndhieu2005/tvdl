import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { adminApi } from '../lib/api';
import { useToast } from './ui/Toast';

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// Ô nhập URL ảnh kèm nút chọn file: upload qua /admin/uploads rồi tự điền URL trả về
export default function ImageUploadField({ label, value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`Ảnh quá lớn. Kích thước tối đa là ${MAX_SIZE_MB} MB.`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const r = await adminApi.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(r.data.data.url);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload ảnh thất bại');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-blue uppercase tracking-wide mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Dán URL hoặc chọn file"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 border border-blue text-blue px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue/10 disabled:opacity-50 shrink-0"
        >
          <Upload size={14} /> {uploading ? 'Đang tải...' : 'Chọn file'}
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} className="hidden" />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {value && (
        <img src={value} alt="preview" className="mt-2 h-20 rounded border border-gray-200 object-cover" />
      )}
    </div>
  );
}
