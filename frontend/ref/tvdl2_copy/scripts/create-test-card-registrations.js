const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestCardRegistrations() {
  try {
    console.log('🔧 Creating test card registrations for pagination testing...');
    
    // Create 35 test card registrations to test pagination
    const registrations = [];
    const statuses = ['PENDING', 'APPROVED', 'ISSUED', 'REJECTED', 'LOST', 'REVOKED', 'EXPIRED'];
    const genders = ['male', 'female', 'other'];
    
    for (let i = 1; i <= 35; i++) {
      const birthYear = 1990 + (i % 30); // Ages from ~4 to ~34
      const birthDate = new Date(birthYear, (i % 12), (i % 28) + 1);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      const isUnder15 = age < 15;
      
      registrations.push({
        fullName: `Nguyễn Văn Test ${i}`,
        dateOfBirth: birthDate.toISOString().split('T')[0],
        gender: genders[i % 3],
        idNumber: `${(100000000 + i).toString()}`,
        phone: isUnder15 ? null : `09${(10000000 + i).toString().slice(-8)}`,
        parentPhone: isUnder15 ? `09${(20000000 + i).toString().slice(-8)}` : null,
        email: `test${i}@example.com`,
        address: `${i} Đường Test, Phường ${Math.ceil(i/5)}, Quận ${Math.ceil(i/10)}, TP.HCM`,
        occupation: isUnder15 ? null : `Nghề nghiệp ${i}`,
        workplace: isUnder15 ? null : `Công ty ${Math.ceil(i/3)}`,
        purpose: `Mục đích sử dụng thư viện số ${i}`,
        agreeTerms: true,
        agreeNewsletter: i % 2 === 0,
        age: age,
        isUnder15: isUnder15,
        status: statuses[i % statuses.length],
        cardNumber: (i % 3 === 0) ? `TV2024${i.toString().padStart(6, '0')}` : null,
        issuedDate: (i % 3 === 0) ? new Date(Date.now() - (i * 24 * 60 * 60 * 1000)) : null,
        expiryDate: (i % 3 === 0) ? new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)) : null,
        notes: i % 4 === 0 ? `Ghi chú cho đăng ký số ${i}` : null,
        updatedBy: i % 5 === 0 ? 'admin' : null
      });
    }
    
    // Delete existing test registrations first
    const deleteResult = await prisma.cardRegistration.deleteMany({
      where: {
        email: {
          contains: '@example.com'
        }
      }
    });
    
    console.log(`🗑️ Deleted ${deleteResult.count} existing test registrations`);
    
    // Create new test registrations
    const result = await prisma.cardRegistration.createMany({
      data: registrations,
      skipDuplicates: true
    });
    
    console.log(`✅ Created ${result.count} test card registrations successfully!`);
    
    // Get total count
    const total = await prisma.cardRegistration.count();
    console.log(`📋 Total card registrations in database: ${total}`);
    
    // Show status breakdown
    const statusCounts = await prisma.cardRegistration.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    console.log('📊 Status breakdown:');
    statusCounts.forEach(item => {
      console.log(`   ${item.status}: ${item._count.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating test card registrations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestCardRegistrations();