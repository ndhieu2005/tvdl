import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../lib/api';
import { useToast } from '../components/ui/Toast';
import { useConfirm } from '../components/ui/ConfirmDialog';

/**
 * Gói toàn bộ state + handler lặp lại của 1 trang admin CRUD (page/limit):
 * list, pagination, modal create/edit, save, delete (kèm toast + confirm).
 *
 * const crud = useCrudList({ endpoint: '/events', emptyForm: EMPTY_FORM,
 *   toForm: (item) => ({...}), confirmDelete: 'Xoá sự kiện này?' });
 */
export default function useCrudList({ endpoint, emptyForm, toForm, confirmDelete = 'Xoá mục này?', limit = 20 }) {
  const toast = useToast();
  const confirm = useConfirm();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchList = useCallback((p = page) => {
    setLoading(true);
    adminApi.get(`${endpoint}?page=${p}&limit=${limit}`)
      .then((r) => {
        setItems(r.data.data || []);
        setTotalPages(r.data.meta?.totalPages || 1);
      })
      .catch(() => toast.error('Không tải được danh sách'))
      .finally(() => setLoading(false));
  }, [endpoint, limit, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // fetch pattern: bật loading sync khi đổi trang là chủ đích, không gây cascade
  useEffect(() => { fetchList(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  function openCreate(overrides = {}) {
    setForm({ ...emptyForm, ...overrides });
    setModal('create');
  }

  function openEdit(item) {
    setForm(toForm ? toForm(item) : { ...item });
    setEditId(item.id);
    setModal('edit');
  }

  /** payload mặc định là form; truyền buildPayload để biến đổi trước khi gửi */
  async function handleSave(buildPayload) {
    setSaving(true);
    try {
      const payload = buildPayload ? buildPayload(form, modal) : form;
      if (modal === 'create') await adminApi.post(endpoint, payload);
      else await adminApi.put(`${endpoint}/${editId}`, payload);
      setModal(null);
      toast.success(modal === 'create' ? 'Đã thêm thành công' : 'Đã cập nhật');
      fetchList(page);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!(await confirm(confirmDelete))) return;
    try {
      await adminApi.delete(`${endpoint}/${id}`);
      toast.success('Đã xoá');
      fetchList(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    }
  }

  return {
    items, page, setPage, totalPages, loading,
    modal, setModal, form, setForm, editId, saving,
    fetchList, openCreate, openEdit, handleSave, handleDelete,
  };
}
