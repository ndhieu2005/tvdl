const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestBooks() {
  try {
    console.log('🔧 Creating test books for pagination testing...');
    
    // Create 35 test books to test pagination
    const books = [];
    for (let i = 1; i <= 35; i++) {
      books.push({
        title: `Test Book ${i}`,
        author: `Author ${i}`,
        bookCode: `TB${i.toString().padStart(3, '0')}`,
        isbn: `978-0-${i.toString().padStart(6, '0')}-0`,
        publisher: `Publisher ${Math.ceil(i / 5)}`,
        publishYear: 2020 + (i % 5),
        genre: ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography'][i % 5],
        pages: 200 + (i * 10),
        quantity: Math.ceil(i / 10),
        availableQuantity: Math.ceil(i / 10),
        location: `Shelf ${Math.ceil(i / 10)}`,
        status: ['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'][i % 3],
        slug: `test-book-${i}`,
        description: `This is test book number ${i} for pagination testing.`,
        metaTitle: `Test Book ${i} - Meta Title`,
        metaDescription: `Meta description for test book ${i}`,
        createdBy: 'cmdhkn98s0000m29wl4ojl0rs' // Admin user ID
      });
    }
    
    // Delete existing test books first
    const deleteResult = await prisma.book.deleteMany({
      where: {
        bookCode: {
          startsWith: 'TB'
        }
      }
    });
    
    console.log(`🗑️ Deleted ${deleteResult.count} existing test books`);
    
    // Create new test books
    const result = await prisma.book.createMany({
      data: books,
      skipDuplicates: true
    });
    
    console.log(`✅ Created ${result.count} test books successfully!`);
    
    // Get total count
    const total = await prisma.book.count();
    console.log(`📚 Total books in database: ${total}`);
    
  } catch (error) {
    console.error('❌ Error creating test books:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestBooks();