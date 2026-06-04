'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { uploadFavicon, uploadLogo } from '@/app/actions/favicon';

interface PublicFileUploadProps {
  type: 'logo' | 'favicon';
  currentUrl?: string;
  onUpload: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function PublicFileUpload({ 
  type, 
  currentUrl, 
  onUpload, 
  accept = 'image/*',
  maxSize = 5,
  className = ''
}: PublicFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    setSuccess(null);
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File quá lớn. Kích thước tối đa ${maxSize}MB`);
      return;
    }
    
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      let result;
      if (type === 'favicon') {
        result = await uploadFavicon(formData);
      } else {
        result = await uploadLogo(formData);
      }
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.success && result.url) {
        onUpload(result.url);
        setSuccess('Upload thành công! File đã được lưu vào thư mục public để tải nhanh hơn.');
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      }
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Lỗi upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    onUpload('');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-2">
          {uploading ? (
            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
          
          <div className="text-sm text-gray-600">
            {uploading ? (
              <span>Đang upload vào thư mục public...</span>
            ) : (
              <>
                <span className="font-medium text-purple-600">Nhấp để chọn file</span>
                <span> hoặc kéo thả vào đây</span>
              </>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            {type === 'logo' ? 'SVG, PNG, JPG, WEBP' : 'ICO, PNG, JPG'} 
            <span className="mx-1">•</span>
            Tối đa {maxSize}MB
            <span className="mx-1">•</span>
            <span className="text-green-600">Lưu trực tiếp vào public</span>
          </div>
        </div>
      </div>

      {/* Current File Preview */}
      {currentUrl && (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            {currentUrl.endsWith('.svg') ? (
              <Image className="h-6 w-6 text-gray-400" />
            ) : (
              <img 
                src={currentUrl} 
                alt="Current file" 
                className="h-6 w-6 object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentUrl.startsWith('/') ? `public${currentUrl}` : currentUrl}
            </p>
            <p className="text-xs text-gray-500">
              {currentUrl.startsWith('/') ? 'File trong thư mục public (tải nhanh)' : 'File hiện tại'}
            </p>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearFile();
            }}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Xóa file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm text-green-700">{success}</span>
        </div>
      )}
    </div>
  );
}