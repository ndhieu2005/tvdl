'use client';

import React, { useState } from 'react';
import { RecaptchaV3, useRecaptchaV3 } from '@/components/RecaptchaV3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestRecaptchaPage() {
  const { executeRecaptcha } = useRecaptchaV3();
  const [results, setResults] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});

  const testAction = async (action: string, apiEndpoint?: string) => {
    setLoading(prev => ({ ...prev, [action]: true }));
    
    try {
      // Test reCAPTCHA token generation
      const token = await executeRecaptcha(action);
      
      if (!token) {
        setResults(prev => ({
          ...prev,
          [action]: {
            success: false,
            error: 'Không thể tạo reCAPTCHA token',
            timestamp: new Date().toLocaleString()
          }
        }));
        return;
      }

      let apiResult = null;
      
      // Test API call if endpoint provided
      if (apiEndpoint) {
        const testData = action === 'card_registration' ? {
          fullName: 'Test User',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          idNumber: '123456789',
          phone: '0901234567',
          email: 'test@example.com',
          address: 'Test Address',
          agreeTerms: true,
          recaptchaToken: token
        } : {
          fullName: 'Test User',
          phone: '0901234567',
          email: 'test@example.com',
          cardNumber: '123456',
          roomType: 'READING_ROOM',
          bookingDate: '2025-01-20',
          timeSlot: '10:00 - 12:00',
          duration: '2',
          purpose: 'Test purpose',
          numberOfPeople: '1',
          agreeTerms: true,
          recaptchaToken: token
        };

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData)
        });

        apiResult = {
          status: response.status,
          data: await response.json()
        };
      }

      setResults(prev => ({
        ...prev,
        [action]: {
          success: true,
          token: token.substring(0, 50) + '...',
          apiResult,
          timestamp: new Date().toLocaleString()
        }
      }));

    } catch (error) {
      setResults(prev => ({
        ...prev,
        [action]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toLocaleString()
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [action]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Test reCAPTCHA v3</h1>
          <p className="text-lg text-gray-600">
            Kiểm tra tích hợp reCAPTCHA v3 cho các trang dịch vụ
          </p>
        </div>

        {/* Load reCAPTCHA v3 */}
        <RecaptchaV3 onToken={() => {}} action="test" />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card Registration Test */}
          <Card>
            <CardHeader>
              <CardTitle>Card Registration Test</CardTitle>
              <CardDescription>
                Test reCAPTCHA v3 cho trang đăng ký làm thẻ thư viện
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => testAction('card_registration')}
                disabled={loading.card_registration}
                className="w-full"
              >
                {loading.card_registration ? 'Đang test...' : 'Test Token Generation'}
              </Button>
              
              <Button 
                onClick={() => testAction('card_registration', '/api/services/card-registration')}
                disabled={loading.card_registration}
                variant="outline"
                className="w-full"
              >
                {loading.card_registration ? 'Đang test...' : 'Test Full API'}
              </Button>

              {results.card_registration && (
                <div className={`p-4 rounded-lg ${results.card_registration.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h4 className="font-medium mb-2">
                    {results.card_registration.success ? '✅ Thành công' : '❌ Lỗi'}
                  </h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Thời gian:</strong> {results.card_registration.timestamp}</p>
                    {results.card_registration.token && (
                      <p><strong>Token:</strong> {results.card_registration.token}</p>
                    )}
                    {results.card_registration.apiResult && (
                      <div>
                        <p><strong>API Status:</strong> {results.card_registration.apiResult.status}</p>
                        <p><strong>API Response:</strong> {JSON.stringify(results.card_registration.apiResult.data, null, 2)}</p>
                      </div>
                    )}
                    {results.card_registration.error && (
                      <p className="text-red-600"><strong>Lỗi:</strong> {results.card_registration.error}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Room Booking Test */}
          <Card>
            <CardHeader>
              <CardTitle>Room Booking Test</CardTitle>
              <CardDescription>
                Test reCAPTCHA v3 cho trang đặt phòng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => testAction('room_booking')}
                disabled={loading.room_booking}
                className="w-full"
              >
                {loading.room_booking ? 'Đang test...' : 'Test Token Generation'}
              </Button>
              
              <Button 
                onClick={() => testAction('room_booking', '/api/services/room-booking')}
                disabled={loading.room_booking}
                variant="outline"
                className="w-full"
              >
                {loading.room_booking ? 'Đang test...' : 'Test Full API'}
              </Button>

              {results.room_booking && (
                <div className={`p-4 rounded-lg ${results.room_booking.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h4 className="font-medium mb-2">
                    {results.room_booking.success ? '✅ Thành công' : '❌ Lỗi'}
                  </h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Thời gian:</strong> {results.room_booking.timestamp}</p>
                    {results.room_booking.token && (
                      <p><strong>Token:</strong> {results.room_booking.token}</p>
                    )}
                    {results.room_booking.apiResult && (
                      <div>
                        <p><strong>API Status:</strong> {results.room_booking.apiResult.status}</p>
                        <p><strong>API Response:</strong> {JSON.stringify(results.room_booking.apiResult.data, null, 2)}</p>
                      </div>
                    )}
                    {results.room_booking.error && (
                      <p className="text-red-600"><strong>Lỗi:</strong> {results.room_booking.error}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Hướng dẫn test</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Test Token Generation:</strong> Chỉ test việc tạo reCAPTCHA token</p>
              <p>• <strong>Test Full API:</strong> Test cả token generation và API call</p>
              <p>• Trong development mode, reCAPTCHA sẽ được bypass</p>
              <p>• Trong production mode, cần score ≥ 0.5 và action đúng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}