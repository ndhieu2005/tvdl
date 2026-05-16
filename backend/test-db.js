require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

p.admins.findMany()
  .then(r => console.log('DB OK, admins:', r.length))
  .catch(e => console.error('DB FAIL:', e.message))
  .finally(() => p.$disconnect());
