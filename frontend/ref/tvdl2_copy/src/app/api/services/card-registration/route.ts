import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

import { verifyRecaptcha } from '@/lib/recaptcha';

// Hàm validate số điện thoại Việt Nam
const validateVietnamesePhone = (phone: string): boolean => {
  if (!phone) return false;
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
  const phoneRegex = /^(0[35789])[0-9]{8}$|^(84[35789])[0-9]{8}$/;
  return phoneRegex.test(cleanPhone);
};

// Schema validation cho form đăng ký làm thẻ
const cardRegistrationSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên là bắt buộc'),
  dateOfBirth: z.string().min(1, 'Ngày sinh là bắt buộc'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Giới tính không hợp lệ' })
  }),
  idNumber: z.string().min(9, 'Số CCCD/CMND phải có ít nhất 9 ký tự'),
  phone: z.string()
    .optional()
    .transform(val => val ? val.replace(/\s+/g, '').replace(/[^\d]/g, '') : val)
    .refine(val => !val || validateVietnamesePhone(val), 'Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam 10-11 số)'),
  parentPhone: z.string()
    .optional()
    .transform(val => val ? val.replace(/\s+/g, '').replace(/[^\d]/g, '') : val)
    .refine(val => !val || validateVietnamesePhone(val), 'Số điện thoại phụ huynh không hợp lệ (phải là số điện thoại Việt Nam 10-11 số)'),
  email: z.string().email('Email không hợp lệ'),
  address: z.string().min(1, 'Địa chỉ là bắt buộc'),
  occupation: z.string().optional(),
  workplace: z.string().optional(),
  purpose: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: 'Bạn phải đồng ý với các điều khoản'
  }),
  agreeNewsletter: z.boolean().optional(),
  recaptchaToken: process.env.NODE_ENV === 'production' 
    ? z.string().min(1, 'reCAPTCHA token là bắt buộc')
    : z.string().optional()
}).refine((data) => {
  // Tính tuổi từ ngày sinh
  const today = new Date();
  const birthDate = new Date(data.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Nếu dưới 15 tuổi, phải có số điện thoại phụ huynh
  if (age < 15) {
    return data.parentPhone && data.parentPhone.trim().length > 0;
  }
  
  // Nếu 15 tuổi trở lên, phải có số điện thoại cá nhân
  return data.phone && data.phone.trim().length > 0;
}, {
  message: 'Số điện thoại là bắt buộc (dưới 15 tuổi cần số điện thoại phụ huynh)',
  path: ['phone']
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate dữ liệu
    const validatedData = cardRegistrationSchema.parse(body);

    // Xác minh reCAPTCHA v3 (bắt buộc trong production)
    if (process.env.NODE_ENV === 'production') {
      if (!validatedData.recaptchaToken) {
        return NextResponse.json({
          success: false,
          message: 'reCAPTCHA token là bắt buộc trong môi trường production.'
        }, { status: 400 });
      }
      
      const isRecaptchaValid = await verifyRecaptcha(
        validatedData.recaptchaToken, 
        'card_registration', // Expected action
        0.5 // Minimum score
      );
      if (!isRecaptchaValid) {
        return NextResponse.json({
          success: false,
          message: 'Xác minh reCAPTCHA thất bại. Vui lòng thử lại.'
        }, { status: 400 });
      }
    }
    
    // Tính tuổi
    const today = new Date();
    const birthDate = new Date(validatedData.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Kiểm tra trùng lặp số CCCD/CMND
    const existingRegistration = await prisma.cardRegistration.findUnique({
      where: { idNumber: validatedData.idNumber }
    });

    if (existingRegistration) {
      return NextResponse.json({
        success: false,
        message: 'Số CCCD/CMND này đã được đăng ký trước đó.'
      }, { status: 400 });
    }

    // Tạo object để lưu vào database
    const { recaptchaToken, ...dataToSave } = validatedData;
    
    // Lưu vào database
    const savedRegistration = await prisma.cardRegistration.create({
      data: {
        ...dataToSave,
        age,
        isUnder15: age < 15,
        status: 'PENDING'
      }
    });

    console.log('Card Registration saved to database:', savedRegistration.id);

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công! Chúng tôi sẽ xử lý đơn đăng ký của bạn trong vòng 2-3 ngày làm việc.',
      data: {
        id: savedRegistration.id,
        submittedAt: savedRegistration.createdAt,
        status: savedRegistration.status
      }
    });

  } catch (error) {
    console.error('Card registration error:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Có lỗi xảy ra khi xử lý đăng ký. Vui lòng thử lại sau.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate + 'T23:59:59.999Z');
      }
    }
    
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { idNumber: { contains: search } },
        { phone: { contains: search } },
        { parentPhone: { contains: search } }
      ];
    }

    // Get total count
    const total = await prisma.cardRegistration.count({ where });

    // Get paginated data
    const registrations = await prisma.cardRegistration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: registrations,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    return NextResponse.json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy dữ liệu',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}