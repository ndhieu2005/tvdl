import { Client } from 'minio';

// Hàm lấy cấu hình MinIO từ biến môi trường
const getMinioConfig = () => {
  const endpoint = process.env.STORAGE_ENDPOINT;
  const accessKey = process.env.STORAGE_ACCESS_KEY;
  const secretKey = process.env.STORAGE_SECRET_KEY;

  if (!endpoint || !accessKey || !secretKey) {
    throw new Error('Missing MinIO environment variables (STORAGE_ENDPOINT, ACCESS_KEY, SECRET_KEY)');
  }

  const cleanEndpoint = endpoint.replace(/^https?:\/\//, '');
  const [host, portString] = cleanEndpoint.split(':');
  const port = portString ? parseInt(portString) : endpoint.startsWith('https') ? 443 : 80;

  return {
    endPoint: host,
    port,
    useSSL: endpoint.startsWith('https'),
    accessKey,
    secretKey,
  };
};

// Hàm khởi tạo client mỗi lần sử dụng
export const getMinioClient = () => {
  return new Client(getMinioConfig());
};

// Export client instance for backward compatibility - lazy initialization
let _minioClient: Client | null = null;

// Create a safe proxy that only initializes when actually used
export const minioClient = new Proxy({} as Client, {
  get(target, prop) {
    // Skip initialization during build time
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && !process.env.STORAGE_ENDPOINT) {
      throw new Error('MinIO client not available during build time');
    }
    
    if (!_minioClient) {
      _minioClient = getMinioClient();
    }
    return (_minioClient as any)[prop];
  }
});

// Hàm lấy tên bucket an toàn
export const getBucketName = () => {
  const name = process.env.STORAGE_BUCKET;
  if (!name) {
    throw new Error('STORAGE_BUCKET environment variable is required');
  }
  return name;
};

// Hàm khởi tạo bucket nếu chưa tồn tại
export async function initializeBucket() {
  try {
    const client = getMinioClient();
    const bucket = getBucketName();

    const exists = await client.bucketExists(bucket);
    if (!exists) {
      await client.makeBucket(bucket);
      console.log(`Bucket ${bucket} created successfully`);
    }
  } catch (error) {
    console.error('Error initializing bucket:', error);
  }
}

// Upload file to MinIO
export async function uploadFile(
  fileName: string,
  fileBuffer: Buffer,
  contentType: string,
  metadata?: Record<string, string>
) {
  try {
    const client = getMinioClient();
    const bucket = getBucketName();
    const objectName = `${Date.now()}-${fileName}`;
    const metaData = {
      'Content-Type': contentType,
      ...metadata,
    };

    await client.putObject(bucket, objectName, fileBuffer, fileBuffer.length, metaData);
    
    return {
      objectName,
      size: fileBuffer.length,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Get file list from MinIO
export async function getFileList(prefix?: string) {
  try {
    const client = getMinioClient();
    const bucket = getBucketName();
    const objects: any[] = [];
    const stream = client.listObjects(bucket, prefix, true);
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        objects.push(obj);
      });
      
      stream.on('end', () => {
        resolve(objects);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error getting file list:', error);
    throw error;
  }
}

// Delete file from MinIO
export async function deleteFile(objectName: string) {
  try {
    const client = getMinioClient();
    const bucket = getBucketName();
    await client.removeObject(bucket, objectName);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Get file URL
export async function getFileUrl(objectName: string, expiry: number = 7 * 24 * 60 * 60) {
  try {
    const client = getMinioClient();
    const bucket = getBucketName();
    const url = await client.presignedGetObject(bucket, objectName, expiry);
    return url;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
}

// Get file stats
export async function getFileStats(objectName: string) {
  try {
    const client = getMinioClient();
    const bucket = getBucketName();
    const stats = await client.statObject(bucket, objectName);
    return stats;
  } catch (error) {
    console.error('Error getting file stats:', error);
    throw error;
  }
}
