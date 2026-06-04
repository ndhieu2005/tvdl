'use client';

import React, { useState } from 'react';

export default function SimplePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  console.log('🔍 SimplePostForm render - title:', title);

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold">Simple Post Form (Debug)</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tiêu đề (Simple Test)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            console.log('🔍 Simple input onChange:', e.target.value);
            setTitle(e.target.value);
          }}
          placeholder="Nhập tiêu đề..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">Current value: "{title}"</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nội dung
        </label>
        <textarea
          value={content}
          onChange={(e) => {
            console.log('🔍 Simple textarea onChange:', e.target.value);
            setContent(e.target.value);
          }}
          placeholder="Nhập nội dung..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">Current value: "{content}"</p>
      </div>

      <div className="bg-gray-50 p-3 rounded text-sm">
        <strong>Debug Info:</strong>
        <br />
        Title length: {title.length}
        <br />
        Content length: {content.length}
      </div>
    </div>
  );
}