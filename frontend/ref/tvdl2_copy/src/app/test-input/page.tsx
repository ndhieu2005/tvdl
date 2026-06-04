'use client';

import React, { useState } from 'react';

export default function TestInputPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const renderCountRef = React.useRef(0);
  renderCountRef.current += 1;

  console.log('🧪 TestInputPage render #', renderCountRef.current);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Input Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title Input Test
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                console.log('🧪 Title onChange:', e.target.value);
                setTitle(e.target.value);
              }}
              onFocus={() => console.log('🧪 Title focused')}
              onBlur={() => console.log('🧪 Title blurred')}
              onMouseDown={(e) => console.log('🧪 mouseDown', e)}
              onMouseUp={(e) => console.log('🧪 mouseUp', e)}
              onSelect={(e) => console.log('🧪 select', e)}
              onInput={(e) => console.log('🧪 input', e)}
              placeholder="Type title here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
            />
            <p className="mt-1 text-sm text-gray-500">Current: "{title}"</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Textarea Test
            </label>
            <textarea
              value={content}
              onChange={(e) => {
                console.log('🧪 Content onChange:', e.target.value);
                setContent(e.target.value);
              }}
              onFocus={() => console.log('🧪 Content focused')}
              onBlur={() => console.log('🧪 Content blurred')}
              placeholder="Type content here..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">Current: "{content}"</p>
          </div>

          <div className="bg-gray-50 p-4 rounded text-sm">
            <h3 className="font-medium mb-2">Debug Info:</h3>
            <div>Render Count: {renderCountRef.current}</div>
            <div>Title Length: {title.length}</div>
            <div>Content Length: {content.length}</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                console.log('🧪 Setting title to "Test Title"');
                setTitle('Test Title');
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Set Title
            </button>
            <button
              onClick={() => {
                console.log('🧪 Clearing all');
                setTitle('');
                setContent('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}