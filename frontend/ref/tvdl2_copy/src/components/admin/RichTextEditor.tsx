'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Image as ImageIcon,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Type,
  Palette,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  Minus,
  ChevronDown,
  Video,
  FileText,
  Highlighter,
  Copy,
  Clipboard,
  X,
  Loader2,
  Trash2
} from 'lucide-react';
import MediaUploader from './MediaUploader';
import { useAuth } from '@/contexts/AuthContext';
import { mediaAPI } from '@/lib/api/media';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
}

interface ToolBase {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

interface CommandTool extends ToolBase {
  command: string;
  active?: string;
  value?: string;
}

interface FunctionTool extends ToolBase {
  command: () => void;
}

interface DropdownTool extends ToolBase {
  type: 'dropdown';
  options: Array<{
    label: string;
    value: string;
    command: string;
  }>;
}

type Tool = CommandTool | FunctionTool | DropdownTool;

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = 'Nhập nội dung bài viết...',
  className = '',
  minHeight = 400,
  maxHeight = 800
}: RichTextEditorProps) {
  const { token } = useAuth();
  const editorRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [currentFontSize, setCurrentFontSize] = useState('16px');
  const [selectedText, setSelectedText] = useState('');
  const [isUploadingPastedImage, setIsUploadingPastedImage] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const [isImageSelected, setIsImageSelected] = useState(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      // Force LTR direction
      editor.style.direction = 'ltr';
      editor.style.textAlign = 'left';
      editor.style.unicodeBidi = 'normal';
      
      // Set initial content chỉ 1 lần
      if (content && editor.innerHTML !== content) {
        editor.innerHTML = content;
      }
    }
  }, []);

  // Update content only when component mounts or when content changes from outside
  useEffect(() => {
    const editor = editorRef.current;
    
    if (editor && content && editor.innerHTML !== content) {
      // Only update if editor is not focused
      if (document.activeElement !== editor) {
        editor.innerHTML = content;
      }
    }
  }, [content]);

  // Close dropdowns when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     const target = event.target as Node;
  //     if (editorRef.current && !editorRef.current.contains(target)) {
  //       setShowColorPicker(false);
  //       setShowFontSizeDropdown(false);
  //       setShowHeadingDropdown(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, []);

  // Handle image selection and resize
  useEffect(() => {
    const handleImageClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Clear previous selection
      clearImageSelection();
      
      if (target.tagName === 'IMG' && editorRef.current?.contains(target)) {
        const img = target as HTMLImageElement;
        console.log('✅ Image selected:', img.src.substring(0, 50) + '...');
        
        setSelectedImage(img);
        setIsImageSelected(true);
        setImageCaption(img.getAttribute('alt') || '');
        
        // Add resize handles to the image
        addResizeHandles(img);
        
        // Focus on image (to enable alignment buttons)
        const range = document.createRange();
        range.selectNode(img);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        
        // Update active formats to enable alignment buttons
        updateActiveFormats();
        
        console.log('✅ Image selection complete, isImageSelected:', true);
      }
    };

    // const handleClickOutside = (event: MouseEvent) => {
    //   const target = event.target as HTMLElement;
    //   if (!target.closest('.image-resize-container') && !target.closest('.image-editor-modal')) {
    //     clearImageSelection();
    //   }
    // };

    // const editor = editorRef.current;
    // if (editor) {
    //   editor.addEventListener('click', handleImageClick);
    //   document.addEventListener('click', handleClickOutside);
    //   return () => {
    //     editor.removeEventListener('click', handleImageClick);
    //     document.removeEventListener('click', handleClickOutside);
    //   };
    // }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearImageSelection();
      // Clear debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const executeCommand = (command: string, value?: string) => {
    console.log('🔧 Execute command:', command, 'isImageSelected:', isImageSelected);
    
    // Handle alignment commands for selected images
    if (isImageSelected && selectedImage && ['justifyLeft', 'justifyCenter', 'justifyRight'].includes(command)) {
      console.log('📷 Routing to image alignment handler');
      handleImageAlignment(command);
      return;
    }
    
    console.log('📝 Executing regular command');
    document.execCommand(command, false, value);
    updateActiveFormats();
    updateContent();
  };

  const handleImageAlignment = (alignment: string) => {
    if (!selectedImage) {
      console.log('❌ No selected image for alignment');
      return;
    }
    
    const parentDiv = selectedImage.closest('div');
    if (parentDiv) {
      console.log('✅ Applying alignment:', alignment);
      
      // Reset all alignment classes and styles
      parentDiv.style.textAlign = '';
      parentDiv.style.marginLeft = '';
      parentDiv.style.marginRight = '';
      selectedImage.style.margin = '';
      selectedImage.style.display = 'block';
      
      // Apply new alignment
      switch (alignment) {
        case 'justifyLeft':
          parentDiv.style.textAlign = 'left';
          selectedImage.style.margin = '0';
          break;
        case 'justifyCenter':
          parentDiv.style.textAlign = 'center';
          selectedImage.style.margin = '0 auto';
          break;
        case 'justifyRight':
          parentDiv.style.textAlign = 'right';
          selectedImage.style.margin = '0';
          break;
      }
      
      updateContent();
      updateActiveFormats();
      
      console.log('✅ Alignment applied successfully');
    } else {
      console.log('❌ No parent div found for image');
    }
  };

  const updateActiveFormats = () => {
    const formats = new Set<string>();
    
    // Handle alignment for selected images
    if (isImageSelected && selectedImage) {
      const parentDiv = selectedImage.closest('div');
      if (parentDiv) {
        const textAlign = parentDiv.style.textAlign || getComputedStyle(parentDiv).textAlign;
        
        switch (textAlign) {
          case 'left':
            formats.add('justifyLeft');
            break;
          case 'center':
            formats.add('justifyCenter');
            break;
          case 'right':
            formats.add('justifyRight');
            break;
          default:
            // Default to center if no explicit alignment
            formats.add('justifyCenter');
            break;
        }
      }
    } else {
      // Regular text formatting
      try {
        if (document.queryCommandState('bold')) formats.add('bold');
        if (document.queryCommandState('italic')) formats.add('italic');
        if (document.queryCommandState('underline')) formats.add('underline');
        if (document.queryCommandState('strikethrough')) formats.add('strikethrough');
        if (document.queryCommandState('subscript')) formats.add('subscript');
        if (document.queryCommandState('superscript')) formats.add('superscript');
        if (document.queryCommandState('insertUnorderedList')) formats.add('ul');
        if (document.queryCommandState('insertOrderedList')) formats.add('ol');
        if (document.queryCommandState('justifyLeft')) formats.add('justifyLeft');
        if (document.queryCommandState('justifyCenter')) formats.add('justifyCenter');
        if (document.queryCommandState('justifyRight')) formats.add('justifyRight');
        if (document.queryCommandState('justifyFull')) formats.add('justifyFull');
      } catch (e) {
        // Ignore errors in queryCommandState
      }
    }
    
    setActiveFormats(formats);
  };

  const updateContent = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        // Only call onChange if content actually changed
        if (newContent !== content) {
          onChange(newContent);
        }
      }
    }, 100);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const items = e.clipboardData.items;
    let hasImage = false;
    
    // Check for images first
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image/') === 0) {
        hasImage = true;
        const file = item.getAsFile();
        if (file) {
          await handleImagePaste(file);
        }
        break;
      }
    }
    
    // If no image found, handle text paste
    if (!hasImage) {
      const text = e.clipboardData.getData('text/plain');
      if (text) {
        executeCommand('insertText', text);
      }
    }
  };

  const handleImagePaste = async (file: File) => {
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    setIsUploadingPastedImage(true);
    
    try {
      // Create a timestamp-based filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'png';
      const fileName = `pasted-image-${timestamp}.${fileExtension}`;
      
      // Create a new file with the custom name
      const namedFile = new File([file], fileName, { type: file.type });
      
      // Upload the image
      const response = await mediaAPI.uploadFile(namedFile, undefined, token);
      
      if (response.success && response.data) {
        // Insert the image into the editor - use public endpoint for display
        const imageUrl = mediaAPI.getFileUrl(response.data.id);
        const imageHtml = `<div style="margin: 16px 0; text-align: center;"><img src="${imageUrl}" alt="Pasted image" style="max-width: 100%; height: auto; border-radius: 6px; display: block; margin: 0 auto; cursor: pointer;" data-media-id="${response.data.id}"></div>`;
        executeCommand('insertHTML', imageHtml);
        
        console.log('✅ Image pasted successfully:', response.data.name);
      } else {
        console.error('❌ Failed to upload pasted image:', response.error);
        // Show temporary error message
        const errorHtml = `<div style="margin: 16px 0; padding: 12px; background-color: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; color: #b91c1c;">❌ Không thể upload hình ảnh: ${response.error}</div>`;
        executeCommand('insertHTML', errorHtml);
      }
    } catch (error) {
      console.error('❌ Error uploading pasted image:', error);
      const errorHtml = `<div style="margin: 16px 0; padding: 12px; background-color: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; color: #b91c1c;">❌ Lỗi khi upload hình ảnh từ clipboard</div>`;
      executeCommand('insertHTML', errorHtml);
    } finally {
      setIsUploadingPastedImage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Keyboard shortcuts
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
        case 'z':
          e.preventDefault();
          executeCommand('undo');
          break;
        case 'y':
          e.preventDefault();
          executeCommand('redo');
          break;
        case 'k':
          e.preventDefault();
          handleLinkClick();
          break;
      }
    }
  };

  const handleLinkClick = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      setSelectedText(selectedText);
      setLinkText(selectedText);
      setLinkUrl('');
      setShowLinkDialog(true);
    } else {
      setSelectedText('');
      setLinkText('');
      setLinkUrl('');
      setShowLinkDialog(true);
    }
  };

  const insertLink = () => {
    if (linkUrl.trim()) {
      if (selectedText) {
        // Replace selected text with link
        executeCommand('createLink', linkUrl);
      } else {
        // Insert new link with text
        const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText || linkUrl}</a>`;
        executeCommand('insertHTML', linkHtml);
      }
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const insertTable = () => {
    const rows = prompt('Số hàng:');
    const cols = prompt('Số cột:');
    if (rows && cols) {
      const numRows = parseInt(rows);
      const numCols = parseInt(cols);
      if (numRows > 0 && numCols > 0) {
        let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 16px 0;">';
        for (let i = 0; i < numRows; i++) {
          tableHTML += '<tr>';
          for (let j = 0; j < numCols; j++) {
            tableHTML += '<td style="border: 1px solid #ddd; padding: 8px; min-width: 80px;">&nbsp;</td>';
          }
          tableHTML += '</tr>';
        }
        tableHTML += '</table>';
        executeCommand('insertHTML', tableHTML);
      }
    }
  };

  const insertHorizontalLine = () => {
    executeCommand('insertHTML', '<hr style="border: 1px solid #ddd; margin: 20px 0;">');
  };

  const changeFontSize = (size: string) => {
    executeCommand('fontSize', size);
    setCurrentFontSize(size + 'px');
    setShowFontSizeDropdown(false);
  };

  const changeTextColor = (color: string) => {
    executeCommand('foreColor', color);
    setSelectedColor(color);
    setShowColorPicker(false);
  };

  const formatBlock = (tag: string) => {
    executeCommand('formatBlock', tag);
    setShowHeadingDropdown(false);
  };

  const handleMediaSelect = (url: string) => {
    if (url.includes('video') || url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('.avi')) {
      // Insert video
      const videoHtml = `<div style="margin: 16px 0;"><video controls style="max-width: 100%; height: auto; border-radius: 6px;"><source src="${url}" type="video/mp4">Your browser does not support the video tag.</video></div>`;
      executeCommand('insertHTML', videoHtml);
    } else {
      // Insert image
      const imageHtml = `<div style="margin: 16px 0; text-align: center;"><img src="${url}" alt="Uploaded image" style="max-width: 100%; height: auto; border-radius: 6px; display: block; margin: 0 auto; cursor: pointer;"></div>`;
      executeCommand('insertHTML', imageHtml);
    }
    setShowMediaUploader(false);
  };

  const addResizeHandles = (img: HTMLImageElement) => {
    // Remove existing resize container
    const existingContainer = img.closest('.image-resize-container');
    if (existingContainer) {
      existingContainer.replaceWith(img);
    }
    
    // Create resize container
    const container = document.createElement('div');
    container.className = 'image-resize-container';
    container.style.cssText = `
      position: relative;
      display: inline-block;
      border: 2px solid #a855f7;
      margin: 16px 0;
    `;
    
    // Wrap image in container
    const parent = img.parentNode!;
    parent.insertBefore(container, img);
    container.appendChild(img);
    
    // Remove image's border since container has it
    img.style.border = 'none';
    
    // Create resize handles
    const handles = ['nw', 'ne', 'sw', 'se'];
    handles.forEach(position => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-${position}`;
      handle.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: #a855f7;
        border: 1px solid white;
        cursor: ${position === 'nw' || position === 'se' ? 'nw-resize' : 'ne-resize'};
        z-index: 10;
      `;
      
      // Position handles
      switch (position) {
        case 'nw':
          handle.style.top = '-4px';
          handle.style.left = '-4px';
          break;
        case 'ne':
          handle.style.top = '-4px';
          handle.style.right = '-4px';
          break;
        case 'sw':
          handle.style.bottom = '-4px';
          handle.style.left = '-4px';
          break;
        case 'se':
          handle.style.bottom = '-4px';
          handle.style.right = '-4px';
          break;
      }
      
      // Add drag functionality
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startResize(e, img, position);
      });
      
      container.appendChild(handle);
    });
    
    // Add edit button
    const editButton = document.createElement('button');
    editButton.innerHTML = '✏️';
    editButton.className = 'image-edit-button';
    editButton.style.cssText = `
      position: absolute;
      top: -12px;
      right: -12px;
      width: 24px;
      height: 24px;
      background: #a855f7;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      font-size: 12px;
      z-index: 10;
    `;
    editButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowImageEditor(true);
    });
    
    container.appendChild(editButton);
  };

  const startResize = (e: MouseEvent, img: HTMLImageElement, position: string) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = img.offsetWidth;
    const startHeight = img.offsetHeight;
    const aspectRatio = startWidth / startHeight;
    
    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      switch (position) {
        case 'se':
          newWidth = startWidth + (e.clientX - startX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'sw':
          newWidth = startWidth - (e.clientX - startX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'ne':
          newWidth = startWidth + (e.clientX - startX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'nw':
          newWidth = startWidth - (e.clientX - startX);
          newHeight = newWidth / aspectRatio;
          break;
      }
      
      // Minimum size constraints
      if (newWidth < 50) newWidth = 50;
      if (newHeight < 50) newHeight = 50;
      
      // Maximum size constraints
      const editorWidth = editorRef.current?.offsetWidth || 800;
      if (newWidth > editorWidth - 40) newWidth = editorWidth - 40;
      
      img.style.width = newWidth + 'px';
      img.style.height = newHeight + 'px';
      img.style.maxWidth = 'none';
      img.style.maxHeight = 'none';
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      updateContent();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const clearImageSelection = () => {
    // Remove all resize containers
    const containers = editorRef.current?.querySelectorAll('.image-resize-container');
    containers?.forEach(container => {
      const img = container.querySelector('img');
      if (img) {
        container.parentNode?.replaceChild(img, container);
      }
    });
    
    setSelectedImage(null);
    setIsImageSelected(false);
    setShowImageEditor(false);
    
    // Clear selection and update formats
    const selection = window.getSelection();
    selection?.removeAllRanges();
    updateActiveFormats();
  };

  const updateImageCaption = () => {
    if (!selectedImage) return;
    
    selectedImage.setAttribute('alt', imageCaption);
    updateContent();
    setShowImageEditor(false);
  };

  const deleteImage = () => {
    if (!selectedImage) return;
    
    const parentDiv = selectedImage.closest('div');
    if (parentDiv) {
      parentDiv.remove();
      updateContent();
    }
    
    setShowImageEditor(false);
    setSelectedImage(null);
  };

  const copyContent = () => {
    if (editorRef.current) {
      navigator.clipboard.writeText(editorRef.current.innerHTML);
    }
  };

  const pasteContent = async () => {
    try {
      const text = await navigator.clipboard.readText();
      executeCommand('insertText', text);
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  const clearFormatting = () => {
    executeCommand('removeFormat');
  };

  const insertCodeBlock = () => {
    const code = prompt('Nhập code:');
    if (code) {
      const codeHtml = `<pre style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 14px;"><code>${code}</code></pre>`;
      executeCommand('insertHTML', codeHtml);
    }
  };

  const insertQuote = () => {
    const quote = prompt('Nhập trích dẫn:');
    if (quote) {
      const quoteHtml = `<blockquote style="border-left: 4px solid #e5e7eb; padding-left: 16px; margin: 16px 0; font-style: italic; color: #6b7280;">${quote}</blockquote>`;
      executeCommand('insertHTML', quoteHtml);
    }
  };

  const getWordCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
    return 0;
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#808080',
    '#C0C0C0', '#FF9999', '#99FF99', '#9999FF', '#FFFF99', '#FF99FF', '#99FFFF'
  ];

  const fontSizes = [
    { label: 'Rất nhỏ', value: '1' },
    { label: 'Nhỏ', value: '2' },
    { label: 'Bình thường', value: '3' },
    { label: 'Lớn', value: '4' },
    { label: 'Rất lớn', value: '5' },
    { label: 'Khổng lồ', value: '6' },
    { label: 'Siêu lớn', value: '7' }
  ];

  const headingOptions = [
    { label: 'Đoạn văn', value: 'p' },
    { label: 'Tiêu đề 1', value: 'h1' },
    { label: 'Tiêu đề 2', value: 'h2' },
    { label: 'Tiêu đề 3', value: 'h3' },
    { label: 'Tiêu đề 4', value: 'h4' },
    { label: 'Tiêu đề 5', value: 'h5' },
    { label: 'Tiêu đề 6', value: 'h6' }
  ];

  const toolbarGroups: { name: string; tools: Tool[] }[] = [
    {
      name: 'text-style',
      tools: [
        { 
          type: 'dropdown', 
          icon: Type, 
          title: 'Kiểu chữ',
          options: headingOptions.map(opt => ({
            label: opt.label,
            value: opt.value,
            command: 'formatBlock'
          }))
        },
        { 
          type: 'dropdown', 
          icon: ChevronDown, 
          title: 'Kích thước',
          options: fontSizes.map(size => ({
            label: size.label,
            value: size.value,
            command: 'fontSize'
          }))
        }
      ]
    },
    {
      name: 'formatting',
      tools: [
        { command: 'bold', icon: Bold, title: 'Đậm (Ctrl+B)', active: 'bold' },
        { command: 'italic', icon: Italic, title: 'Nghiêng (Ctrl+I)', active: 'italic' },
        { command: 'underline', icon: Underline, title: 'Gạch chân (Ctrl+U)', active: 'underline' },
        { command: 'strikethrough', icon: Strikethrough, title: 'Gạch ngang', active: 'strikethrough' },
        { command: 'subscript', icon: Subscript, title: 'Chỉ số dưới', active: 'subscript' },
        { command: 'superscript', icon: Superscript, title: 'Chỉ số trên', active: 'superscript' },
      ]
    },
    {
      name: 'colors',
      tools: [
        { command: () => setShowColorPicker(!showColorPicker), icon: Palette, title: 'Màu chữ' },
        { command: () => executeCommand('hiliteColor', '#FFFF00'), icon: Highlighter, title: 'Tô sáng' },
      ]
    },
    {
      name: 'alignment',
      tools: [
        { command: 'justifyLeft', icon: AlignLeft, title: 'Căn trái', active: 'justifyLeft' },
        { command: 'justifyCenter', icon: AlignCenter, title: 'Căn giữa', active: 'justifyCenter' },
        { command: 'justifyRight', icon: AlignRight, title: 'Căn phải', active: 'justifyRight' },
      ]
    },
    {
      name: 'lists',
      tools: [
        { command: 'insertUnorderedList', icon: List, title: 'Danh sách', active: 'ul' },
        { command: 'insertOrderedList', icon: ListOrdered, title: 'Danh sách số', active: 'ol' },
      ]
    },
    {
      name: 'insert',
      tools: [
        { command: handleLinkClick, icon: Link, title: 'Chèn liên kết (Ctrl+K)' },
        { command: () => setShowMediaUploader(true), icon: ImageIcon, title: 'Chèn hình ảnh/video' },
        { command: insertQuote, icon: Quote, title: 'Trích dẫn' },
        { command: insertCodeBlock, icon: Code, title: 'Code block' },
        { command: insertTable, icon: Table, title: 'Chèn bảng' },
        { command: insertHorizontalLine, icon: Minus, title: 'Đường kẻ ngang' },
      ]
    },
    {
      name: 'tools',
      tools: [
        { command: copyContent, icon: Copy, title: 'Sao chép' },
        { command: pasteContent, icon: Clipboard, title: 'Dán' },
        { command: clearFormatting, icon: FileText, title: 'Xóa định dạng' },
      ]
    },
    {
      name: 'history',
      tools: [
        { command: 'undo', icon: Undo, title: 'Hoàn tác (Ctrl+Z)' },
        { command: 'redo', icon: Redo, title: 'Làm lại (Ctrl+Y)' },
      ]
    }
  ];

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-3">
        <div className="flex flex-wrap gap-1 items-center">
          {/* Loading indicator for clipboard paste */}
          {isUploadingPastedImage && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
              <Loader2 className="animate-spin h-4 w-4" />
              Đang upload hình ảnh...
            </div>
          )}
          
          {/* Image selection indicator */}
          {isImageSelected && (
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm">
              <ImageIcon className="h-4 w-4" />
              Hình ảnh đã chọn - Sử dụng Align để căn chỉnh
            </div>
          )}
          {toolbarGroups.map((group, groupIndex) => (
            <React.Fragment key={group.name}>
              {groupIndex > 0 && <div className="w-px bg-gray-300 mx-2" />}
              {group.tools.map((tool, toolIndex) => {
                const isActive = 'active' in tool && tool.active && activeFormats.has(tool.active);
                
                if ('type' in tool && tool.type === 'dropdown') {
                  return (
                    <div key={toolIndex} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          if (tool.title === 'Kiểu chữ') {
                            setShowHeadingDropdown(!showHeadingDropdown);
                          } else if (tool.title === 'Kích thước') {
                            setShowFontSizeDropdown(!showFontSizeDropdown);
                          }
                        }}
                        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 flex items-center"
                        title={tool.title}
                      >
                        <tool.icon className="h-4 w-4" />
                      </button>
                      
                      {/* Dropdown menu */}
                      {((tool.title === 'Kiểu chữ' && showHeadingDropdown) ||
                        (tool.title === 'Kích thước' && showFontSizeDropdown)) && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 min-w-[140px]">
                          {tool.options.map((option, optionIndex) => (
                            <button
                              key={optionIndex}
                              type="button"
                              onClick={() => {
                                if (option.command === 'formatBlock') {
                                  formatBlock(option.value);
                                } else if (option.command === 'fontSize') {
                                  changeFontSize(option.value);
                                }
                              }}
                              className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <button
                    key={toolIndex}
                    type="button"
                    onClick={() => {
                      if ('command' in tool) {
                        if (typeof tool.command === 'string') {
                          const value = 'value' in tool ? tool.value : undefined;
                          executeCommand(tool.command, value);
                        } else {
                          tool.command();
                        }
                      }
                    }}
                    className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                      isActive ? 'bg-purple-100 text-purple-700' : 'text-gray-700'
                    }`}
                    title={tool.title}
                  >
                    <tool.icon className="h-4 w-4" />
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        
        {/* Color picker */}
        {showColorPicker && (
          <div className="mt-3 p-3 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="text-xs text-gray-600 mb-2">Chọn màu chữ</div>
            <div className="grid grid-cols-7 gap-1">
              {colors.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => changeTextColor(color)}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={true}
        className="p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
        style={{ 
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
          overflowY: 'auto',
          lineHeight: '1.6',
          fontSize: '16px'
        }}
        onInput={updateContent}
        onFocus={() => {}}
        onBlur={() => {}}
        suppressContentEditableWarning={true}
      >
        {!content && <span style={{ color: '#9ca3af' }}>{placeholder}</span>}
      </div>

      {/* Custom CSS for editor content */}
      <style jsx>{`
        .rich-text-editor:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        .rich-text-editor h1 {
          font-size: 2.25rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 1rem 0;
        }
        
        .rich-text-editor h2 {
          font-size: 1.875rem;
          font-weight: 600;
          line-height: 1.3;
          margin: 0.875rem 0;
        }
        
        .rich-text-editor h3 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 0.75rem 0;
        }
        
        .rich-text-editor h4 {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.5;
          margin: 0.5rem 0;
        }
        
        .rich-text-editor h5 {
          font-size: 1.125rem;
          font-weight: 600;
          line-height: 1.5;
          margin: 0.5rem 0;
        }
        
        .rich-text-editor h6 {
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.5;
          margin: 0.5rem 0;
        }
        
        .rich-text-editor p {
          margin: 0.5rem 0;
        }
        
        .rich-text-editor ul,
        .rich-text-editor ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        .rich-text-editor li {
          margin: 0.25rem 0;
        }
        
        .rich-text-editor blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .rich-text-editor pre {
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          padding: 1rem;
          margin: 1rem 0;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }
        
        .rich-text-editor code {
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 0.25rem;
          padding: 0.125rem 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }
        
        .rich-text-editor a {
          color: #7c3aed;
          text-decoration: underline;
        }
        
        .rich-text-editor a:hover {
          color: #5b21b6;
        }
        
        .rich-text-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
        }
        
        .rich-text-editor video {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
        }
        
        .rich-text-editor table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        
        .rich-text-editor table th,
        .rich-text-editor table td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          text-align: left;
        }
        
        .rich-text-editor table th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        
        .rich-text-editor hr {
          border: 1px solid #e5e7eb;
          margin: 1.5rem 0;
        }
        
        .rich-text-editor img {
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }
        
        .rich-text-editor img:hover {
          border-color: #a855f7;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2);
        }
        
        .image-resize-container {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        .image-resize-container img {
          pointer-events: none;
        }
        
        .resize-handle {
          transition: all 0.2s ease;
        }
        
        .resize-handle:hover {
          background-color: #7c3aed !important;
          transform: scale(1.2);
        }
        
        .image-edit-button:hover {
          background-color: #7c3aed !important;
          transform: scale(1.1);
        }
      `}</style>

      {/* Statistics and shortcuts */}
      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-sm text-gray-500 flex justify-between items-center">
        <div className="flex space-x-4">
          <span>{editorRef.current?.innerText?.length || 0} ký tự</span>
          <span>{getWordCount()} từ</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-400">
            💡 Paste hình ảnh: Ctrl+V | Click hình để resize & edit | Dùng Align buttons cho căn chỉnh | Shortcuts: Ctrl+B (đậm), Ctrl+I (nghiêng), Ctrl+U (gạch chân), Ctrl+K (liên kết)
          </span>
        </div>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Chèn liên kết</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Văn bản hiển thị
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Nhập văn bản..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLinkDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Hủy
                </button>
                <button
                  onClick={insertLink}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Chèn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Editor Dialog */}
      {showImageEditor && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 image-editor-modal">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Chỉnh sửa hình ảnh</h3>
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="max-w-full max-h-48 mx-auto rounded"
                />
              </div>
              
              {/* Instructions */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Thay đổi kích thước:</strong> Kéo các góc hình ảnh<br/>
                  📏 <strong>Căn chỉnh:</strong> Sử dụng nút Align trên toolbar<br/>
                  🏷️ <strong>Chú thích:</strong> Nhập bên dưới
                </p>
              </div>
              
              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chú thích (Alt text)
                </label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Nhập chú thích cho hình ảnh..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={deleteImage}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowImageEditor(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={updateImageCaption}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Uploader */}
      {showMediaUploader && (
        <MediaUploader
          onClose={() => setShowMediaUploader(false)}
          onSelect={handleMediaSelect}
        />
      )}
    </div>
  );
}