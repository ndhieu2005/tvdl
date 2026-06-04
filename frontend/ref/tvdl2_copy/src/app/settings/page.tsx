'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Eye, 
  Lock,
  Trash2,
  Save,
  AlertTriangle
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    marketingEmails: false,
    
    // Privacy settings
    profileVisibility: 'public',
    showEmail: false,
    showActivity: true,
    
    // Security settings
    twoFactorAuth: false,
    loginAlerts: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Vui lòng đăng nhập để truy cập cài đặt
          </h1>
          <Button onClick={() => window.location.href = '/'}>
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Call API to save settings
      console.log('Saving settings:', settings);
      // await saveUserSettings(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }

    setLoading(true);
    try {
      // Call API to change password
      console.log('Changing password...');
      // await changePassword(passwordData);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
      try {
        // Call API to delete account
        console.log('Deleting account...');
        // await deleteAccount();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="h-8 w-8 mr-3" />
            Cài đặt
          </h1>
          <p className="text-gray-600 mt-2">Quản lý tài khoản và tùy chọn cá nhân</p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            <TabsTrigger value="privacy">Quyền riêng tư</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
            <TabsTrigger value="account">Tài khoản</TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Cài đặt thông báo
                </CardTitle>
                <CardDescription>
                  Quản lý cách bạn nhận thông báo từ hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Thông báo email</Label>
                    <p className="text-sm text-gray-500">
                      Nhận thông báo qua email về hoạt động quan trọng
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Thông báo đẩy</Label>
                    <p className="text-sm text-gray-500">
                      Nhận thông báo đẩy trên trình duyệt
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bản tin hàng tuần</Label>
                    <p className="text-sm text-gray-500">
                      Nhận tóm tắt hoạt động hàng tuần qua email
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyDigest}
                    onCheckedChange={(checked) => handleSettingChange('weeklyDigest', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email marketing</Label>
                    <p className="text-sm text-gray-500">
                      Nhận thông tin về tính năng mới và ưu đãi
                    </p>
                  </div>
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Cài đặt quyền riêng tư
                </CardTitle>
                <CardDescription>
                  Kiểm soát thông tin nào được hiển thị công khai
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Hiển thị hồ sơ</Label>
                  <select
                    value={settings.profileVisibility}
                    onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="public">Công khai</option>
                    <option value="friends">Chỉ bạn bè</option>
                    <option value="private">Riêng tư</option>
                  </select>
                  <p className="text-sm text-gray-500">
                    Ai có thể xem hồ sơ của bạn
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Hiển thị email</Label>
                    <p className="text-sm text-gray-500">
                      Cho phép người khác xem địa chỉ email của bạn
                    </p>
                  </div>
                  <Switch
                    checked={settings.showEmail}
                    onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Hiển thị hoạt động</Label>
                    <p className="text-sm text-gray-500">
                      Cho phép người khác xem hoạt động gần đây của bạn
                    </p>
                  </div>
                  <Switch
                    checked={settings.showActivity}
                    onCheckedChange={(checked) => handleSettingChange('showActivity', checked)}
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Cài đặt bảo mật
                  </CardTitle>
                  <CardDescription>
                    Tăng cường bảo mật cho tài khoản của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Xác thực hai yếu tố</Label>
                      <p className="text-sm text-gray-500">
                        Thêm lớp bảo mật bổ sung cho tài khoản
                      </p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cảnh báo đăng nhập</Label>
                      <p className="text-sm text-gray-500">
                        Nhận thông báo khi có đăng nhập từ thiết bị mới
                      </p>
                    </div>
                    <Switch
                      checked={settings.loginAlerts}
                      onCheckedChange={(checked) => handleSettingChange('loginAlerts', checked)}
                    />
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSaveSettings} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Đổi mật khẩu
                  </CardTitle>
                  <CardDescription>
                    Cập nhật mật khẩu để bảo vệ tài khoản
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>

                  <Button onClick={handleChangePassword} disabled={loading}>
                    <Lock className="h-4 w-4 mr-2" />
                    {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Vùng nguy hiểm
                </CardTitle>
                <CardDescription>
                  Các hành động không thể hoàn tác
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="text-lg font-medium text-red-800 mb-2">
                    Xóa tài khoản
                  </h3>
                  <p className="text-sm text-red-600 mb-4">
                    Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của bạn. 
                    Hành động này không thể hoàn tác.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa tài khoản
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;