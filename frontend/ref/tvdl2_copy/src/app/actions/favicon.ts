'use server';

import { writeFile, mkdir, copyFile, unlink } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';
import { existsSync } from 'fs';

export async function uploadFavicon(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'No file provided' };
    }

    // Validate file type
    const allowedTypes = ['image/x-icon', 'image/png', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { error: 'Invalid file type. Please upload an ICO, PNG, JPG, or GIF file.' };
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return { error: 'File too large. Maximum size is 2MB.' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename based on file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    let filename: string;
    
    if (extension === 'ico') {
      filename = 'favicon.ico';
    } else {
      filename = `favicon.${extension}`;
    }

    // Save directly to public directory for immediate access
    const publicPath = join(process.cwd(), 'public', filename);
    await writeFile(publicPath, buffer);

    // Also save to logo directory for backup
    const faviconDir = join(process.cwd(), 'public', 'logo');
    await mkdir(faviconDir, { recursive: true });
    const backupPath = join(faviconDir, `${Date.now()}-${filename}`);
    await writeFile(backupPath, buffer);

    // Return the public URL (direct access, no API needed)
    const publicUrl = `/${filename}`;
    
    // Revalidate to refresh cache
    revalidatePath('/admin/settings');
    revalidatePath('/');
    
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading favicon:', error);
    return { error: 'Failed to upload favicon' };
  }
}

export async function uploadLogo(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'No file provided' };
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { error: 'Invalid file type. Please upload a PNG, JPG, SVG, or WEBP file.' };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { error: 'File too large. Maximum size is 5MB.' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Always save as logo.png for consistency
    const filename = 'logo.png';

    // For non-PNG files, we'll save the original but name it as PNG
    // This is a simple approach - in production you might want to convert to PNG
    const publicPath = join(process.cwd(), 'public', filename);
    await writeFile(publicPath, buffer);

    // Also save to logo directory for backup with original extension
    const originalExtension = file.name.split('.').pop()?.toLowerCase();
    const logoDir = join(process.cwd(), 'public', 'logo');
    await mkdir(logoDir, { recursive: true });
    const backupPath = join(logoDir, `${Date.now()}-logo.${originalExtension}`);
    await writeFile(backupPath, buffer);

    // Always return /logo.png regardless of original format
    const publicUrl = '/logo.png';
    
    // Revalidate to refresh cache
    revalidatePath('/admin/settings');
    revalidatePath('/');
    
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading logo:', error);
    return { error: 'Failed to upload logo' };
  }
}

export async function updateFaviconSetting(faviconUrl: string) {
  try {
    // Here you would update your settings database
    // For now, we'll just return success
    console.log('Updating favicon setting to:', faviconUrl);
    
    // Revalidate to refresh cache
    revalidatePath('/');
    revalidatePath('/admin/settings');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating favicon setting:', error);
    return { error: 'Failed to update favicon setting' };
  }
}