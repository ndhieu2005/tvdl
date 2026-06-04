#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Script để kiểm tra các foreign key constraints trong database
 */
async function checkConstraints() {
  console.log('🔍 Checking database foreign key constraints...');
  
  try {
    // Lấy thông tin về các foreign key constraints
    const constraints = await prisma.$queryRaw`
      SELECT 
        kcu.TABLE_NAME,
        kcu.COLUMN_NAME,
        kcu.CONSTRAINT_NAME,
        kcu.REFERENCED_TABLE_NAME,
        kcu.REFERENCED_COLUMN_NAME,
        rc.DELETE_RULE,
        rc.UPDATE_RULE
      FROM 
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
      JOIN 
        INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc 
        ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME 
        AND kcu.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
      WHERE 
        kcu.REFERENCED_TABLE_SCHEMA = DATABASE()
        AND kcu.REFERENCED_TABLE_NAME = 'users'
      ORDER BY 
        kcu.TABLE_NAME, kcu.COLUMN_NAME;
    `;

    console.log('\n📋 Foreign Key Constraints referencing users table:');
    console.log('─'.repeat(120));
    console.log('Table'.padEnd(20) + 'Column'.padEnd(15) + 'Constraint'.padEnd(35) + 'Delete Rule'.padEnd(15) + 'Update Rule');
    console.log('─'.repeat(120));

    for (const constraint of constraints) {
      console.log(
        constraint.TABLE_NAME.padEnd(20) +
        constraint.COLUMN_NAME.padEnd(15) +
        constraint.CONSTRAINT_NAME.padEnd(35) +
        constraint.DELETE_RULE.padEnd(15) +
        constraint.UPDATE_RULE
      );
    }

    console.log('─'.repeat(120));

    // Kiểm tra các constraints cụ thể
    const expectedCascades = [
      { table: 'posts', column: 'authorId' },
      { table: 'media_files', column: 'uploadedBy' },
      { table: 'session_tokens', column: 'userId' },
      { table: 'api_keys', column: 'userId' }
    ];

    console.log('\n✅ Expected CASCADE constraints:');
    for (const expected of expectedCascades) {
      const found = constraints.find(c => 
        c.TABLE_NAME === expected.table && 
        c.COLUMN_NAME === expected.column &&
        c.DELETE_RULE === 'CASCADE'
      );
      
      if (found) {
        console.log(`   ✅ ${expected.table}.${expected.column} → CASCADE`);
      } else {
        console.log(`   ❌ ${expected.table}.${expected.column} → NOT CASCADE`);
      }
    }

    // Kiểm tra các field String reference
    console.log('\n📝 String reference fields (handled in application logic):');
    const stringReferences = [
      'posts.createdBy',
      'tags.createdBy',
      'security_settings.updatedBy',
      'settings.updatedBy',
      'card_registrations.updatedBy',
      'room_bookings.updatedBy',
      'books.createdBy',
      'books.updatedBy',
      'events.createdBy',
      'events.updatedBy'
    ];

    for (const ref of stringReferences) {
      console.log(`   📝 ${ref}`);
    }

    console.log('\n🎯 Summary:');
    const cascadeCount = constraints.filter(c => c.DELETE_RULE === 'CASCADE').length;
    const restrictCount = constraints.filter(c => c.DELETE_RULE === 'RESTRICT').length;
    const noActionCount = constraints.filter(c => c.DELETE_RULE === 'NO ACTION').length;
    
    console.log(`   - CASCADE constraints: ${cascadeCount}`);
    console.log(`   - RESTRICT constraints: ${restrictCount}`);
    console.log(`   - NO ACTION constraints: ${noActionCount}`);
    console.log(`   - String references: ${stringReferences.length}`);

  } catch (error) {
    console.error('❌ Error checking constraints:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkConstraints();