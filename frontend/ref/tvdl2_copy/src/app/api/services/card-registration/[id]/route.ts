import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { generateUniqueCardNumber } from '@/lib/cardNumberGenerator';

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Schema cho cập nhật trạng thái
const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'ISSUED', 'REJECTED', 'LOST', 'REVOKED', 'EXPIRED']),
  cardNumber: z.string().optional(),
  notes: z.string().optional(),
  updatedBy: z.string().optional()
});

// GET - Lấy chi tiết một đăng ký
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const registration = await prisma.cardRegistration.findUnique({
      where: { id }
    });

    if (!registration) {
      return NextResponse.json({
        success: false,
        message: 'Không tìm thấy đăng ký'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy dữ liệu'
    }, { status: 500 });
  }
}

// PUT - Cập nhật trạng thái đăng ký
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    // Kiểm tra đăng ký có tồn tại không
    const existingRegistration = await prisma.cardRegistration.findUnique({
      where: { id }
    });

    if (!existingRegistration) {
      return NextResponse.json({
        success: false,
        message: 'Không tìm thấy đăng ký'
      }, { status: 404 });
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData: any = {
      status: validatedData.status,
      updatedBy: validatedData.updatedBy
    };

    // Thêm thông tin đặc biệt theo trạng thái
    if (validatedData.status === 'ISSUED') {
      updateData.issuedDate = new Date();
      updateData.expiryDate = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000); // 2 năm
      
      // Tự động tạo mã số thẻ nếu chưa có
      if (validatedData.cardNumber) {
        updateData.cardNumber = validatedData.cardNumber;
      } else if (!existingRegistration.cardNumber) {
        updateData.cardNumber = await generateUniqueCardNumber();
      }
    }

    if (validatedData.notes) {
      updateData.notes = validatedData.notes;
    }

    // Cập nhật database
    const updatedRegistration = await prisma.cardRegistration.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: updatedRegistration
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật'
    }, { status: 500 });
  }
}

// DELETE - Xóa đăng ký (chỉ admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Kiểm tra đăng ký có tồn tại không
    const existingRegistration = await prisma.cardRegistration.findUnique({
      where: { id }
    });

    if (!existingRegistration) {
      return NextResponse.json({
        success: false,
        message: 'Không tìm thấy đăng ký'
      }, { status: 404 });
    }

    // Xóa đăng ký
    await prisma.cardRegistration.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa đăng ký thành công'
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json({
      success: false,
      message: 'Có lỗi xảy ra khi xóa đăng ký'
    }, { status: 500 });
  }
}