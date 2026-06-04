import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// GET - Lấy thống kê số thẻ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    
    // Thống kê tổng quan
    const totalRegistrations = await prisma.cardRegistration.count();
    const totalIssued = await prisma.cardRegistration.count({
      where: { status: 'ISSUED' }
    });
    const totalPending = await prisma.cardRegistration.count({
      where: { status: 'PENDING' }
    });
    
    // Thống kê theo năm
    const yearPrefix = `TV${year}`;
    const yearlyIssued = await prisma.cardRegistration.count({
      where: {
        cardNumber: {
          startsWith: yearPrefix
        },
        status: 'ISSUED'
      }
    });
    
    // Lấy số thẻ cao nhất trong năm
    const lastCard = await prisma.cardRegistration.findFirst({
      where: {
        cardNumber: {
          startsWith: yearPrefix
        },
        status: 'ISSUED'
      },
      orderBy: {
        cardNumber: 'desc'
      }
    });
    
    // Tính số thẻ tiếp theo
    let nextSequence = 1;
    if (lastCard && lastCard.cardNumber) {
      const lastSequence = parseInt(lastCard.cardNumber.slice(-6));
      nextSequence = lastSequence + 1;
    }
    const nextCardNumber = `${yearPrefix}${nextSequence.toString().padStart(6, '0')}`;
    
    // Thống kê theo tháng trong năm
    const monthlyStats = [];
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const monthlyCount = await prisma.cardRegistration.count({
        where: {
          status: 'ISSUED',
          issuedDate: {
            gte: startDate,
            lte: endDate
          }
        }
      });
      
      monthlyStats.push({
        month,
        monthName: startDate.toLocaleDateString('vi-VN', { month: 'long' }),
        count: monthlyCount
      });
    }
    
    // Thống kê theo trạng thái
    const statusStats = await prisma.cardRegistration.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    // Thống kê theo độ tuổi
    const ageStats = await prisma.cardRegistration.groupBy({
      by: ['isUnder15'],
      _count: {
        isUnder15: true
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRegistrations,
          totalIssued,
          totalPending,
          issuedRate: totalRegistrations > 0 ? (totalIssued / totalRegistrations * 100).toFixed(1) : 0
        },
        yearly: {
          year,
          totalIssued: yearlyIssued,
          lastCardNumber: lastCard?.cardNumber || null,
          nextCardNumber
        },
        monthly: monthlyStats,
        byStatus: statusStats.map(stat => ({
          status: stat.status,
          count: stat._count.status,
          label: getStatusLabel(stat.status)
        })),
        byAge: ageStats.map(stat => ({
          isUnder15: stat.isUnder15,
          count: stat._count.isUnder15,
          label: stat.isUnder15 ? 'Dưới 15 tuổi' : '15 tuổi trở lên'
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching card registration stats:', error);
    return NextResponse.json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thống kê'
    }, { status: 500 });
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING': return 'Chờ xử lý';
    case 'APPROVED': return 'Đã duyệt';
    case 'ISSUED': return 'Đã cấp thẻ';
    case 'REJECTED': return 'Từ chối';
    case 'LOST': return 'Mất thẻ';
    case 'REVOKED': return 'Thu hồi';
    case 'EXPIRED': return 'Hết hạn';
    default: return status;
  }
}