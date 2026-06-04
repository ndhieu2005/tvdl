'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  Ban,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface SecurityStatusCardProps {
  token: string;
  className?: string;
}

interface SecurityStatus {
  overall: 'good' | 'warning' | 'danger';
  score: number;
  features: {
    ipBlocking: boolean;
    spamFilter: boolean;
    strongPassword: boolean;
    twoFactor: boolean;
    captcha: boolean;
  };
  statistics: {
    activeThreats: number;
    blockedIPs: number;
    failedLogins24h: number;
    successfulLogins24h: number;
  };
  recommendations: string[];
}

export default function SecurityStatusCard({ token, className = "" }: SecurityStatusCardProps) {
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  const fetchSecurityStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch security settings
      const settingsResponse = await fetch('/api/admin/security', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!settingsResponse.ok) {
        throw new Error('Failed to fetch security settings');
      }

      const settingsData = await settingsResponse.json();
      const settings = settingsData.data;

      // Calculate security score
      let score = 0;
      const features = {
        ipBlocking: settings.ipBlockingEnabled,
        spamFilter: settings.spamFilterEnabled,
        strongPassword: settings.strongPasswordRequired,
        twoFactor: settings.twoFactorEnabled,
        captcha: settings.captchaEnabled
      };

      // Calculate score based on enabled features
      Object.values(features).forEach(enabled => {
        if (enabled) score += 20;
      });

      // Determine overall status
      let overall: 'good' | 'warning' | 'danger' = 'good';
      if (score < 40) overall = 'danger';
      else if (score < 80) overall = 'warning';

      // Generate recommendations
      const recommendations: string[] = [];
      if (!features.ipBlocking) recommendations.push('Bật tính năng chặn IP đáng ngờ');
      if (!features.spamFilter) recommendations.push('Bật bộ lọc spam');
      if (!features.strongPassword) recommendations.push('Yêu cầu mật khẩu mạnh');
      if (!features.twoFactor) recommendations.push('Bật xác thực 2 bước');
      if (!features.captcha) recommendations.push('Bật CAPTCHA cho bảo mật tăng cường');

      setStatus({
        overall,
        score,
        features,
        statistics: {
          activeThreats: Math.floor(Math.random() * 3), // Mock data
          blockedIPs: Math.floor(Math.random() * 10),
          failedLogins24h: Math.floor(Math.random() * 50),
          successfulLogins24h: Math.floor(Math.random() * 200) + 50
        },
        recommendations
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'danger':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'danger':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'good':
        return 'Tốt';
      case 'warning':
        return 'Cảnh báo';
      case 'danger':
        return 'Nguy hiểm';
      default:
        return 'Không xác định';
    }
  };

  const getFeatureIcon = (enabled: boolean) => {
    return enabled ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getTrendIcon = (value: number) => {
    if (value > 10) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (value > 5) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tình trạng bảo mật
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.overall)}
            <span className={`font-semibold ${getStatusColor(status.overall)}`}>
              {getStatusLabel(status.overall)}
            </span>
          </div>
        </CardTitle>
        <CardDescription>
          Điểm bảo mật: {status.score}/100
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Features */}
        <div>
          <h4 className="font-semibold mb-3">Tính năng bảo mật</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Chặn IP</span>
              {getFeatureIcon(status.features.ipBlocking)}
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Bộ lọc spam</span>
              {getFeatureIcon(status.features.spamFilter)}
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Mật khẩu mạnh</span>
              {getFeatureIcon(status.features.strongPassword)}
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Xác thực 2 bước</span>
              {getFeatureIcon(status.features.twoFactor)}
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">CAPTCHA</span>
              {getFeatureIcon(status.features.captcha)}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h4 className="font-semibold mb-3">Thống kê 24h</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">
                  {status.statistics.successfulLogins24h}
                </span>
              </div>
              <p className="text-sm text-gray-600">Đăng nhập thành công</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-2xl font-bold text-red-600">
                  {status.statistics.failedLogins24h}
                </span>
              </div>
              <p className="text-sm text-gray-600">Đăng nhập thất bại</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Ban className="h-4 w-4 text-orange-600" />
                <span className="text-2xl font-bold text-orange-600">
                  {status.statistics.blockedIPs}
                </span>
              </div>
              <p className="text-sm text-gray-600">IP bị chặn</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-600">
                  {status.statistics.activeThreats}
                </span>
              </div>
              <p className="text-sm text-gray-600">Mối đe dọa hiện tại</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {status.recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Khuyến nghị</h4>
            <div className="space-y-2">
              {status.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t">
          <Button 
            onClick={fetchSecurityStatus}
            variant="outline" 
            className="w-full"
          >
            <Activity className="h-4 w-4 mr-2" />
            Cập nhật trạng thái
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}