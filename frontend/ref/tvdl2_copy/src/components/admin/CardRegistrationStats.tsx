'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Users, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  Hash
} from 'lucide-react';

interface CardStats {
  overview: {
    totalRegistrations: number;
    totalIssued: number;
    totalPending: number;
    issuedRate: string;
  };
  yearly: {
    year: number;
    totalIssued: number;
    lastCardNumber: string | null;
    nextCardNumber: string;
  };
  monthly: Array<{
    month: number;
    monthName: string;
    count: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
    label: string;
  }>;
  byAge: Array<{
    isUnder15: boolean;
    count: number;
    label: string;
  }>;
}

export default function CardRegistrationStats() {
  const [stats, setStats] = useState<CardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/services/card-registration/stats?year=${selectedYear}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        console.error('Error fetching stats:', data.message);
      }
    } catch (error) {
      console.error('Error fetching card registration stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đăng ký</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.totalRegistrations}</p>
                <p className="text-xs text-gray-500">Tất cả thời gian</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã cấp thẻ</p>
                <p className="text-2xl font-bold text-green-600">{stats.overview.totalIssued}</p>
                <p className="text-xs text-gray-500">Tỷ lệ: {stats.overview.issuedRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.overview.totalPending}</p>
                <p className="text-xs text-gray-500">Cần duyệt</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Năm {selectedYear}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.yearly.totalIssued}</p>
                <p className="text-xs text-gray-500">Thẻ đã cấp</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
              Phân bố theo trạng thái
            </CardTitle>
            <CardDescription>
              Số lượng đăng ký theo từng trạng thái
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.byStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      item.status === 'ISSUED' ? 'bg-green-500' :
                      item.status === 'PENDING' ? 'bg-yellow-500' :
                      item.status === 'APPROVED' ? 'bg-blue-500' :
                      item.status === 'REJECTED' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-900 mr-2">{item.count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.status === 'ISSUED' ? 'bg-green-500' :
                          item.status === 'PENDING' ? 'bg-yellow-500' :
                          item.status === 'APPROVED' ? 'bg-blue-500' :
                          item.status === 'REJECTED' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${(item.count / stats.overview.totalRegistrations) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                Thống kê theo tháng năm {selectedYear}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedYear(selectedYear - 1)}
                >
                  {selectedYear - 1}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedYear(new Date().getFullYear())}
                  disabled={selectedYear === new Date().getFullYear()}
                >
                  {new Date().getFullYear()}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  disabled={selectedYear >= new Date().getFullYear()}
                >
                  {selectedYear + 1}
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Số lượng thẻ được cấp theo từng tháng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              {stats.monthly.map((month) => (
                <div key={month.month} className="text-center">
                  <div className="mb-2">
                    <div 
                      className="bg-blue-500 rounded-t mx-auto"
                      style={{ 
                        height: `${Math.max(month.count * 4, 4)}px`,
                        width: '20px'
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">T{month.month}</div>
                  <div className="text-xs font-bold text-gray-900">{month.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>
            Các tác vụ thường dùng cho quản lý thẻ thư viện
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href="/admin/card-registrations">
                <CreditCard className="h-4 w-4 mr-2" />
                Quản lý đăng ký
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/admin/card-registrations?status=PENDING">
                <Clock className="h-4 w-4 mr-2" />
                Chờ xử lý ({stats.overview.totalPending})
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/admin/card-registrations?status=ISSUED">
                <CheckCircle className="h-4 w-4 mr-2" />
                Đã cấp thẻ ({stats.overview.totalIssued})
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}