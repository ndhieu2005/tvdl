'use client';

import React, { useRef } from 'react';

export default function SimpleEditor() {
  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Simple Editor Test</h2>
      <div
        ref={editorRef}
        contentEditable={true}
        className="p-4 border border-gray-300 rounded min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        onInput={(e) => {
          console.log('✅ SimpleEditor onInput triggered!', e);
          console.log('Content:', editorRef.current?.innerHTML);
        }}
        onKeyDown={(e) => {
          console.log('✅ SimpleEditor keyDown:', e.key);
        }}
        onFocus={() => console.log('✅ SimpleEditor focused')}
        onBlur={() => console.log('✅ SimpleEditor blurred')}
        suppressContentEditableWarning={true}
      >
        Click here and type something...
      </div>
    </div>
  );
}