import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Check, Bold, Italic, List, ListOrdered, Heading2, Heading3, ImagePlus } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { adminApi } from '../../lib/api';
import Modal from '../../components/Modal';
import ImageUploadField from '../../components/ImageUploadField';

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

const EMPTY_FORM = { title: '', summary: '', cover_image: '' };

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef(null);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: '',
  });

  function fetchPosts(p = page) {
    setLoading(true);
    adminApi.get(`/posts?page=${p}&limit=20`)
      .then((r) => {
        setPosts(r.data.data || []);
        setTotalPages(r.data.meta?.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchPosts(page); }, [page]);

  function openCreate() {
    setForm(EMPTY_FORM);
    editor?.commands.setContent('');
    setModal('create');
  }

  async function openEdit(post) {
    try {
      const r = await adminApi.get(`/posts/${post.id}`);
      const full = r.data.data;
      setForm({ title: full.title || '', summary: full.summary || '', cover_image: full.cover_image || '' });
      editor?.commands.setContent(full.content || '');
      setEditId(post.id);
      setModal('edit');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi tải bài viết');
    }
  }

  async function handleInsertImage() {
    imageInputRef.current?.click();
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
      alert(err.response?.data?.message || 'Upload ảnh thất bại');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSave() {
    const content = editor?.getHTML() || '';
    if (!form.title || !content || content === '<p></p>') {
      alert('Cần nhập tiêu đề và nội dung bài viết');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, content };
      if (modal === 'create') await adminApi.post('/posts', payload);
      else await adminApi.put(`/posts/${editId}`, payload);
      setModal(null);
      fetchPosts(page);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xoá bài viết này?')) return;
    await adminApi.delete(`/posts/${id}`).catch(() => {});
    fetchPosts(page);
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none';
  const labelCls = 'block text-xs font-semibold text-blue uppercase tracking-wide mb-1';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue">Bài viết</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-light transition-colors">
          <Plus size={16} /> Đăng bài
        </button>
      </div>

      {loading
        ? <p className="text-muted text-sm">Đang tải...</p>
        : posts.length === 0
          ? <p className="text-muted text-sm italic">Chưa có bài viết nào</p>
          : (
            <div className="space-y-2">
              {posts.map((p) => (
                <div key={p.id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-3 hover:shadow-sm transition-shadow">
                  <div className="w-14 h-10 bg-cream rounded flex items-center justify-center shrink-0 overflow-hidden">
                    {p.cover_image ? <img src={p.cover_image} alt="" className="w-full h-full object-cover" /> : <span>📰</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-blue text-sm truncate">{p.title}</p>
                    <p className="text-muted text-xs truncate">/news/{p.slug} · {new Date(p.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(p)} className="p-2 text-blue hover:bg-blue/10 rounded-lg transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-semibold ${p === page ? 'bg-blue text-white' : 'border border-blue text-blue hover:bg-blue/10'}`}>{p}</button>
          ))}
        </div>
      )}

      {modal && (
        <Modal wide title={modal === 'create' ? 'Đăng bài viết' : 'Chỉnh sửa bài viết'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Tiêu đề bài viết *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
              {modal === 'create' && form.title && (
                <p className="text-muted text-xs mt-1">Slug URL sẽ tự tạo từ tiêu đề</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Tóm tắt</label>
              <textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={`${inputCls} resize-none`} />
            </div>
            <ImageUploadField label="Ảnh bìa" value={form.cover_image} onChange={(url) => setForm({ ...form, cover_image: url })} />
            <div>
              <label className={labelCls}>Nội dung chính *</label>
              <PostEditor editor={editor} onInsertImage={handleInsertImage} uploading={uploading} />
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageFile} className="hidden" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-muted hover:text-blue">Huỷ</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-light disabled:opacity-50">
              <Check size={15} /> {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
