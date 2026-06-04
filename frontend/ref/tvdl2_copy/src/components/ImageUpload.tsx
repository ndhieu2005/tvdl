'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'books',
  label = 'Hình ảnh',
  placeholder = 'Chọn hình ảnh hoặc nhập URL',
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        onChange(result.url);
        setUrlInput(result.url);
        setShowUrlInput(false);
      } else {
        alert(result.error || 'Lỗi khi upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Lỗi khi upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setShowUrlInput(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Current Image Preview */}
      {value && (
        <div className="relative inline-block">
          <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              onError={() => {
                // If image fails to load, show placeholder
                onChange('');
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            title="Xóa hình ảnh"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      {!value && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Đang upload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">{placeholder}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Chọn file
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Nhập URL
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL Input Form */}
      {showUrlInput && (
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => {
              setShowUrlInput(false);
              setUrlInput(value || '');
            }}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Hủy
          </button>
        </form>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Chấp nhận: JPEG, PNG, GIF, WebP. Tối đa 5MB.
      </p>
    </div>
  );
}