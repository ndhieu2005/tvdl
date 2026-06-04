#!/usr/bin/env node
/**
 * Migration script to move existing uploaded files from local storage to MinIO
 */

const fs = require('fs').promises;
const path = require('path');
const { Client } = require('minio');

// MinIO configuration
const getMinioClient = () => {
  const endpoint = process.env.STORAGE_ENDPOINT;
  const accessKey = process.env.STORAGE_ACCESS_KEY;
  const secretKey = process.env.STORAGE_SECRET_KEY;

  if (!endpoint || !accessKey || !secretKey) {
    throw new Error('Missing MinIO environment variables (STORAGE_ENDPOINT, ACCESS_KEY, SECRET_KEY)');
  }

  const cleanEndpoint = endpoint.replace(/^https?:\/\//, '');
  const [host, portString] = cleanEndpoint.split(':');
  const port = portString ? parseInt(portString) : endpoint.startsWith('https') ? 443 : 80;

  return new Client({
    endPoint: host,
    port,
    useSSL: endpoint.startsWith('https'),
    accessKey,
    secretKey,
  });
};

const getBucketName = () => {
  const name = process.env.STORAGE_BUCKET;
  if (!name) {
    throw new Error('STORAGE_BUCKET environment variable is required');
  }
  return name;
};

// Initialize bucket
async function initializeBucket() {
  try {
    const client = getMinioClient();
    const bucket = getBucketName();

    const exists = await client.bucketExists(bucket);
    if (!exists) {
      await client.makeBucket(bucket);
      console.log(`✅ Bucket ${bucket} created successfully`);
    } else {
      console.log(`✅ Bucket ${bucket} already exists`);
    }
    
    return { client, bucket };
  } catch (error) {
    console.error('❌ Error initializing bucket:', error);
    throw error;
  }
}

// Upload single file to MinIO
async function uploadFileToMinio(client, bucket, localPath, minioPath) {
  try {
    const fileBuffer = await fs.readFile(localPath);
    const stats = await fs.stat(localPath);
    
    // Determine content type
    const ext = path.extname(localPath).toLowerCase();
    const contentTypeMap = {
      '.ico': 'image/x-icon',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp'
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    const metadata = {
      'Content-Type': contentType,
      'Original-Path': localPath,
      'Migrated-At': new Date().toISOString(),
      'File-Size': stats.size.toString()
    };
    
    await client.putObject(bucket, minioPath, fileBuffer, fileBuffer.length, metadata);
    
    console.log(`✅ Uploaded: ${localPath} -> ${minioPath}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to upload ${localPath}:`, error.message);
    return false;
  }
}

// Process directory recursively
async function processDirectory(client, bucket, localDir, minioPrefix) {
  try {
    const entries = await fs.readdir(localDir, { withFileTypes: true });
    let totalFiles = 0;
    let uploadedFiles = 0;
    
    for (const entry of entries) {
      const localPath = path.join(localDir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively process subdirectory
        const subResults = await processDirectory(client, bucket, localPath, `${minioPrefix}${entry.name}/`);
        totalFiles += subResults.totalFiles;
        uploadedFiles += subResults.uploadedFiles;
      } else if (entry.isFile()) {
        totalFiles++;
        const minioPath = `${minioPrefix}${entry.name}`;
        
        // Check if file already exists in MinIO
        try {
          await client.statObject(bucket, minioPath);
          console.log(`⏭️  Skipped (already exists): ${minioPath}`);
          uploadedFiles++;
        } catch (statError) {
          // File doesn't exist, upload it
          const success = await uploadFileToMinio(client, bucket, localPath, minioPath);
          if (success) {
            uploadedFiles++;
          }
        }
      }
    }
    
    return { totalFiles, uploadedFiles };
    
  } catch (error) {
    console.error(`❌ Error processing directory ${localDir}:`, error.message);
    return { totalFiles: 0, uploadedFiles: 0 };
  }
}

// Main migration function
async function migrateFilesToMinio() {
  console.log('🚀 Starting file migration to MinIO...');
  
  try {
    // Initialize MinIO
    const { client, bucket } = await initializeBucket();
    
    // Define directories to migrate
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Check if uploads directory exists
    try {
      await fs.access(uploadsDir);
    } catch (error) {
      console.log('📁 No uploads directory found, nothing to migrate');
      return;
    }
    
    console.log(`📁 Processing uploads directory: ${uploadsDir}`);
    
    // Process all files in uploads directory
    const results = await processDirectory(client, bucket, uploadsDir, 'uploads/');
    
    console.log('─'.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`📁 Total files processed: ${results.totalFiles}`);
    console.log(`✅ Files uploaded: ${results.uploadedFiles}`);
    console.log(`❌ Files failed: ${results.totalFiles - results.uploadedFiles}`);
    
    if (results.uploadedFiles > 0) {
      console.log('✅ Migration completed successfully!');
      console.log('\n🔧 Next steps:');
      console.log('1. Deploy the updated application');
      console.log('2. Test file serving via /api/public/files/');
      console.log('3. Update favicon through admin panel to verify');
    } else {
      console.log('⚠️  No files were migrated');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Verify migration
async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  try {
    const { client, bucket } = await initializeBucket();
    
    // List all objects in uploads/ prefix
    const objects = [];
    const stream = client.listObjects(bucket, 'uploads/', true);
    
    await new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        objects.push(obj);
      });
      
      stream.on('end', () => {
        resolve();
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    });
    
    console.log(`📊 Found ${objects.length} objects in MinIO`);
    
    // Group by type
    const byType = {};
    objects.forEach(obj => {
      const pathParts = obj.name.split('/');
      const type = pathParts[1] || 'unknown';
      if (!byType[type]) byType[type] = [];
      byType[type].push(obj);
    });
    
    console.log('📂 Files by type:');
    Object.entries(byType).forEach(([type, files]) => {
      console.log(`   ${type}: ${files.length} files`);
    });
    
    // Test a sample file
    if (objects.length > 0) {
      const sampleFile = objects[0];
      console.log(`🧪 Testing sample file: ${sampleFile.name}`);
      
      try {
        const stats = await client.statObject(bucket, sampleFile.name);
        console.log(`✅ Sample file accessible, size: ${stats.size} bytes`);
      } catch (error) {
        console.error(`❌ Sample file not accessible:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Command line interface
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'migrate':
      await migrateFilesToMinio();
      break;
    case 'verify':
      await verifyMigration();
      break;
    default:
      console.log('Usage: node migrate-files-to-minio.js <command>');
      console.log('Commands:');
      console.log('  migrate  - Migrate files from local storage to MinIO');
      console.log('  verify   - Verify migration by listing MinIO objects');
      console.log('');
      console.log('Environment variables required:');
      console.log('  STORAGE_ENDPOINT');
      console.log('  STORAGE_ACCESS_KEY');
      console.log('  STORAGE_SECRET_KEY');
      console.log('  STORAGE_BUCKET');
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateFilesToMinio, verifyMigration };