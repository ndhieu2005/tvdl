'use client';

import React, { useRef, useEffect, useCallback } from 'react';
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

interface StableRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

export default function StableRichTextEditor({ 
  content, 
  onChange, 
  placeholder = 'Nhập nội dung bài viết...',
  className = '',
  minHeight = 400
}: StableRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  const lastContentRef = useRef(content);

  // Only update editor content if it's different from what user typed
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current && content !== lastContentRef.current) {
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const startOffset = range?.startOffset || 0;
      const endOffset = range?.endOffset || 0;
      const startContainer = range?.startContainer;

      editorRef.current.innerHTML = content;
      lastContentRef.current = content;

      // Restore cursor position
      if (startContainer && editorRef.current.contains(startContainer)) {
        try {
          const newRange = document.createRange();
          newRange.setStart(startContainer, Math.min(startOffset, startContainer.textContent?.length || 0));
          newRange.setEnd(startContainer, Math.min(endOffset, startContainer.textContent?.length || 0));
          selection?.removeAllRanges();
          selection?.addRange(newRange);
        } catch (e) {
          // Fallback: place cursor at end
          const newRange = document.createRange();
          newRange.selectNodeContents(editorRef.current);
          newRange.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(newRange);
        }
      }
    }
  }, [content]);

  const executeCommand = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return;
    
    document.execCommand(command, false, value);
    
    // Get updated content and notify parent
    const newContent = editorRef.current.innerHTML;
    if (newContent !== lastContentRef.current) {
      isUpdatingRef.current = true;
      lastContentRef.current = newContent;
      onChange(newContent);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (!editorRef.current || isUpdatingRef.current) return;
    
    const newContent = editorRef.current.innerHTML;
    if (newContent !== lastContentRef.current) {
      isUpdatingRef.current = true;
      lastContentRef.current = newContent;
      onChange(newContent);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput();
  }, [handleInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle common shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
      }
    }
  }, [executeCommand]);

  const tools = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
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
              onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
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
        onKeyDown={handleKeyDown}
        className="p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        style={{ 
          minHeight: `${minHeight}px`,
          maxHeight: '600px',
          overflowY: 'auto'
        }}
        suppressContentEditableWarning={true}
      />

      {/* Placeholder */}
      {!content && (
        <div 
          className="absolute top-[60px] left-4 text-gray-400 pointer-events-none"
          style={{ marginTop: '4px' }}
        >
          {placeholder}
        </div>
      )}

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}