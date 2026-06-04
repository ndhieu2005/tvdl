'use client';

import React, { useState } from 'react';

export default function IsolatedTest() {
  const [title, setTitle] = useState('');
  
  // Track renders without causing re-render
  const renderCountRef = React.useRef(0);
  renderCountRef.current += 1;

  console.log('🧪 IsolatedTest render #', renderCountRef.current, 'title:', title);

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-bold text-yellow-800 mb-4">🧪 Isolated Test Component</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Input (Completely Isolated)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              console.log('🧪 Isolated onChange:', e.target.value);
              setTitle(e.target.value);
            }}
            onFocus={() => console.log('🧪 Isolated focused')}
            onBlur={() => console.log('🧪 Isolated blurred')}
            placeholder="Type here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="bg-white p-3 rounded border text-sm">
          <div><strong>Current Value:</strong> "{title}"</div>
          <div><strong>Length:</strong> {title.length}</div>
          <div><strong>Render Count:</strong> {renderCountRef.current}</div>
        </div>

        <button
          onClick={() => {
            console.log('🧪 Force setting title to "Test"');
            setTitle('Test');
          }}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Set to "Test"
        </button>
      </div>
    </div>
  );
}