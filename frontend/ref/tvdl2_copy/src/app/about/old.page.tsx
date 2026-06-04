import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Clock, MapPin, Phone, Mail } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Về Thư viện Dương Liễu</h1>
          <p className="text-lg text-gray-600">Gìn giữ và nâng cao văn hoá đọc từ năm 2013</p>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Main info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-6 w-6 text-blue-600" />
                  Giới thiệu chung
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg max-w-none">
                <p className="text-gray-700 mb-4">
                  Xuất phát từ tâm huyết của người sáng lập là anh Phùng Bá Hưng, Thư viện Dương Liễu (Hoài Đức, Hà Nội) được lập ra vào năm 2013. Theo anh Hưng, thư viện được thành lập dựa trên mục đích gìn giữ và nâng cao văn hoá đọc.
                </p>
                
                <p className="text-gray-700 mb-4">
                  Ban đầu, người đến thư viện chỉ là trẻ em xung quanh, hoặc các bạn học sinh rủ nhau đến tìm sách đọc. Hiện tại, trong thời gian mở cửa, người dân mọi lứa tuổi ở Dương Liễu và các xã xung quanh khác tìm đến để đọc sách.
                </p>
                
                <p className="text-gray-700 mb-4">
                  "Không chỉ vậy, sức lan tỏa của thư viện đã đi xa hơn thế rất nhiều. Thư viện thường xuyên nhận được sự quan tâm và đóng góp từ nhiều cá nhân, tổ chức. Điều này cho thấy những giá trị mà Thư viện Dương Liễu tạo ra đã giành được sự tin tưởng, ủng hộ từ cộng đồng. Sự tin tưởng chính là yếu tố quan trọng để thư viện duy trì sự quan tâm từ cộng đồng và thúc đẩy các hoạt động", anh Hưng cho hay.
                </p>

                <p className="text-gray-700 mb-4">
                  Theo lời của anh Hưng, cho đến hiện nay, thư viện vẫn giữ vững mục tiêu ban đầu của mình, hướng tới đối tượng chủ yếu là trẻ em, tạo môi trường lành mạnh cho sự phát triển của các em.
                </p>

                <p className="text-gray-700 mb-4">
                  Trong những năm phát triển của thư viện, đã có rất nhiều bạn đọc, thành viên các ban và các tình nguyện viên của thư viện trưởng thành. Các bạn trở nên tự tin, tài giỏi, tiến xa trên con đường học tập và sự nghiệp của mình. Đó cũng chính là động lực cho thấy hướng đi và giá trị của thư viện tạo ra vô cùng đúng đắn và thiết thực.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Info cards */}
          <div className="space-y-6">
            {/* Opening hours */}
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

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-red-600" />
                  Địa chỉ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Thôn Thống Nhất, xã Dương Liễu<br />
                  Hoài Đức, Hà Nội
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-blue-600" />
                  Liên hệ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Phone className="mr-2 h-4 w-4 text-gray-500" />
                  <span>0906-1515-66</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 w-4 text-gray-500" />
                  <span>thuvienduonglieu@gmail.com</span>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-purple-600" />
                  Thống kê
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">15,000+</div>
                    <div className="text-sm text-gray-600">Đầu sách</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">2,500+</div>
                    <div className="text-sm text-gray-600">Thành viên</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">50+</div>
                    <div className="text-sm text-gray-600">Sự kiện/năm</div>
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