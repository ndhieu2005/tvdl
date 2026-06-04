'use client';

import React, { useState } from 'react';
import { Eye, Edit } from 'lucide-react';

interface FallbackTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

export default function FallbackTextEditor({ 
  content, 
  onChange, 
  placeholder = 'Nhập nội dung bài viết...',
  className = '',
  minHeight = 400
}: FallbackTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 bg-gray-50 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Simple Text Editor (HTML supported)
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              !isPreview 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Edit className="w-4 h-4 inline mr-1" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              isPreview 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-1" />
            Preview
          </button>
        </div>
      </div>

      {/* Editor/Preview */}
      {isPreview ? (
        <div 
          className="p-4 prose max-w-none"
          style={{ minHeight: `${minHeight}px` }}
          dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-500">Không có nội dung để xem trước</p>' }}
        />
      ) : (
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-4 resize-none focus:outline-none font-mono text-sm"
            style={{ 
              minHeight: `${minHeight}px`,
              maxHeight: '600px'
            }}
          />
          {!content && (
            <div 
              className="absolute top-4 left-4 text-gray-400 pointer-events-none font-mono text-sm"
              style={{ userSelect: 'none' }}
            >
              {placeholder}
            </div>
          )}
        </div>
      )}

      {/* Help text */}
      <div className="border-t border-gray-200 p-2 bg-gray-50 text-xs text-gray-500">
        You can use HTML tags like &lt;p&gt;, &lt;h1&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
      </div>
    </div>
  );
}