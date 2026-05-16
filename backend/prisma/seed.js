const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.admins.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password_hash: hash },
  });
  console.log('Seed xong: admin / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
