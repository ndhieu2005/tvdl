import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Calendar, BookOpen, Users, Clock, ArrowRight } from 'lucide-react';

const services = [
  {
    id: 'card-registration',
    title: 'Đăng ký làm thẻ thư viện',
    description: 'Đăng ký thẻ thành viên để sử dụng đầy đủ các dịch vụ của thư viện.',
    icon: CreditCard,
    color: 'bg-blue-500',
    features: [
      'Truy cập kho sách và tài liệu',
      'Sử dụng phòng đọc và wifi miễn phí',
      'Tham gia các sự kiện và workshop',
      'Ưu tiên đăng ký các hoạt động'
    ],
    href: '/services/card-registration',
    formAvailable: true
  },
  {
    id: 'room-booking',
    title: 'Đặt phòng đọc',
    description: 'Đặt trước phòng đọc cho các hoạt động học tập và nghiên cứu.',
    icon: Calendar,
    color: 'bg-green-500',
    features: [
      '1 phòng đọc yên tĩnh',
      'Không gian thoải mái',
      'Trang bị bàn ghế và ánh sáng tốt',
      'Đặt trước tối đa 7 ngày'
    ],
    href: '/services/room-booking',
    formAvailable: true
  },
  {
    id: 'new-books',
    title: 'Sách mới',
    description: 'Cập nhật thông tin về những đầu sách mới nhất được bổ sung vào thư viện.',
    icon: BookOpen,
    color: 'bg-purple-500',
    features: [
      'Cập nhật hàng tuần',
      'Đa dạng thể loại',
      'Sách trong nước và quốc tế',
      'Thông tin chi tiết về sách mới'
    ],
    href: '/services/new-books',
    formAvailable: false
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dịch vụ thư viện</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Chúng tôi cung cấp đầy đủ các dịch vụ hiện đại để phục vụ nhu cầu học tập, 
            nghiên cứu và phát triển tri thức của cộng đồng.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card key={service.id} className="hover:shadow-lg transition-all duration-300 group">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-lg ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button asChild className="w-full group-hover:bg-blue-700">
                    <Link href={service.href}>
                      {service.formAvailable ? 'Đăng ký ngay' : 'Xem chi tiết'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-6 w-6 text-blue-600" />
                Hướng dẫn sử dụng dịch vụ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Đăng ký tài khoản</h4>
                    <p className="text-sm text-gray-600">Tạo tài khoản trên hệ thống để sử dụng các dịch vụ trực tuyến.</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Chọn dịch vụ</h4>
                    <p className="text-sm text-gray-600">Lựa chọn dịch vụ phù hợp với nhu cầu của bạn.</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Điền form đăng ký</h4>
                    <p className="text-sm text-gray-600">Hoàn tất thông tin cần thiết để đăng ký dịch vụ.</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Xác nhận và sử dụng</h4>
                    <p className="text-sm text-gray-600">Chờ xác nhận và bắt đầu sử dụng dịch vụ.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-6 w-6 text-green-600" />
                Thông tin hỗ trợ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Giờ phục vụ</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Thứ 2 - Thứ 6:</span>
                      <span>8:00 - 21:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thứ 7:</span>
                      <span>8:00 - 17:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chủ nhật:</span>
                      <span>9:00 - 16:00</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Liên hệ hỗ trợ</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>📞 Hotline: 0906-1515-66</p>
                    <p>📧 Email: thuvienduonglieu@gmail.com</p>
                    <p>🔗 Web: linktr.ee/duonglieu</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Lưu ý quan trọng</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Mang theo giấy tờ tùy thân khi đăng ký</li>
                    <li>• Tuân thủ nội quy thư viện</li>
                    <li>• Bảo quản tài liệu cẩn thận</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}