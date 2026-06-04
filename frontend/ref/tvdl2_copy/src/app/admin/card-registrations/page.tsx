'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Download, 
  Search, 
  Filter, 
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  FileX,
  Ban
} from 'lucide-react';

interface CardRegistration {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  idNumber: string;
  phone?: string;
  parentPhone?: string;
  email: string;
  address: string;
  occupation?: string;
  workplace?: string;
  purpose?: string;
  agreeTerms: boolean;
  agreeNewsletter?: boolean;
  age: number;
  isUnder15: boolean;
  status: 'PENDING' | 'APPROVED' | 'ISSUED' | 'REJECTED' | 'LOST' | 'REVOKED' | 'EXPIRED';
  cardNumber?: string;
  issuedDate?: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function CardRegistrationsPage() {
  const [registrations, setRegistrations] = useState<CardRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<CardRegistration | null>(null);
  const [editingRegistration, setEditingRegistration] = useState<CardRegistration | null>(null);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    cardNumber: '',
    notes: ''
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [goToPage, setGoToPage] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async (page: number = 1, limit?: number) => {
    try {
      setLoading(true);
      const currentLimit = limit || itemsPerPage;
      
      console.log('📋 Fetching registrations with params:', {
        page,
        limit: currentLimit,
        statusFilter,
        searchTerm,
        fromDate,
        toDate
      });
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: currentLimit.toString()
      });
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      if (searchTerm) params.append('search', searchTerm);
      
      console.log('📋 API URL:', `/api/services/card-registration?${params.toString()}`);
      
      const response = await fetch(`/api/services/card-registration?${params.toString()}`);
      const result = await response.json();
      
      console.log('📋 API Response:', {
        success: result.success,
        dataCount: result.data?.length,
        pagination: result.pagination
      });
      
      if (result.success) {
        setRegistrations(result.data || []);
        if (result.pagination) {
          setPagination(result.pagination);
          setCurrentPage(page);
        }
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lại khi filter thay đổi
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRegistrations(1); // Reset to page 1 when filters change
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [statusFilter, fromDate, toDate, searchTerm]);

  // Sync itemsPerPage with pagination.limit when data is loaded
  useEffect(() => {
    if (pagination.limit && pagination.limit !== itemsPerPage) {
      setItemsPerPage(pagination.limit);
    }
  }, [pagination.limit]);

  // Pagination handlers
  const handleItemsPerPageChange = (newLimit: number) => {
    console.log('🔄 Changing items per page:', {
      oldLimit: itemsPerPage,
      newLimit,
      currentPage,
      total: pagination.total
    });
    
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    fetchRegistrations(1, newLimit);
  };

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(goToPage);
    if (pageNum >= 1 && pageNum <= pagination.totalPages) {
      fetchRegistrations(pageNum);
      setGoToPage('');
    }
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(pagination.totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < pagination.totalPages - 1) {
      rangeWithDots.push('...', pagination.totalPages);
    } else {
      rangeWithDots.push(pagination.totalPages);
    }

    return rangeWithDots.filter((page, index, array) => array.indexOf(page) === index);
  };

  const handleUpdateStatus = async () => {
    if (!editingRegistration) return;

    try {
      const response = await fetch(`/api/services/card-registration/${editingRegistration.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updateForm.status,
          cardNumber: updateForm.cardNumber,
          notes: updateForm.notes,
          updatedBy: 'admin' // TODO: Get from auth context
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Cập nhật trạng thái thành công!');
        setEditingRegistration(null);
        setUpdateForm({ status: '', cardNumber: '', notes: '' });
        fetchRegistrations();
      } else {
        alert(result.message || 'Có lỗi xảy ra khi cập nhật');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Có lỗi xảy ra khi cập nhật');
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) return;

    try {
      const response = await fetch(`/api/services/card-registration/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('Xóa đăng ký thành công!');
        fetchRegistrations();
      } else {
        alert(result.message || 'Có lỗi xảy ra khi xóa');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Có lỗi xảy ra khi xóa');
    }
  };

  const openEditModal = (registration: CardRegistration) => {
    setEditingRegistration(registration);
    setUpdateForm({
      status: registration.status,
      cardNumber: registration.cardNumber || '',
      notes: registration.notes || ''
    });
  };

  const exportToExcel = () => {
    // Tạo CSV content
    const headers = [
      'ID',
      'Họ và tên',
      'Ngày sinh',
      'Tuổi',
      'Giới tính',
      'Số CCCD/CMND',
      'Số điện thoại',
      'Số điện thoại phụ huynh',
      'Email',
      'Địa chỉ',
      'Nghề nghiệp',
      'Nơi làm việc',
      'Mục đích',
      'Trạng thái',
      'Số thẻ',
      'Ngày cấp thẻ',
      'Ngày hết hạn',
      'Ghi chú',
      'Đồng ý nhận tin',
      'Ngày đăng ký',
      'Cập nhật lần cuối'
    ];

    const getStatusText = (status: string) => {
      switch (status) {
        case 'PENDING': return 'Chờ xử lý';
        case 'APPROVED': return 'Đã duyệt';
        case 'ISSUED': return 'Đã cấp thẻ';
        case 'REJECTED': return 'Từ chối';
        case 'LOST': return 'Mất thẻ';
        case 'REVOKED': return 'Thu hồi';
        case 'EXPIRED': return 'Hết hạn';
        default: return status;
      }
    };

    const csvContent = [
      headers.join(','),
      ...registrations.map(reg => [
        reg.id,
        `"${reg.fullName}"`,
        reg.dateOfBirth,
        reg.age,
        reg.gender === 'male' ? 'Nam' : reg.gender === 'female' ? 'Nữ' : 'Khác',
        reg.idNumber,
        reg.phone || '',
        reg.parentPhone || '',
        reg.email,
        `"${reg.address}"`,
        reg.occupation || '',
        reg.workplace || '',
        `"${reg.purpose || ''}"`,
        getStatusText(reg.status),
        reg.cardNumber || '',
        reg.issuedDate ? new Date(reg.issuedDate).toLocaleDateString('vi-VN') : '',
        reg.expiryDate ? new Date(reg.expiryDate).toLocaleDateString('vi-VN') : '',
        `"${reg.notes || ''}"`,
        reg.agreeNewsletter ? 'Có' : 'Không',
        new Date(reg.createdAt).toLocaleDateString('vi-VN'),
        new Date(reg.updatedAt).toLocaleDateString('vi-VN')
      ].join(','))
    ].join('\n');

    // Tạo tên file với filter hiện tại
    let fileName = 'danh-sach-dang-ky-the';
    if (statusFilter !== 'all') fileName += `-${statusFilter.toLowerCase()}`;
    if (fromDate) fileName += `-tu-${fromDate}`;
    if (toDate) fileName += `-den-${toDate}`;
    fileName += `-${new Date().toISOString().split('T')[0]}.csv`;

    // Download file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Filter được xử lý ở backend thông qua API

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Chờ xử lý</Badge>;
      case 'APPROVED':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Đã duyệt</Badge>;
      case 'ISSUED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CreditCard className="w-3 h-3 mr-1" />Đã cấp thẻ</Badge>;
      case 'REJECTED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Từ chối</Badge>;
      case 'LOST':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3 mr-1" />Mất thẻ</Badge>;
      case 'REVOKED':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800"><Ban className="w-3 h-3 mr-1" />Thu hồi</Badge>;
      case 'EXPIRED':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><FileX className="w-3 h-3 mr-1" />Hết hạn</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Đăng ký làm thẻ</h1>
          <p className="text-sm sm:text-base text-gray-600">Quản lý danh sách đăng ký làm thẻ thư viện</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Tổng đăng ký</p>
                <p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">{registrations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Chờ xử lý</p>
                <p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">
                  {registrations.filter(r => r.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Đã cấp thẻ</p>
                <p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">
                  {registrations.filter(r => r.status === 'ISSUED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Trẻ dưới 15</p>
                <p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">
                  {registrations.filter(r => r.isUnder15).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Row 1: Search and Status Filter */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email, CCCD..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-sm">
                    <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                    <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                    <SelectItem value="ISSUED">Đã cấp thẻ</SelectItem>
                    <SelectItem value="REJECTED">Từ chối</SelectItem>
                    <SelectItem value="LOST">Mất thẻ</SelectItem>
                    <SelectItem value="REVOKED">Thu hồi</SelectItem>
                    <SelectItem value="EXPIRED">Hết hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Date Filter and Export */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Từ ngày:</span>
                </div>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full sm:w-auto text-sm"
                />
                <span className="text-xs sm:text-sm text-gray-600 self-center flex-shrink-0">đến</span>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full sm:w-auto text-sm"
                />
              </div>
              
              <Button onClick={exportToExcel} variant="outline" className="w-full lg:w-auto flex items-center justify-center space-x-2 text-sm font-medium">
                <Download className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Xuất Excel</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration List */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg">Danh sách đăng ký ({pagination.total})</CardTitle>
          <CardDescription className="text-sm">
            Danh sách các đơn đăng ký làm thẻ thư viện
            {pagination.total > 0 && (
              <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0">
                - Hiển thị {((pagination.page - 1) * itemsPerPage) + 1} đến {Math.min(pagination.page * itemsPerPage, pagination.total)} trong tổng số {pagination.total} đăng ký
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {registrations.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-500">Không có đăng ký nào</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {registrations.map((registration, index) => (
                <div key={index} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">{registration.fullName}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-1">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{registration.age} tuổi</span>
                            </span>
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{registration.email}</span>
                            </span>
                            <span className="flex items-center">
                              <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                {registration.isUnder15 ? registration.parentPhone : registration.phone}
                                {registration.isUnder15 && <span className="ml-1 text-orange-600">(PH)</span>}
                              </span>
                            </span>
                            {registration.cardNumber && (
                              <span className="flex items-center font-medium text-blue-600">
                                <CreditCard className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{registration.cardNumber}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        {getStatusBadge(registration.status)}
                        <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                          {new Date(registration.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRegistration(registration)}
                          className="flex-1 sm:flex-initial text-xs sm:text-sm p-2"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Xem</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(registration)}
                          className="flex-1 sm:flex-initial text-blue-600 hover:text-blue-700 text-xs sm:text-sm p-2"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Sửa</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRegistration(registration.id)}
                          className="flex-1 sm:flex-initial text-red-600 hover:text-red-700 text-xs sm:text-sm p-2"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Xóa</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 border-t pt-6">
              {/* Mobile pagination */}
              <div className="flex items-center justify-between sm:hidden">
                <button
                  onClick={() => fetchRegistrations(currentPage - 1)}
                  disabled={!pagination.hasPrev || loading}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span className="text-sm text-gray-700">
                  Trang {currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchRegistrations(currentPage + 1)}
                  disabled={!pagination.hasNext || loading}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
              
              {/* Desktop pagination */}
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
                      Hiển thị:
                    </label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-700">mục/trang</span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-700">
                      Hiển thị{' '}
                      <span className="font-medium">{((pagination.page - 1) * itemsPerPage) + 1}</span>
                      {' '}đến{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * itemsPerPage, pagination.total)}
                      </span>
                      {' '}trong tổng số{' '}
                      <span className="font-medium">{pagination.total}</span> đăng ký
                    </p>
                  </div>
                  
                  <form onSubmit={handleGoToPage} className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Đến trang:</span>
                    <input
                      type="number"
                      min="1"
                      max={pagination.totalPages}
                      value={goToPage}
                      onChange={(e) => setGoToPage(e.target.value)}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={currentPage.toString()}
                    />
                    <button
                      type="submit"
                      disabled={!goToPage || loading}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Đi
                    </button>
                  </form>
                </div>
                
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => fetchRegistrations(currentPage - 1)}
                      disabled={!pagination.hasPrev || loading}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Trang trước</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {getVisiblePages().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' ? fetchRegistrations(page) : undefined}
                        disabled={typeof page !== 'number' || loading}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                            : typeof page === 'number'
                            ? 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            : 'bg-white border-gray-300 text-gray-300 cursor-default'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => fetchRegistrations(currentPage + 1)}
                      disabled={!pagination.hasNext || loading}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Trang sau</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Chi tiết đăng ký</h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedRegistration(null)}
                >
                  Đóng
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Họ và tên</label>
                    <p className="text-gray-900">{selectedRegistration.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ngày sinh</label>
                    <p className="text-gray-900">{selectedRegistration.dateOfBirth} ({selectedRegistration.age} tuổi)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Giới tính</label>
                    <p className="text-gray-900">
                      {selectedRegistration.gender === 'male' ? 'Nam' : 
                       selectedRegistration.gender === 'female' ? 'Nữ' : 'Khác'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Số CCCD/CMND</label>
                    <p className="text-gray-900">{selectedRegistration.idNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {selectedRegistration.isUnder15 ? 'Số điện thoại cá nhân' : 'Số điện thoại'}
                    </label>
                    <p className="text-gray-900">{selectedRegistration.phone || 'Không có'}</p>
                  </div>
                  {selectedRegistration.isUnder15 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Số điện thoại phụ huynh</label>
                      <p className="text-gray-900">{selectedRegistration.parentPhone}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedRegistration.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Địa chỉ</label>
                  <p className="text-gray-900">{selectedRegistration.address}</p>
                </div>

                {/* Thông tin thẻ */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Thông tin thẻ thư viện
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-blue-700">Số thẻ</label>
                      <p className="text-blue-900 font-mono">
                        {selectedRegistration.cardNumber || 'Chưa cấp'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Trạng thái</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedRegistration.status)}
                      </div>
                    </div>
                    {selectedRegistration.issuedDate && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-blue-700">Ngày cấp</label>
                          <p className="text-blue-900">
                            {new Date(selectedRegistration.issuedDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-blue-700">Ngày hết hạn</label>
                          <p className="text-blue-900">
                            {selectedRegistration.expiryDate 
                              ? new Date(selectedRegistration.expiryDate).toLocaleDateString('vi-VN')
                              : 'Không xác định'
                            }
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {selectedRegistration.occupation && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nghề nghiệp</label>
                      <p className="text-gray-900">{selectedRegistration.occupation}</p>
                    </div>
                    {selectedRegistration.workplace && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nơi làm việc</label>
                        <p className="text-gray-900">{selectedRegistration.workplace}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedRegistration.purpose && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Mục đích sử dụng</label>
                    <p className="text-gray-900">{selectedRegistration.purpose}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Trạng thái</label>
                    <div className="mt-1">{getStatusBadge(selectedRegistration.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ngày đăng ký</label>
                    <p className="text-gray-900">
                      {new Date(selectedRegistration.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Nhận tin tức</label>
                  <p className="text-gray-900">{selectedRegistration.agreeNewsletter ? 'Có' : 'Không'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editingRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Cập nhật trạng thái</h2>
                <Button
                  variant="outline"
                  onClick={() => setEditingRegistration(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Đăng ký của: {editingRegistration.fullName}
                  </Label>
                  <p className="text-sm text-gray-500">CCCD: {editingRegistration.idNumber}</p>
                </div>

                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select value={updateForm.status} onValueChange={(value) => setUpdateForm({...updateForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                      <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                      <SelectItem value="ISSUED">Đã cấp thẻ</SelectItem>
                      <SelectItem value="REJECTED">Từ chối</SelectItem>
                      <SelectItem value="LOST">Mất thẻ</SelectItem>
                      <SelectItem value="REVOKED">Thu hồi</SelectItem>
                      <SelectItem value="EXPIRED">Hết hạn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {updateForm.status === 'ISSUED' && (
                  <div>
                    <Label htmlFor="cardNumber">Số thẻ</Label>
                    <Input
                      id="cardNumber"
                      value={updateForm.cardNumber}
                      onChange={(e) => setUpdateForm({...updateForm, cardNumber: e.target.value})}
                      placeholder="Nhập số thẻ hoặc để trống để tự động tạo"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nếu để trống, hệ thống sẽ tự động tạo mã số thẻ theo format: TV{new Date().getFullYear()}XXXXXX
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    value={updateForm.notes}
                    onChange={(e) => setUpdateForm({...updateForm, notes: e.target.value})}
                    placeholder="Ghi chú thêm (tùy chọn)"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleUpdateStatus}
                    className="flex-1"
                    disabled={!updateForm.status}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Cập nhật
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingRegistration(null)}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}