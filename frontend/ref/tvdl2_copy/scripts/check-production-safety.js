#!/usr/bin/env node

/**
 * SCRIPT KIỂM TRA AN TOÀN PRODUCTION
 * 
 * Kiểm tra các rủi ro có thể gây mất dữ liệu production
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 KIỂM TRA AN TOÀN PRODUCTION');
console.log('===============================');

let hasIssues = false;

// 1. Kiểm tra file seed.ts
const seedFile = path.join(__dirname, '../prisma/seed.ts');
if (fs.existsSync(seedFile)) {
  const seedContent = fs.readFileSync(seedFile, 'utf8');
  
  console.log('📄 Checking prisma/seed.ts...');
  
  if (seedContent.includes('deleteMany()')) {
    if (seedContent.includes('NODE_ENV === \'production\'')) {
      console.log('✅ seed.ts has production protection');
    } else {
      console.log('❌ seed.ts contains deleteMany without production protection!');
      hasIssues = true;
    }
  } else {
    console.log('✅ seed.ts does not contain deleteMany');
  }
} else {
  console.log('⚠️  seed.ts not found');
}

// 2. Kiểm tra Helm templates
const helmSeedFile = path.join(__dirname, '../helm/app/templates/prisma-seed-job.yaml');
if (fs.existsSync(helmSeedFile)) {
  const helmContent = fs.readFileSync(helmSeedFile, 'utf8');
  
  console.log('📄 Checking helm seed job...');
  
  // Check for uncommented helm hooks
  const hookPattern = /^\s*"helm\.sh\/hook":\s*post-install,post-upgrade/m;
  if (hookPattern.test(helmContent)) {
    console.log('❌ Helm auto-seed is ENABLED! This will run seed on every deploy!');
    hasIssues = true;
  } else {
    console.log('✅ Helm auto-seed is disabled');
  }
  
  if (helmContent.includes('prisma/seed-production.ts')) {
    console.log('✅ Helm uses safe production seed');
  } else if (helmContent.includes('prisma db seed')) {
    console.log('❌ Helm uses dangerous "prisma db seed" command!');
    hasIssues = true;
  }
} else {
  console.log('⚠️  Helm seed job template not found');
}

// 3. Kiểm tra production seed file
const prodSeedFile = path.join(__dirname, '../prisma/seed-production.ts');
if (fs.existsSync(prodSeedFile)) {
  const prodSeedContent = fs.readFileSync(prodSeedFile, 'utf8');
  
  console.log('📄 Checking prisma/seed-production.ts...');
  
  if (prodSeedContent.includes('deleteMany()')) {
    console.log('❌ Production seed contains deleteMany!');
    hasIssues = true;
  } else {
    console.log('✅ Production seed is safe (no deleteMany)');
  }
  
  if (prodSeedContent.includes('upsert(')) {
    console.log('✅ Production seed uses upsert (safe)');
  }
} else {
  console.log('❌ Production seed file not found!');
  hasIssues = true;
}

// 4. Kiểm tra package.json script
const packageFile = path.join(__dirname, '../package.json');
if (fs.existsSync(packageFile)) {
  const packageContent = fs.readFileSync(packageFile, 'utf8');
  const packageJson = JSON.parse(packageContent);
  
  console.log('📄 Checking package.json seed script...');
  
  if (packageJson.prisma && packageJson.prisma.seed) {
    console.log(`📋 Seed script: ${packageJson.prisma.seed}`);
    
    if (packageJson.prisma.seed.includes('seed.ts')) {
      console.log('⚠️  Package.json points to seed.ts (development version)');
    } else if (packageJson.prisma.seed.includes('seed-production.ts')) {
      console.log('✅ Package.json points to production seed');
    }
  } else {
    console.log('⚠️  No seed script found in package.json');
  }
} else {
  console.log('❌ package.json not found');
  hasIssues = true;
}

// 5. Kiểm tra environment variables
console.log('📄 Checking environment safety...');
if (process.env.NODE_ENV === 'production') {
  console.log('✅ NODE_ENV is set to production');
} else {
  console.log('⚠️  NODE_ENV is not set to production');
}

console.log('\n===============================');
if (hasIssues) {
  console.log('❌ FOUND SAFETY ISSUES!');
  console.log('🚨 DO NOT DEPLOY TO PRODUCTION!');
  console.log('\n🔧 TO FIX:');
  console.log('1. Make sure seed.ts has production protection');
  console.log('2. Disable Helm auto-seed hooks');
  console.log('3. Use seed-production.ts for production');
  console.log('4. Update package.json seed script');
  process.exit(1);
} else {
  console.log('✅ ALL SAFETY CHECKS PASSED');
  console.log('🎉 Safe to deploy to production!');
}