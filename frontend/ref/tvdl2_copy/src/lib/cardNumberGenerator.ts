import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Tạo mã số thẻ thư viện theo format: TV + YYYY + NNNNNN
 * TV: Thư Viện
 * YYYY: Năm hiện tại
 * NNNNNN: Số thứ tự 6 chữ số (bắt đầu từ 000001)
 */
export async function generateCardNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `TV${currentYear}`;
  
  try {
    // Tìm số thẻ cao nhất trong năm hiện tại
    const lastCard = await prisma.cardRegistration.findFirst({
      where: {
        cardNumber: {
          startsWith: prefix
        },
        status: 'ISSUED'
      },
      orderBy: {
        cardNumber: 'desc'
      }
    });
    
    let nextNumber = 1;
    
    if (lastCard && lastCard.cardNumber) {
      // Lấy 6 chữ số cuối và tăng lên 1
      const lastNumber = parseInt(lastCard.cardNumber.slice(-6));
      nextNumber = lastNumber + 1;
    }
    
    // Format số thành 6 chữ số với leading zeros
    const formattedNumber = nextNumber.toString().padStart(6, '0');
    
    return `${prefix}${formattedNumber}`;
  } catch (error) {
    console.error('Error generating card number:', error);
    // Fallback: sử dụng timestamp
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  }
}

/**
 * Tạo mã số thẻ duy nhất (đảm bảo không trùng lặp)
 */
export async function generateUniqueCardNumber(): Promise<string> {
  let cardNumber = await generateCardNumber();
  let attempts = 0;
  const maxAttempts = 10;
  
  // Kiểm tra và tạo lại nếu trùng lặp
  while (attempts < maxAttempts) {
    const existingCard = await prisma.cardRegistration.findFirst({
      where: { cardNumber: cardNumber }
    });
    
    if (!existingCard) {
      break;
    }
    
    attempts++;
    // Thêm suffix để tránh trùng lặp
    const currentYear = new Date().getFullYear();
    const prefix = `TV${currentYear}`;
    const randomSuffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    cardNumber = `${prefix}${randomSuffix}`;
  }
  
  if (attempts >= maxAttempts) {
    throw new Error('Không thể tạo mã số thẻ duy nhất sau nhiều lần thử');
  }
  
  return cardNumber;
}