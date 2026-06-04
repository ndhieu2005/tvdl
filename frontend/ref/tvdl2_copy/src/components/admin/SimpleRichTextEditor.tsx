'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link,
  Quote,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';

interface SimpleRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

export default function SimpleRichTextEditor({ 
  content, 
  onChange, 
  placeholder = 'Nhập nội dung bài viết...',
  className = '',
  minHeight = 400
}: SimpleRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize editor content only once
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && !isInitialized) {
      editor.innerHTML = content || '';
      setIsInitialized(true);
    }
  }, [content, isInitialized]);

  // Update content only when it changes from outside and editor is not focused
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && isInitialized && document.activeElement !== editor) {
      if (editor.innerHTML !== content) {
        editor.innerHTML = content || '';
      }
    }
  }, [content, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const executeCommand = useCallback((command: string, value?: string) => {
    try {
      document.execCommand(command, false, value);
      updateContent();
    } catch (error) {
      console.error('Error executing command:', command, error);
    }
  }, []);

  const updateContent = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        if (newContent !== content) {
          onChange(newContent);
        }
      }
    }, 100);
  }, [content, onChange]);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    // Prevent React from interfering with contentEditable
    e.stopPropagation();
    updateContent();
  }, [updateContent]);

  const handleFocus = useCallback(() => {
    // Clear any pending updates when editor gains focus
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  const handleBlur = useCallback(() => {
    // Force update when editor loses focus
    updateContent();
  }, [updateContent]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    try {
      document.execCommand('insertText', false, text);
      updateContent();
    } catch (error) {
      console.error('Error pasting text:', error);
    }
  }, [updateContent]);

  const tools = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { icon: Heading1, command: 'formatBlock', value: 'h1', title: 'Heading 1' },
    { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading 2' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
  ];

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 bg-gray-50">
        <div className="flex flex-wrap gap-1">
          {tools.map((tool, index) => (
            <button
              key={index}
              type="button"
              onClick={() => executeCommand(tool.command, tool.value)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title={tool.title}
            >
              <tool.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="p-4 focus:outline-none"
        style={{ 
          minHeight: `${minHeight}px`,
          maxHeight: '600px',
          overflowY: 'auto'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          font-style: italic;
        }
        [contenteditable]:focus:empty:before {
          color: #d1d5db;
        }
      `}</style>
    </div>
  );
}