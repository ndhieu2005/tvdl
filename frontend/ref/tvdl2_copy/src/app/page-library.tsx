import React from 'react';
import Link from 'next/link';
import { SITE_CONTENT, CATEGORIES, LIBRARY_SERVICES } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, Users, Phone, Newspaper } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {SITE_CONTENT.home.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            {SITE_CONTENT.home.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/about">
                <BookOpen className="mr-2 h-5 w-5" />
                Về thư viện
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/services">
                <Users className="mr-2 h-5 w-5" />
                Dịch vụ
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dịch vụ thư viện</h2>
            <p className="text-lg text-gray-600">Chúng tôi cung cấp đầy đủ các dịch vụ phục vụ nhu cầu học tập và nghiên cứu</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {LIBRARY_SERVICES.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4`}>
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {service.name === 'Đăng ký làm thẻ' && 'Đăng ký thẻ thư viện để sử dụng các dịch vụ.'}
                    {service.name === 'Đặt phòng học nhóm' && 'Đặt trước phòng học nhóm và phòng nghiên cứu.'}
                    {service.name === 'Sách mới' && 'Cập nhật thông tin về những đầu sách mới nhất.'}
                  </CardDescription>
                  <Button variant="outline" asChild>
                    <Link href={service.href}>Xem chi tiết</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Truy cập nhanh</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <Calendar className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="font-semibold mb-2">Lịch hoạt động</h3>
                <p className="text-sm text-gray-600 mb-4">Xem lịch sự kiện và hoạt động của thư viện</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/events">Xem lịch</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <BookOpen className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                <h3 className="font-semibold mb-2">Sách mới</h3>
                <p className="text-sm text-gray-600 mb-4">Khám phá những đầu sách mới nhất</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/services/new-books">Xem sách</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <Newspaper className="h-12 w-12 mx-auto text-red-600 mb-4" />
                <h3 className="font-semibold mb-2">Tin tức</h3>
                <p className="text-sm text-gray-600 mb-4">Cập nhật tin tức mới nhất từ thư viện</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/news">Đọc tin</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <Phone className="h-12 w-12 mx-auto text-orange-600 mb-4" />
                <h3 className="font-semibold mb-2">Liên hệ</h3>
                <p className="text-sm text-gray-600 mb-4">Liên hệ với chúng tôi để được hỗ trợ</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/contact">Liên hệ</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}