'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { LoginAttempt } from '@/types/security';
import { 
  Shield, 
  AlertTriangle, 
  Check, 
  X, 
  Search,
  Filter,
  Trash2,
  Calendar,
  Clock,
  Monitor,
  User,
  Activity
} from 'lucide-react';

interface LoginAttemptsProps {
  token: string;
}

export default function LoginAttemptsComponent({ token }: LoginAttemptsProps) {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    email: '',
    ip: '',
    success: '',
    from: '',
    to: ''
  });
  
  // Statistics
  const [stats, setStats] = useState({
    successful: 0,
    failed: 0,
    total: 0
  });

  useEffect(() => {
    fetchAttempts();
  }, [currentPage, filters]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      const response = await fetch(`/api/admin/security/login-attempts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch login attempts');
      }

      const data = await response.json();
      setAttempts(data.data.loginAttempts);
      setCurrentPage(data.data.pagination.page);
      setTotalPages(data.data.pagination.totalPages);
      setTotal(data.data.pagination.total);
      setStats(data.data.statistics.last24Hours);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load login attempts');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      email: '',
      ip: '',
      success: '',
      from: '',
      to: ''
    });
    setCurrentPage(1);
  };

  const handleDeleteOldAttempts = async (days: number) => {
    try {
      setError(null);
      setSuccess(null);
      
      const response = await fetch(`/api/admin/security/login-attempts?days=${days}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete old attempts');
      }

      const data = await response.json();
      setSuccess(data.message);
      fetchAttempts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete old attempts');
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <Check className="h-3 w-3 mr-1" />
        Thành công
      </Badge>
    ) : (
      <Badge variant="destructive">
        <X className="h-3 w-3 mr-1" />
        Thất bại
      </Badge>
    );
  };

  if (loading && attempts.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Lịch sử đăng nhập</h1>
          <p className="text-gray-600">Theo dõi tất cả các lần đăng nhập vào hệ thống</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleDeleteOldAttempts(7)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Xóa cũ hơn 7 ngày
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDeleteOldAttempts(30)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Xóa cũ hơn 30 ngày
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Thành công (24h)</p>
                <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Thất bại (24h)</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <X className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng cộng (24h)</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="Tìm theo email..."
                value={filters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ip">IP Address</Label>
              <Input
                id="ip"
                placeholder="Tìm theo IP..."
                value={filters.ip}
                onChange={(e) => handleFilterChange('ip', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="success">Trạng thái</Label>
              <select
                id="success"
                value={filters.success}
                onChange={(e) => handleFilterChange('success', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Tất cả</option>
                <option value="true">Thành công</option>
                <option value="false">Thất bại</option>
              </select>
            </div>
            <div>
              <Label htmlFor="from">Từ ngày</Label>
              <Input
                id="from"
                type="datetime-local"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="to">Đến ngày</Label>
              <Input
                id="to"
                type="datetime-local"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Attempts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đăng nhập</CardTitle>
          <CardDescription>
            Hiển thị {attempts.length} / {total} lần đăng nhập
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {formatDateTime(attempt.timestamp.toString())}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        {attempt.email || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-gray-500" />
                        {attempt.ipAddress}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(attempt.success)}
                    </TableCell>
                    <TableCell>
                      {attempt.failureReason && (
                        <Badge variant="outline" className="text-red-600">
                          {attempt.failureReason}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-gray-500">
                      {attempt.userAgent || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
                {attempts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">Không tìm thấy lần đăng nhập nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Trang {currentPage} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || loading}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}