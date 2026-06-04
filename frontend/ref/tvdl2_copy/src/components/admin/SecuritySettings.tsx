'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SecuritySettings, UpdateSecuritySettingsRequest } from '@/types/security';
import { 
  Shield, 
  Lock, 
  Eye, 
  Clock, 
  AlertTriangle, 
  Check, 
  X,
  Save,
  RotateCcw,
  Activity,
  Ban,
  Key
} from 'lucide-react';

interface SecuritySettingsProps {
  token: string;
}

export default function SecuritySettingsComponent({ token }: SecuritySettingsProps) {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<UpdateSecuritySettingsRequest>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/security', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data.data);
      setFormData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      setWarnings([]);

      const response = await fetch('/api/admin/security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      const data = await response.json();
      setSettings(data.data);
      setSuccess('Cài đặt đã được lưu thành công!');
      if (data.warnings && data.warnings.length > 0) {
        setWarnings(data.warnings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      setWarnings([]);

      const response = await fetch('/api/admin/security', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset settings');
      }

      const data = await response.json();
      setSettings(data.data);
      setFormData(data.data);
      setSuccess('Đã reset về cài đặt mặc định!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Không thể tải cài đặt bảo mật. Vui lòng thử lại.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Cài đặt bảo mật</h1>
          <p className="text-gray-600">Quản lý các tính năng bảo mật cho hệ thống</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset mặc định
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
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

      {warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="space-y-1">
              <p className="font-semibold">Cảnh báo:</p>
              {warnings.map((warning, index) => (
                <p key={index} className="text-sm">• {warning}</p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="authentication" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="authentication">Xác thực</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="protection">Bảo vệ</TabsTrigger>
          <TabsTrigger value="password">Mật khẩu</TabsTrigger>
        </TabsList>

        {/* Authentication Settings */}
        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Cài đặt xác thực
              </CardTitle>
              <CardDescription>
                Quản lý các cài đặt liên quan đến đăng nhập và session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="maxFailedLogins">Số lần đăng nhập sai tối đa</Label>
                  <Input
                    id="maxFailedLogins"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxFailedLogins || ''}
                    onChange={(e) => handleInputChange('maxFailedLogins', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Sau {formData.maxFailedLogins} lần sai, IP sẽ bị chặn tạm thời
                  </p>
                </div>

                <div>
                  <Label htmlFor="sessionTimeout">Thời gian session (phút)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="43200"
                    value={formData.sessionTimeout || ''}
                    onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Session sẽ hết hạn sau {Math.round((formData.sessionTimeout || 0) / 60)} giờ
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorEnabled">Xác thực 2 bước</Label>
                    <p className="text-sm text-gray-500">
                      Yêu cầu xác thực bổ sung khi đăng nhập
                    </p>
                  </div>
                  <Switch
                    id="twoFactorEnabled"
                    checked={formData.twoFactorEnabled || false}
                    onCheckedChange={(checked) => handleInputChange('twoFactorEnabled', checked)}
                  />
                </div>
                {formData.twoFactorEnabled && (
                  <Badge variant="secondary" className="mt-2">
                    Tính năng này đang được phát triển
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Cài đặt bảo mật IP
              </CardTitle>
              <CardDescription>
                Quản lý chặn IP và whitelist/blacklist
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ipBlockingEnabled">Chặn IP đáng ngờ</Label>
                  <p className="text-sm text-gray-500">
                    Tự động chặn IP có hoạt động bất thường
                  </p>
                </div>
                <Switch
                  id="ipBlockingEnabled"
                  checked={formData.ipBlockingEnabled || false}
                  onCheckedChange={(checked) => handleInputChange('ipBlockingEnabled', checked)}
                />
              </div>

              {formData.ipBlockingEnabled && (
                <div>
                  <Label htmlFor="ipBlockDuration">Thời gian chặn IP (phút)</Label>
                  <Input
                    id="ipBlockDuration"
                    type="number"
                    min="1"
                    max="43200"
                    value={formData.ipBlockDuration || ''}
                    onChange={(e) => handleInputChange('ipBlockDuration', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    IP sẽ bị chặn trong {Math.round((formData.ipBlockDuration || 0) / 60)} giờ
                  </p>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="captchaEnabled">CAPTCHA</Label>
                  <p className="text-sm text-gray-500">
                    Yêu cầu xác minh CAPTCHA cho các thao tác nhạy cảm
                  </p>
                </div>
                <Switch
                  id="captchaEnabled"
                  checked={formData.captchaEnabled || false}
                  onCheckedChange={(checked) => handleInputChange('captchaEnabled', checked)}
                />
              </div>

              {formData.captchaEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="captchaProvider">Nhà cung cấp CAPTCHA</Label>
                    <select
                      id="captchaProvider"
                      value={formData.captchaProvider || 'recaptcha'}
                      onChange={(e) => handleInputChange('captchaProvider', e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="recaptcha">Google reCAPTCHA</option>
                      <option value="hcaptcha">hCaptcha</option>
                      <option value="turnstile">Cloudflare Turnstile</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="captchaThreshold">Ngưỡng điểm (0-1)</Label>
                    <Input
                      id="captchaThreshold"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={formData.captchaThreshold || ''}
                      onChange={(e) => handleInputChange('captchaThreshold', parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Protection Settings */}
        <TabsContent value="protection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Bảo vệ khỏi spam
              </CardTitle>
              <CardDescription>
                Giới hạn tần suất requests và bảo vệ khỏi spam
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="spamFilterEnabled">Bộ lọc spam</Label>
                  <p className="text-sm text-gray-500">
                    Kích hoạt bộ lọc spam và giới hạn tần suất
                  </p>
                </div>
                <Switch
                  id="spamFilterEnabled"
                  checked={formData.spamFilterEnabled || false}
                  onCheckedChange={(checked) => handleInputChange('spamFilterEnabled', checked)}
                />
              </div>

              {formData.spamFilterEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="maxRequestsPerMinute">Giới hạn requests/phút</Label>
                    <Input
                      id="maxRequestsPerMinute"
                      type="number"
                      min="1"
                      max="10000"
                      value={formData.maxRequestsPerMinute || ''}
                      onChange={(e) => handleInputChange('maxRequestsPerMinute', parseInt(e.target.value))}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Tối đa {formData.maxRequestsPerMinute} requests mỗi phút
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="maxRequestsPerHour">Giới hạn requests/giờ</Label>
                    <Input
                      id="maxRequestsPerHour"
                      type="number"
                      min="1"
                      max="100000"
                      value={formData.maxRequestsPerHour || ''}
                      onChange={(e) => handleInputChange('maxRequestsPerHour', parseInt(e.target.value))}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Tối đa {formData.maxRequestsPerHour} requests mỗi giờ
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Settings */}
        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Chính sách mật khẩu
              </CardTitle>
              <CardDescription>
                Thiết lập yêu cầu cho mật khẩu mạnh
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="minPasswordLength">Độ dài tối thiểu</Label>
                  <Input
                    id="minPasswordLength"
                    type="number"
                    min="4"
                    max="128"
                    value={formData.minPasswordLength || ''}
                    onChange={(e) => handleInputChange('minPasswordLength', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Mật khẩu phải có ít nhất {formData.minPasswordLength} ký tự
                  </p>
                </div>

                <div>
                  <Label htmlFor="passwordExpiryDays">Hết hạn sau (ngày)</Label>
                  <Input
                    id="passwordExpiryDays"
                    type="number"
                    min="1"
                    max="3650"
                    value={formData.passwordExpiryDays || ''}
                    onChange={(e) => handleInputChange('passwordExpiryDays', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Mật khẩu sẽ hết hạn sau {formData.passwordExpiryDays} ngày
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="strongPasswordRequired">Yêu cầu mật khẩu mạnh</Label>
                    <p className="text-sm text-gray-500">
                      Áp dụng tất cả các yêu cầu dưới đây
                    </p>
                  </div>
                  <Switch
                    id="strongPasswordRequired"
                    checked={formData.strongPasswordRequired || false}
                    onCheckedChange={(checked) => handleInputChange('strongPasswordRequired', checked)}
                  />
                </div>

                {formData.strongPasswordRequired && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireUppercase">Yêu cầu chữ hoa</Label>
                      <Switch
                        id="requireUppercase"
                        checked={formData.requireUppercase || false}
                        onCheckedChange={(checked) => handleInputChange('requireUppercase', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireLowercase">Yêu cầu chữ thường</Label>
                      <Switch
                        id="requireLowercase"
                        checked={formData.requireLowercase || false}
                        onCheckedChange={(checked) => handleInputChange('requireLowercase', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireNumbers">Yêu cầu số</Label>
                      <Switch
                        id="requireNumbers"
                        checked={formData.requireNumbers || false}
                        onCheckedChange={(checked) => handleInputChange('requireNumbers', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireSpecialChars">Yêu cầu ký tự đặc biệt</Label>
                      <Switch
                        id="requireSpecialChars"
                        checked={formData.requireSpecialChars || false}
                        onCheckedChange={(checked) => handleInputChange('requireSpecialChars', checked)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}