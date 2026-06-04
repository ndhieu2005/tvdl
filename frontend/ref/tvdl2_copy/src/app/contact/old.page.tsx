import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, Phone, MapPin, Clock, BookOpen, Users, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ và lắng nghe ý kiến đóng góp từ độc giả. 
            Hãy liên hệ với chúng tôi qua các hình thức dưới đây.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-6 w-6 text-blue-600" />
                  Gửi tin nhắn cho chúng tôi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Họ và tên *</Label>
                      <Input
                        id="name"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        placeholder="0901234567"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Loại yêu cầu *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại yêu cầu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Câu hỏi chung</SelectItem>
                          <SelectItem value="service">Dịch vụ thư viện</SelectItem>
                          <SelectItem value="complaint">Khiếu nại</SelectItem>
                          <SelectItem value="suggestion">Đề xuất</SelectItem>
                          <SelectItem value="partnership">Hợp tác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Tiêu đề *</Label>
                    <Input
                      id="subject"
                      placeholder="Tóm tắt nội dung yêu cầu"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Nội dung *</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      placeholder="Mô tả chi tiết yêu cầu của bạn..."
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Gửi tin nhắn
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin liên hệ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-600">thuvienduonglieu@gmail.com</p>
                    <p className="text-xs text-gray-500">Phản hồi trong 24h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Điện thoại</p>
                    <p className="text-sm text-gray-600">0906-1515-66</p>
                    <p className="text-xs text-gray-500">8:00 - 17:00 hàng ngày</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Địa chỉ</p>
                    <p className="text-sm text-gray-600">
                      Thôn Thống Nhất, xã Dương Liễu<br />
                      Hoài Đức, Hà Nội
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Thông tin chung</p>
                    <a 
                      href="https://linktr.ee/duonglieu" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      linktr.ee/duonglieu
                    </a>
                    <p className="text-xs text-gray-500">Trang tổng hợp thông tin</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-green-600" />
                  Giờ mở cửa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Thứ 2 - Thứ 6:</span>
                    <span className="font-medium">8:00 - 21:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thứ 7:</span>
                    <span className="font-medium">8:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chủ nhật:</span>
                    <span className="font-medium">9:00 - 16:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Help */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="mr-2 h-5 w-5 text-purple-600" />
                  Hỗ trợ nhanh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <a href="/services" className="text-sm text-blue-600 hover:underline">
                      Hướng dẫn sử dụng dịch vụ
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <a href="/about" className="text-sm text-green-600 hover:underline">
                      Thông tin về thư viện
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-600">Chat online: 8:00-17:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Library */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Ủng hộ thư viện
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 mb-3">
                  Góp phần xây dựng và phát triển thư viện:
                </p>
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <p className="font-medium text-green-800 mb-1">MB BANK</p>
                  <p className="text-sm text-green-700 font-mono">1566</p>
                  <p className="text-sm text-green-700">PHUNG BA HUNG</p>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Mọi đóng góp đều được ghi nhận và sử dụng để cải thiện dịch vụ thư viện
                </p>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Thông tin liên hệ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-blue-700">
                    <strong>📍 Địa chỉ:</strong><br />
                    Thôn Thống Nhất, xã Dương Liễu<br />
                    Hoài Đức, Hà Nội
                  </p>
                  <p className="text-blue-700">
                    <strong>📞 Điện thoại:</strong> 0906-1515-66
                  </p>
                  <p className="text-blue-700">
                    <strong>📧 Email:</strong> thuvienduonglieu@gmail.com
                  </p>
                  <p className="text-blue-700">
                    <strong>🔗 Website:</strong>{' '}
                    <a 
                      href="https://linktr.ee/duonglieu" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      linktr.ee/duonglieu
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}