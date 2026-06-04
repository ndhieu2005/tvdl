'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SecuritySettingsComponent from './SecuritySettings';
import LoginAttemptsComponent from './LoginAttempts';
import BlockedIPsComponent from './BlockedIPs';
import { 
  Shield, 
  Settings, 
  Activity, 
  Ban, 
  Key, 
  Lock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

interface SecurityDashboardProps {
  token: string;
}

export default function SecurityDashboard({ token }: SecurityDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bảo mật hệ thống</h1>
          <p className="text-gray-600">Quản lý và theo dõi tình trạng bảo mật của hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            Hệ thống bảo mật
          </Badge>
        </div>
      </div>

      {/* Security Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Cài đặt
          </TabsTrigger>
          <TabsTrigger value="attempts" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Đăng nhập
          </TabsTrigger>
          <TabsTrigger value="blocked" className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            IP chặn
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Security Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Trạng thái bảo mật
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Chặn IP đáng ngờ</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Bật
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bộ lọc spam</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Bật
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mật khẩu mạnh</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Bật
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Xác thực 2 bước</span>
                    <Badge variant="outline" className="text-gray-600">
                      <XCircle className="h-3 w-3 mr-1" />
                      Tắt
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Login Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Đăng nhập (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Thành công</span>
                    <span className="text-2xl font-bold text-green-600">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Thất bại</span>
                    <span className="text-2xl font-bold text-red-600">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tỷ lệ thành công</span>
                    <span className="text-lg font-semibold text-blue-600">88.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blocked IPs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-red-600" />
                  IP bị chặn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Đang chặn</span>
                    <span className="text-2xl font-bold text-red-600">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Hết hạn</span>
                    <span className="text-2xl font-bold text-gray-600">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Hôm nay</span>
                    <span className="text-lg font-semibold text-orange-600">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Policies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Chính sách bảo mật hiện tại
              </CardTitle>
              <CardDescription>
                Tổng quan về các chính sách bảo mật đang áp dụng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">Xác thực</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Tối đa 5 lần đăng nhập sai</li>
                    <li>• Session timeout: 24 giờ</li>
                    <li>• Độ dài mật khẩu tối thiểu: 8 ký tự</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Bảo vệ</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Chặn IP sau 5 lần sai</li>
                    <li>• Thời gian chặn: 1 giờ</li>
                    <li>• Giới hạn: 60 requests/phút</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Mật khẩu</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Yêu cầu chữ hoa, thường</li>
                    <li>• Yêu cầu số và ký tự đặc biệt</li>
                    <li>• Hết hạn sau 90 ngày</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Sự kiện bảo mật gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">IP 192.168.1.100 bị chặn</p>
                      <p className="text-xs text-gray-600">Vượt quá giới hạn đăng nhập sai</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">2 phút trước</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Đăng nhập thất bại</p>
                      <p className="text-xs text-gray-600">user@example.com từ 192.168.1.50</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">5 phút trước</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Cài đặt bảo mật được cập nhật</p>
                      <p className="text-xs text-gray-600">Tăng thời gian chặn IP lên 2 giờ</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">1 giờ trước</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <SecuritySettingsComponent token={token} />
        </TabsContent>

        {/* Login Attempts Tab */}
        <TabsContent value="attempts">
          <LoginAttemptsComponent token={token} />
        </TabsContent>

        {/* Blocked IPs Tab */}
        <TabsContent value="blocked">
          <BlockedIPsComponent token={token} />
        </TabsContent>
      </Tabs>
    </div>
  );
}