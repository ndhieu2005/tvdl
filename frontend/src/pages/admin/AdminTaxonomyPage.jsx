import { useState, useEffect } from 'react';
import {
  MapPin,
  Tags,
  Plus,
  Pencil,
  Trash2,
  Check,
  Building2,
  Bookmark,
  Search,
  BookOpen,
} from 'lucide-react';
import { adminApi, api } from '../../lib/api';
import Modal from '../../components/Modal';
import { FormField, TextInput, Select } from '../../components/ui/FormField';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/ConfirmDialog';

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#1B3F8B', '#F5C000', '#06B6D4', '#EC4899', '#64748B',
];

const LOCATION_TYPE_LABELS = {
  branch: 'Cơ sở cố định',
  mobile: 'Dự án lưu động',
  other: 'Khác',
};

const EMPTY_LOCATION_FORM = {
  name: '',
  type: 'branch',
  color_code: '#3B82F6',
  address: '',
};

const EMPTY_CATEGORY_FORM = {
  name: '',
  age_group_id: '',
};

export default function AdminTaxonomyPage() {
  const toast = useToast();
  const confirm = useConfirm();

  // Active tab: 'locations' | 'categories'
  const [activeTab, setActiveTab] = useState('locations');

  // Data states
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [selectedAgeGroupFilter, setSelectedAgeGroupFilter] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  // Modal states for Locations
  const [locationModal, setLocationModal] = useState(null); // 'create' | 'edit' | null
  const [locationForm, setLocationForm] = useState(EMPTY_LOCATION_FORM);
  const [editLocationId, setEditLocationId] = useState(null);
  const [locationErrors, setLocationErrors] = useState({});
  const [savingLocation, setSavingLocation] = useState(false);

  // Modal states for Categories
  const [categoryModal, setCategoryModal] = useState(null); // 'create' | 'edit' | null
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [categoryErrors, setCategoryErrors] = useState({});
  const [savingCategory, setSavingCategory] = useState(false);

  // Fetch all initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [locRes, catRes, ageRes] = await Promise.all([
        adminApi.get('/locations'),
        adminApi.get('/categories'),
        adminApi.get('/age-groups'),
      ]);
      setLocations(locRes.data?.data || []);
      setCategories(catRes.data?.data || []);
      setAgeGroups(ageRes.data?.data || []);
    } catch (err) {
      toast.error('Không tải được danh mục cơ sở và thể loại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------------- LOCATIONS HANDLERS ---------------- */

  const openCreateLocation = () => {
    setLocationForm(EMPTY_LOCATION_FORM);
    setLocationErrors({});
    setLocationModal('create');
  };

  const openEditLocation = (loc) => {
    setLocationForm({
      name: loc.name || '',
      type: loc.type || 'branch',
      color_code: loc.color_code || '#3B82F6',
      address: loc.address || '',
    });
    setEditLocationId(loc.id);
    setLocationErrors({});
    setLocationModal('edit');
  };

  const handleSaveLocation = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!locationForm.name?.trim()) errs.name = 'Vui lòng nhập tên cơ sở';
    setLocationErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingLocation(true);
    try {
      const payload = {
        name: locationForm.name.trim(),
        type: locationForm.type || 'branch',
        color_code: locationForm.color_code || '#3B82F6',
        address: locationForm.address?.trim() || null,
      };

      if (locationModal === 'create') {
        await adminApi.post('/locations', payload);
        toast.success('Thêm cơ sở thành công');
      } else {
        await adminApi.put(`/locations/${editLocationId}`, payload);
        toast.success('Cập nhật cơ sở thành công');
      }

      setLocationModal(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu cơ sở');
    } finally {
      setSavingLocation(false);
    }
  };

  const handleDeleteLocation = async (id, name) => {
    if (!(await confirm(`Bạn có chắc muốn xoá cơ sở "${name}" không?`))) return;
    try {
      await adminApi.delete(`/locations/${id}`);
      toast.success('Đã xoá cơ sở');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xoá cơ sở thất bại');
    }
  };

  /* ---------------- CATEGORIES HANDLERS ---------------- */

  const openCreateCategory = () => {
    setCategoryForm({
      name: '',
      age_group_id: ageGroups[0]?.id ? String(ageGroups[0].id) : '',
    });
    setCategoryErrors({});
    setCategoryModal('create');
  };

  const openEditCategory = (cat) => {
    setCategoryForm({
      name: cat.name || '',
      age_group_id: cat.age_group_id ? String(cat.age_group_id) : (cat.age_group?.id ? String(cat.age_group.id) : ''),
    });
    setEditCategoryId(cat.id);
    setCategoryErrors({});
    setCategoryModal('edit');
  };

  const handleSaveCategory = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!categoryForm.name?.trim()) errs.name = 'Vui lòng nhập tên thể loại';
    if (!categoryForm.age_group_id) errs.age_group_id = 'Vui lòng chọn nhóm tuổi';
    setCategoryErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingCategory(true);
    try {
      const payload = {
        name: categoryForm.name.trim(),
        age_group_id: parseInt(categoryForm.age_group_id),
      };

      if (categoryModal === 'create') {
        await adminApi.post('/categories', payload);
        toast.success('Thêm thể loại thành công');
      } else {
        await adminApi.put(`/categories/${editCategoryId}`, payload);
        toast.success('Cập nhật thể loại thành công');
      }

      setCategoryModal(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thể loại');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!(await confirm(`Bạn có chắc muốn xoá thể loại "${name}" không?`))) return;
    try {
      await adminApi.delete(`/categories/${id}`);
      toast.success('Đã xoá thể loại');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xoá thể loại thất bại');
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((c) => {
    const matchAge = !selectedAgeGroupFilter || String(c.age_group_id) === String(selectedAgeGroupFilter);
    const matchSearch = !categorySearch.trim() || c.name.toLowerCase().includes(categorySearch.trim().toLowerCase());
    return matchAge && matchSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue">Cơ sở & Thể loại</h1>
          <p className="text-muted text-xs mt-1">
            Quản lý các cơ sở chi nhánh thư viện và phân loại thể loại sách theo lứa tuổi.
          </p>
        </div>

        <div>
          {activeTab === 'locations' ? (
            <button
              onClick={openCreateLocation}
              className="flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-light transition-colors shadow-xs"
            >
              <Plus size={16} /> Thêm cơ sở
            </button>
          ) : (
            <button
              onClick={openCreateCategory}
              className="flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-light transition-colors shadow-xs"
            >
              <Plus size={16} /> Thêm thể loại
            </button>
          )}
        </div>
      </div>

      {/* Tabs chuyển đổi */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('locations')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'locations'
              ? 'border-blue text-blue bg-white'
              : 'border-transparent text-gray-500 hover:text-blue hover:bg-white/50'
          }`}
        >
          <Building2 size={18} />
          <span>Cơ sở thư viện</span>
          <span className="bg-blue/10 text-blue text-xs px-2 py-0.5 rounded-full font-semibold">
            {locations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'categories'
              ? 'border-blue text-blue bg-white'
              : 'border-transparent text-gray-500 hover:text-blue hover:bg-white/50'
          }`}
        >
          <Bookmark size={18} />
          <span>Thể loại sách</span>
          <span className="bg-yellow/20 text-[#92400E] text-xs px-2 py-0.5 rounded-full font-semibold">
            {categories.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-12 text-center text-muted text-sm animate-pulse">
          Đang tải dữ liệu cơ sở & thể loại...
        </div>
      ) : activeTab === 'locations' ? (
        /* ---------------- TAB 1: LOCATIONS ---------------- */
        <div className="space-y-4">
          {locations.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <MapPin size={40} className="mx-auto text-blue/30 mb-2" />
              <p className="text-gray-600 font-semibold text-sm">Chưa có cơ sở nào</p>
              <p className="text-muted text-xs mt-1">Bấm "Thêm cơ sở" để tạo cơ sở đầu tiên.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Header card: Tên cơ sở & Badge loại */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-black/10"
                          style={{ backgroundColor: loc.color_code || '#3B82F6' }}
                          title={`Mã màu: ${loc.color_code || '#3B82F6'}`}
                        />
                        <h3 className="font-bold text-blue text-base">{loc.name}</h3>
                      </div>
                      <span className="bg-gray-100 text-gray-600 text-[11px] font-semibold px-2 py-0.5 rounded shrink-0">
                        {LOCATION_TYPE_LABELS[loc.type] || loc.type}
                      </span>
                    </div>

                    {/* Địa chỉ */}
                    {loc.address ? (
                      <p className="text-xs text-gray-600 mt-2 flex items-start gap-1.5 leading-relaxed">
                        <MapPin size={13} className="text-muted shrink-0 mt-0.5" />
                        <span>{loc.address}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-muted italic mt-2">Chưa cập nhật địa chỉ</p>
                    )}

                    {/* Thống kê liên kết */}
                    {loc._count && (
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                        <span>{loc._count.new_books || 0} sách mới</span>
                        <span>•</span>
                        <span>{loc._count.events || 0} sự kiện</span>
                        <span>•</span>
                        <span>{loc._count.schedules || 0} ca trực</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                    <button
                      onClick={() => openEditLocation(loc)}
                      className="p-1.5 text-blue hover:bg-blue/10 rounded-lg transition-colors"
                      title="Chỉnh sửa cơ sở"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(loc.id, loc.name)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xoá cơ sở"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ---------------- TAB 2: CATEGORIES ---------------- */
        <div className="space-y-4">
          {/* Thanh lọc & tìm kiếm thể loại */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-72 relative flex items-center">
              <Search size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Tìm kiếm thể loại..."
                className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#2D2D2D] placeholder-gray-400 focus:outline-none focus:border-blue transition-colors"
              />
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <span className="text-xs text-muted font-semibold shrink-0">Nhóm tuổi:</span>
              <select
                value={selectedAgeGroupFilter}
                onChange={(e) => setSelectedAgeGroupFilter(e.target.value)}
                className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-[#2D2D2D] focus:outline-none focus:border-blue cursor-pointer"
              >
                <option value="">Tất cả nhóm tuổi ({categories.length})</option>
                {ageGroups.map((ag) => (
                  <option key={ag.id} value={String(ag.id)}>
                    {ag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Danh sách Thể loại */}
          {filteredCategories.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <Tags size={40} className="mx-auto text-blue/30 mb-2" />
              <p className="text-gray-600 font-semibold text-sm">Không tìm thấy thể loại phù hợp</p>
              <p className="text-muted text-xs mt-1">Bấm "Thêm thể loại" để tạo mới.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Tên thể loại</th>
                    <th className="px-6 py-3.5">Nhóm tuổi</th>
                    <th className="px-6 py-3.5 text-center">Số sách</th>
                    <th className="px-6 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-blue">
                        {cat.name}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue/10 text-blue">
                          {cat.age_group?.name || 'Chưa phân nhóm'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center text-xs text-gray-500">
                        {cat._count?.new_books || 0} sách mới
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditCategory(cat)}
                            className="p-1.5 text-blue hover:bg-blue/10 rounded-lg transition-colors"
                            title="Sửa thể loại"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xoá thể loại"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODAL CƠ SỞ ---------------- */}
      {locationModal && (
        <Modal
          title={locationModal === 'create' ? 'Thêm cơ sở mới' : 'Chỉnh sửa cơ sở'}
          onClose={() => setLocationModal(null)}
        >
          <form onSubmit={handleSaveLocation} className="space-y-4">
            <FormField label="Tên cơ sở" required error={locationErrors.name}>
              <TextInput
                value={locationForm.name}
                onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                placeholder="Ví dụ: Cơ sở 1, Cơ sở 2, Dự án lưu động..."
                autoFocus
              />
            </FormField>

            <FormField label="Phân loại cơ sở" required>
              <Select
                value={locationForm.type}
                onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value })}
              >
                <option value="branch">Cơ sở cố định (branch)</option>
                <option value="mobile">Dự án lưu động (mobile)</option>
                <option value="other">Khác (other)</option>
              </Select>
            </FormField>

            <FormField label="Mã màu nhận diện">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={locationForm.color_code || '#3B82F6'}
                    onChange={(e) => setLocationForm({ ...locationForm, color_code: e.target.value })}
                    className="w-9 h-9 p-0.5 border border-gray-200 rounded cursor-pointer"
                  />
                  <TextInput
                    value={locationForm.color_code}
                    onChange={(e) => setLocationForm({ ...locationForm, color_code: e.target.value })}
                    placeholder="#3B82F6"
                    className="w-36 font-mono text-xs"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setLocationForm({ ...locationForm, color_code: c })}
                      className="w-5 h-5 rounded-full border border-black/10 transition-transform hover:scale-110"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </FormField>

            <FormField label="Địa chỉ cơ sở">
              <TextInput
                value={locationForm.address}
                onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                placeholder="Ví dụ: 18/56 Đường Thống Nhất, Dương Hòa, Hà Nội..."
              />
            </FormField>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setLocationModal(null)}
                className="px-4 py-2 text-sm text-muted hover:text-blue transition-colors"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={savingLocation}
                className="flex items-center gap-2 bg-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-light disabled:opacity-50 transition-colors"
              >
                <Check size={15} /> {savingLocation ? 'Đang lưu...' : 'Lưu cơ sở'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------------- MODAL THỂ LOẠI ---------------- */}
      {categoryModal && (
        <Modal
          title={categoryModal === 'create' ? 'Thêm thể loại mới' : 'Chỉnh sửa thể loại'}
          onClose={() => setCategoryModal(null)}
        >
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <FormField label="Tên thể loại sách" required error={categoryErrors.name}>
              <TextInput
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Ví dụ: Truyện tranh, Khoa học, Văn học thiếu nhi..."
                autoFocus
              />
            </FormField>

            <FormField label="Nhóm tuổi trực thuộc" required error={categoryErrors.age_group_id}>
              <Select
                value={categoryForm.age_group_id}
                onChange={(e) => setCategoryForm({ ...categoryForm, age_group_id: e.target.value })}
              >
                <option value="">— Chọn nhóm tuổi —</option>
                {ageGroups.map((ag) => (
                  <option key={ag.id} value={String(ag.id)}>
                    {ag.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCategoryModal(null)}
                className="px-4 py-2 text-sm text-muted hover:text-blue transition-colors"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={savingCategory}
                className="flex items-center gap-2 bg-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-light disabled:opacity-50 transition-colors"
              >
                <Check size={15} /> {savingCategory ? 'Đang lưu...' : 'Lưu thể loại'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
