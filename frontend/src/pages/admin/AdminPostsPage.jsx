import { useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Check, Star, Bold, Italic, List, ListOrdered, Heading2, Heading3, ImagePlus } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { adminApi } from '../../lib/api';
import Modal from '../../components/Modal';
import ImageUploadField from '../../components/ImageUploadField';
import Pagination from '../../components/ui/Pagination';
import { FormField, TextInput, TextArea } from '../../components/ui/FormField';
import { useToast } from '../../components/ui/Toast';
import useCrudList from '../../hooks/useCrudList';

function ToolbarButton({ onClick, active, children, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-blue text-white' : 'text-blue hover:bg-blue/10'}`}
    >
      {children}
    </button>
  );
}

function PostEditor({ editor, onInsertImage, uploading }) {
  if (!editor) return null;
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5 flex-wrap">
        <ToolbarButton title="Đậm" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15} /></ToolbarButton>
        <ToolbarButton title="Nghiêng" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15} /></ToolbarButton>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton title="Đề mục lớn" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={15} /></ToolbarButton>
        <ToolbarButton title="Đề mục nhỏ" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={15} /></ToolbarButton>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton title="Danh sách" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={15} /></ToolbarButton>
        <ToolbarButton title="Danh sách số" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={15} /></ToolbarButton>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton title="Chèn ảnh" onClick={onInsertImage}>
          <ImagePlus size={15} className={uploading ? 'animate-pulse' : ''} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="post-editor px-3 py-2 min-h-[220px] text-sm" />
    </div>
  );
}

const EMPTY_FORM = { title: '', summary: '', cover_image: '', is_featured: false };

export default function AdminPostsPage() {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef(null);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: '',
  });

  const crud = useCrudList({
    endpoint: '/posts',
    emptyForm: EMPTY_FORM,
    confirmDelete: 'Xoá bài viết này?',
    validate: (f) => {
      const errs = {};
      if (!f.title.trim()) errs.title = 'Nhập tiêu đề bài viết';
      const content = editor?.getHTML() || '';
      if (!content || content === '<p></p>') errs.content = 'Nhập nội dung bài viết';
      return errs;
    },
  });
  const { form, setForm } = crud;

  function openCreate() {
    editor?.commands.setContent('');
    crud.openCreate();
  }

  async function openEdit(post) {
    try {
      const r = await adminApi.get(`/posts/${post.id}`);
      const full = r.data.data;
      editor?.commands.setContent(full.content || '');
      crud.openEdit({
        id: full.id,
        title: full.title || '',
        summary: full.summary || '',
        cover_image: full.cover_image || '',
        is_featured: !!full.is_featured,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi tải bài viết');
    }
  }

  async function handleToggleFeatured(post) {
    try {
      const res = await adminApi.patch(`/posts/${post.id}/featured`);
      toast.success(res.data?.message || 'Cập nhật thành công');
      crud.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật nổi bật');
    }
  }

  async function handleImageFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const r = await adminApi.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      editor?.chain().focus().setImage({ src: r.data.data.url }).run();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload ảnh thất bại');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function save() {
    const content = editor?.getHTML() || '';
    crud.handleSave((f) => ({
      title: f.title,
      summary: f.summary,
      cover_image: f.cover_image,
      is_featured: f.is_featured,
      content,
    }));
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue">Bài viết</h1>
          <p className="text-muted text-xs mt-1">Quản lý bài viết và tin tức. Bạn có thể ghim 1 bài viết làm bài nổi bật hoặc hệ thống sẽ tự động chọn bài mới nhất.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-light transition-colors">
          <Plus size={16} /> Đăng bài
        </button>
      </div>

      {crud.loading
        ? <p className="text-muted text-sm">Đang tải...</p>
        : crud.items.length === 0
          ? <p className="text-muted text-sm italic">Chưa có bài viết nào</p>
          : (
            <div className="space-y-2">
              {crud.items.map((p) => (
                <div key={p.id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-3 hover:shadow-sm transition-shadow">
                  <div className="w-14 h-10 bg-cream rounded flex items-center justify-center shrink-0 overflow-hidden">
                    {p.cover_image ? <img src={p.cover_image} alt="" className="w-full h-full object-cover" /> : <span>📰</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-blue text-sm truncate">{p.title}</p>
                      {p.is_featured && (
                        <span className="inline-flex items-center gap-1 bg-yellow/20 text-yellow-800 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 border border-yellow/40">
                          ⭐ Nổi bật
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted text-xs truncate mt-0.5">
                      <span>/news/{p.slug}</span>
                      <span>·</span>
                      <span>{new Date(p.created_at).toLocaleDateString('vi-VN')}</span>
                      <span>·</span>
                      <span className="text-blue/80 font-medium">Tác giả: {p.author?.name || p.author?.username || '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleFeatured(p)}
                      title={p.is_featured ? 'Bỏ ghim nổi bật' : 'Ghim làm nổi bật'}
                      className={`p-2 rounded-lg transition-colors ${p.is_featured ? 'text-yellow-600 bg-yellow/10 hover:bg-yellow/20' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow/10'}`}
                    >
                      <Star size={16} className={p.is_featured ? 'fill-yellow-500 text-yellow-500' : ''} />
                    </button>
                    <button onClick={() => openEdit(p)} className="p-2 text-blue hover:bg-blue/10 rounded-lg transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => crud.handleDelete(p.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      <Pagination page={crud.page} totalPages={crud.totalPages} onChange={crud.setPage} />

      {crud.modal && (
        <Modal wide title={crud.modal === 'create' ? 'Đăng bài viết' : 'Chỉnh sửa bài viết'} onClose={() => crud.setModal(null)}>
          <div className="space-y-3">
            <FormField label="Tiêu đề bài viết" required error={crud.errors.title}>
              <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              {crud.modal === 'create' && form.title && (
                <p className="text-muted text-xs mt-1">Slug URL sẽ tự tạo từ tiêu đề</p>
              )}
            </FormField>
            <FormField label="Ghim làm bài viết nổi bật?">
              <label className="flex items-center gap-2 mt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="w-4 h-4 text-blue rounded border-gray-300 focus:ring-blue cursor-pointer"
                />
                <span className="text-sm font-medium text-blue">Đặt làm bài viết nổi bật</span>
              </label>
              <p className="text-muted text-xs mt-1">Bài viết nổi bật sẽ hiển thị cố định ở cột bên trái trang Tin tức. Nếu không chọn, hệ thống sẽ tự động chọn bài mới nhất.</p>
            </FormField>
            <FormField label="Tóm tắt">
              <TextArea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </FormField>
            <ImageUploadField label="Ảnh bìa" value={form.cover_image} onChange={(url) => setForm({ ...form, cover_image: url })} />
            <FormField label="Nội dung chính" required error={crud.errors.content}>
              <PostEditor editor={editor} onInsertImage={() => imageInputRef.current?.click()} uploading={uploading} />
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageFile} className="hidden" />
            </FormField>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => crud.setModal(null)} className="px-4 py-2 text-sm text-muted hover:text-blue">Huỷ</button>
            <button onClick={save} disabled={crud.saving} className="flex items-center gap-2 bg-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-light disabled:opacity-50">
              <Check size={15} /> {crud.saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
