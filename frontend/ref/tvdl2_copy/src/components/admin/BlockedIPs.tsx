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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BlockedIP } from '@/types/security';
import { 
  Ban, 
  Shield, 
  Check, 
  X, 
  Search,
  Filter,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Monitor,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface BlockedIPsProps {
  token: string;
}

export default function BlockedIPsComponent({ token }: BlockedIPsProps) {
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    ip: '',
    active: ''
  });
  
  // Statistics
  const [stats, setStats] = useState({
    active: 0,
    expired: 0,
    total: 0
  });

  // Add IP form
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({
    ipAddress: '',
    reason: '',
    durationMinutes: 60
  });

  useEffect(() => {
    fetchBlockedIPs();
  }, [currentPage, filters]);

  const fetchBlockedIPs = async () => {
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

      const response = await fetch(`/api/admin/security/blocked-ips?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blocked IPs');
      }

      const data = await response.json();
      setBlockedIPs(data.data.blockedIPs);
      setCurrentPage(data.data.pagination.page);
      setTotalPages(data.data.pagination.totalPages);
      setTotal(data.data.pagination.total);
      setStats(data.data.statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blocked IPs');
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
      ip: '',
      active: ''
    });
    setCurrentPage(1);
  };

  const handleAddIP = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/admin/security/blocked-ips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add IP');
      }

      const data = await response.json();
      setSuccess(data.message);
      setShowAddDialog(false);
      setAddForm({
        ipAddress: '',
        reason: '',
        durationMinutes: 60
      });
      fetchBlockedIPs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add IP');
    }
  };

  const handleUnblockIP = async (ipAddress: string) => {
    try {
      setError(null);
      setSuccess(null);
      
      const response = await fetch(`/api/admin/security/blocked-ips?ip=${encodeURIComponent(ipAddress)}&action=unblock`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unblock IP');
      }

      const data = await response.json();
      setSuccess(data.message);
      fetchBlockedIPs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unblock IP');
    }
  };

  const handleDeleteIP = async (ipAddress: string) => {
    try {
      setError(null);
      setSuccess(null);
      
      const response = await fetch(`/api/admin/security/blocked-ips?ip=${encodeURIComponent(ipAddress)}&action=delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete IP');
      }

      const data = await response.json();
      setSuccess(data.message);
      fetchBlockedIPs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete IP');
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

  const getStatusBadge = (blockedIP: BlockedIP) => {
    const now = new Date();
    const expiresAt = new Date(blockedIP.expiresAt);
    const isExpired = now > expiresAt;

    if (!blockedIP.isActive || isExpired) {
      return (
        <Badge variant="outline" className="text-gray-600">
          <Clock className="h-3 w-3 mr-1" />
          Hết hạn
        </Badge>
      );
    }

    return (
      <Badge variant="destructive">
        <Ban className="h-3 w-3 mr-1" />
        Đang chặn
      </Badge>
    );
  };

  const getRemainingTime = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Đã hết hạn';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    } else {
      return `${minutes} phút`;
    }
  };

  if (loading && blockedIPs.length === 0) {
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
          <h1 className="text-2xl font-bold">IP bị chặn</h1>
          <p className="text-gray-600">Quản lý danh sách IP address bị chặn</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm IP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm IP vào danh sách chặn</DialogTitle>
              <DialogDescription>
                Nhập thông tin IP cần chặn và thời gian chặn
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ipAddress">IP Address</Label>
                <Input
                  id="ipAddress"
                  placeholder="192.168.1.1"
                  value={addForm.ipAddress}
                  onChange={(e) => setAddForm(prev => ({ ...prev, ipAddress: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="reason">Lý do chặn</Label>
                <Input
                  id="reason"
                  placeholder="Nhập lý do chặn..."
                  value={addForm.reason}
                  onChange={(e) => setAddForm(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="duration">Thời gian chặn (phút)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={addForm.durationMinutes}
                  onChange={(e) => setAddForm(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAddIP}>
                  Thêm IP
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                <p className="text-sm text-gray-600">Đang chặn</p>
                <p className="text-2xl font-bold text-red-600">{stats.active}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <Ban className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hết hạn</p>
                <p className="text-2xl font-bold text-gray-600">{stats.expired}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-full">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng cộng</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="active">Trạng thái</Label>
              <select
                id="active"
                value={filters.active}
                onChange={(e) => handleFilterChange('active', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Tất cả</option>
                <option value="true">Đang chặn</option>
                <option value="false">Hết hạn</option>
              </select>
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

      {/* Blocked IPs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách IP bị chặn</CardTitle>
          <CardDescription>
            Hiển thị {blockedIPs.length} / {total} IP bị chặn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>Thời gian chặn</TableHead>
                  <TableHead>Hết hạn</TableHead>
                  <TableHead>Còn lại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockedIPs.map((blockedIP) => (
                  <TableRow key={blockedIP.id}>
                    <TableCell className="font-mono">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-gray-500" />
                        {blockedIP.ipAddress}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-red-600">
                        {blockedIP.reason}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {formatDateTime(blockedIP.blockedAt.toString())}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {formatDateTime(blockedIP.expiresAt.toString())}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${
                        new Date(blockedIP.expiresAt) > new Date() 
                          ? 'text-red-600' 
                          : 'text-gray-500'
                      }`}>
                        {getRemainingTime(blockedIP.expiresAt.toString())}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(blockedIP)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {blockedIP.isActive && new Date(blockedIP.expiresAt) > new Date() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnblockIP(blockedIP.ipAddress)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteIP(blockedIP.ipAddress)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {blockedIPs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">Không có IP nào bị chặn</p>
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