const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createNewBooksCategory() {
  try {
    console.log('🏷️ Creating "Sách mới" category...');
    
    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: { slug: 'sach-moi' }
    });
    
    if (existingCategory) {
      console.log('✅ Category "Sách mới" already exists:', existingCategory);
      return existingCategory;
    }
    
    // Create new category
    const newCategory = await prisma.category.create({
      data: {
        name: 'Giới thiệu sách mới',
        slug: 'sach-moi',
        description: 'Bài viết giới thiệu về những cuốn sách mới nhất của thư viện',
        color: 'bg-blue-100 text-blue-800',
        status: 'ACTIVE'
      }
    });
    
    console.log('✅ Created "Sách mới" category:', newCategory);
    return newCategory;
    
  } catch (error) {
    console.error('❌ Error creating category:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createNewBooksCategory()
  .then(() => {
    console.log('🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });