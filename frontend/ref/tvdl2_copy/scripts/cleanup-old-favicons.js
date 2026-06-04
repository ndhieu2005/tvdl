#!/usr/bin/env node
/**
 * Script to cleanup old favicon files from MinIO and local storage
 * This helps prevent storage bloat when settings are updated frequently
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
    console.log('⚠️  MinIO not configured, skipping MinIO cleanup');
    return null;
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
    console.log('⚠️  STORAGE_BUCKET not configured');
    return null;
  }
  return name;
};

// Cleanup old favicon files (keep only the most recent 5)
async function cleanupOldFavicons() {
  console.log('🧹 Starting favicon cleanup...');
  
  try {
    // 1. Cleanup MinIO storage
    const minioClient = getMinioClient();
    const bucketName = getBucketName();
    
    if (minioClient && bucketName) {
      console.log('🧹 Cleaning up MinIO storage...');
      
      const faviconObjects = [];
      const stream = minioClient.listObjects(bucketName, 'uploads/favicon/', true);
      
      await new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          if (obj.name.includes('favicon-')) {
            faviconObjects.push(obj);
          }
        });
        
        stream.on('end', () => {
          resolve();
        });
        
        stream.on('error', (err) => {
          reject(err);
        });
      });
      
      // Sort by last modified (newest first)
      faviconObjects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      
      // Keep only the 5 most recent files
      const filesToDelete = faviconObjects.slice(5);
      
      console.log(`📊 Found ${faviconObjects.length} favicon files in MinIO`);
      console.log(`🗑️  Deleting ${filesToDelete.length} old favicon files from MinIO`);
      
      for (const file of filesToDelete) {
        try {
          await minioClient.removeObject(bucketName, file.name);
          console.log(`✅ Deleted: ${file.name}`);
        } catch (error) {
          console.error(`❌ Failed to delete ${file.name}:`, error.message);
        }
      }
    }
    
    // 2. Cleanup local storage
    console.log('🧹 Cleaning up local storage...');
    
    const localFaviconDir = path.join(process.cwd(), 'public', 'uploads', 'favicon');
    
    try {
      const files = await fs.readdir(localFaviconDir);
      const faviconFiles = files.filter(file => file.includes('favicon-'));
      
      // Get file stats for sorting
      const fileStats = await Promise.all(
        faviconFiles.map(async (file) => {
          const filePath = path.join(localFaviconDir, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            path: filePath,
            mtime: stats.mtime,
          };
        })
      );
      
      // Sort by modification time (newest first)
      fileStats.sort((a, b) => b.mtime - a.mtime);
      
      // Keep only the 5 most recent files
      const localFilesToDelete = fileStats.slice(5);
      
      console.log(`📊 Found ${faviconFiles.length} favicon files in local storage`);
      console.log(`🗑️  Deleting ${localFilesToDelete.length} old favicon files from local storage`);
      
      for (const file of localFilesToDelete) {
        try {
          await fs.unlink(file.path);
          console.log(`✅ Deleted: ${file.name}`);
        } catch (error) {
          console.error(`❌ Failed to delete ${file.name}:`, error.message);
        }
      }
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📁 Local favicon directory does not exist, skipping local cleanup');
      } else {
        console.error('❌ Error cleaning up local storage:', error.message);
      }
    }
    
    console.log('✅ Favicon cleanup completed');
    
  } catch (error) {
    console.error('❌ Error during favicon cleanup:', error);
    process.exit(1);
  }
}

// Run cleanup
if (require.main === module) {
  cleanupOldFavicons();
}

module.exports = { cleanupOldFavicons };