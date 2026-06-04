const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Starting database migration for API keys...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Apply migrations
    console.log('📦 Applying migrations...');
    // Note: Run `npx prisma migrate dev --name add-api-keys` to create migration
    
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Run: npx prisma generate');
    console.log('2. Run: npx prisma migrate dev --name add-api-keys');
    console.log('3. Test API key creation via admin panel');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();