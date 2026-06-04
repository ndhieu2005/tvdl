'use client';

import React, { useState, useRef, useEffect } from 'react';
import { RecaptchaV3, useRecaptchaV3 } from '@/components/RecaptchaV3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, User, Phone, Mail, MapPin, Calendar, FileText, Shield, CheckCircle } from 'lucide-react';
import DevRecaptchaStatus from '@/components/DevRecaptchaStatus';

const benefits = [
  { icon: CreditCard, text: 'Truy cập kho sách và tài liệu đầy đủ' },
  { icon: User, text: 'Sử dụng phòng đọc và wifi miễn phí' },
  { icon: FileText, text: 'Tham gia các sự kiện và workshop' },
  { icon: Calendar, text: 'Nhận thông báo về hoạt động mới' },
];

export default function CardRegistrationPage() {
  const { executeRecaptcha } = useRecaptchaV3();
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    idNumber: '',
    phone: '',
    parentPhone: '',
    email: '',
    address: '',
    occupation: '',
    workplace: '',
    purpose: '',
    agreeTerms: false,
    agreeNewsletter: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [submitError, setSubmitError] = useState<string>('');

  // Tính tuổi dựa trên ngày sinh
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Kiểm tra xem có cần số điện thoại phụ huynh không
  const isUnder15 = calculateAge(formData.dateOfBirth) < 15 && formData.dateOfBirth !== '';

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation cho trẻ dưới 15 tuổi
    if (isUnder15 && !formData.parentPhone.trim()) {
      alert('Vui lòng cung cấp số điện thoại của bố hoặc mẹ cho trẻ dưới 15 tuổi');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Thực hiện reCAPTCHA v3 trước khi submit
      let recaptchaToken = null;
      if (process.env.NODE_ENV === 'production') {
        recaptchaToken = await executeRecaptcha('card_registration');
        if (!recaptchaToken) {
          alert('Không thể xác minh reCAPTCHA. Vui lòng thử lại.');
          setIsSubmitting(false);
          return;
        }
      } else {
        recaptchaToken = 'dev-bypass';
      }

      const response = await fetch('/api/services/card-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        // Hiển thị lỗi validation
        if (result.errors) {
          const errorMessages = result.errors.map((err: any) => err.message).join('\n');
          alert(`Lỗi validation:\n${errorMessages}`);
        } else {
          alert(result.message || 'Có lỗi xảy ra khi đăng ký');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Có lỗi xảy ra khi gửi form. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardContent className="pt-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Đăng ký thành công!</h2>
              <p className="text-gray-600 mb-6">
                Cảm ơn bạn đã đăng ký làm thẻ thư viện. Chúng tôi sẽ xử lý đơn đăng ký của bạn trong vòng 2-3 ngày làm việc.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Các bước tiếp theo:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>1. Chúng tôi sẽ xác minh thông tin của bạn</li>
                  <li>2. Gửi email thông báo kết quả</li>
                  <li>3. Bạn đến thư viện để nhận thẻ (mang theo CCCD)</li>
                </ul>
              </div>
              <Button asChild>
                <a href="/">Về trang chủ</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Đăng ký làm thẻ thư viện</h1>
          <p className="text-lg text-gray-600">
            Tạo thẻ thành viên để truy cập đầy đủ các dịch vụ của thư viện
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-6 w-6 text-blue-600" />
                  Thông tin đăng ký
                </CardTitle>
                <CardDescription>
                  Vui lòng điền đầy đủ thông tin để hoàn tất đăng ký
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Thông tin cá nhân</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Họ và tên *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          placeholder="Nguyễn Văn A"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="dateOfBirth">Ngày sinh *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gender">Giới tính *</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Nam</SelectItem>
                            <SelectItem value="female">Nữ</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="idNumber">Số CCCD/CMND *</Label>
                        <Input
                          id="idNumber"
                          value={formData.idNumber}
                          onChange={(e) => handleInputChange('idNumber', e.target.value)}
                          placeholder="001234567890"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Thông tin liên hệ</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">
                          {isUnder15 ? 'Số điện thoại cá nhân' : 'Số điện thoại *'}
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="0901234567"
                          pattern="[0-9\s\-\+]*"
                          title="Nhập số điện thoại Việt Nam (10-11 số)"
                          required={!isUnder15}
                        />
                        {isUnder15 ? (
                          <p className="text-xs text-gray-500 mt-1">
                            Có thể để trống nếu chưa có số điện thoại riêng
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">
                            Ví dụ: 0901234567 hoặc +84901234567
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="example@email.com"
                          required
                        />
                      </div>
                    </div>

                    {/* Số điện thoại phụ huynh cho trẻ dưới 15 tuổi */}
                    {isUnder15 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2 mb-3">
                          <Phone className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-yellow-800">Thông tin phụ huynh</h4>
                            <p className="text-sm text-yellow-700">
                              Do bạn dưới 15 tuổi, vui lòng cung cấp số điện thoại của bố hoặc mẹ
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="parentPhone">Số điện thoại bố/mẹ *</Label>
                          <Input
                            id="parentPhone"
                            value={formData.parentPhone}
                            onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                            placeholder="0901234567"
                            pattern="[0-9\s\-\+]*"
                            title="Nhập số điện thoại Việt Nam (10-11 số)"
                            required={isUnder15}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Ví dụ: 0901234567 hoặc +84901234567
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="address">Địa chỉ *</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        required
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Thông tin nghề nghiệp</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="occupation">Nghề nghiệp</Label>
                        <Input
                          id="occupation"
                          value={formData.occupation}
                          onChange={(e) => handleInputChange('occupation', e.target.value)}
                          placeholder="Sinh viên, Giáo viên, Kỹ sư..."
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="workplace">Nơi làm việc/học tập</Label>
                        <Input
                          id="workplace"
                          value={formData.workplace}
                          onChange={(e) => handleInputChange('workplace', e.target.value)}
                          placeholder="Trường, công ty..."
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="purpose">Mục đích sử dụng thư viện</Label>
                      <Textarea
                        id="purpose"
                        value={formData.purpose}
                        onChange={(e) => handleInputChange('purpose', e.target.value)}
                        placeholder="Học tập, nghiên cứu, giải trí..."
                      />
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeTerms', checked)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="agreeTerms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Tôi đồng ý với các điều khoản và quy định của thư viện *
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Bạn cần đồng ý với các điều khoản để tiếp tục đăng ký.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeNewsletter"
                        checked={formData.agreeNewsletter}
                        onCheckedChange={(checked) => handleInputChange('agreeNewsletter', checked)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="agreeNewsletter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Nhận thông báo về sự kiện và tin tức mới
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* reCAPTCHA v3 - Invisible, loaded automatically */}
                  <RecaptchaV3 
                    onToken={() => {}} 
                    action="card_registration"
                  />
                  
                  {/* Development notice */}
                  <DevRecaptchaStatus />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={
                      !formData.agreeTerms || 
                      isSubmitting ||
                      (isUnder15 && !formData.parentPhone.trim())
                    }
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Đăng ký làm thẻ'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quyền lợi thành viên</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {benefits.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <IconComponent className="h-5 w-5 text-blue-600 mt-0.5" />
                      <span className="text-sm text-gray-700">{benefit.text}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lưu ý quan trọng</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Thẻ có hiệu lực 2 năm từ ngày cấp</li>
                  <li>• Phí làm thẻ: 50,000 VNĐ (sinh viên: 30,000 VNĐ)</li>
                  <li>• Mang theo CCCD gốc khi nhận thẻ</li>
                  <li>• Thẻ không được chuyển nhượng</li>
                  <li>• Vi phạm quy định có thể bị khóa thẻ</li>
                  <li>• <strong>Trẻ dưới 15 tuổi:</strong> Cần cung cấp số điện thoại của bố hoặc mẹ</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hỗ trợ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    0906-1515-66
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    thuvienduonglieu@gmail.com
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Thôn Thống Nhất, xã Dương Liễu, Hoài Đức, Hà Nội
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}