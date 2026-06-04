'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Tag, ChevronDown } from 'lucide-react';

interface TagInputAdvancedProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

// Danh sách tag phổ biến
const POPULAR_TAGS = [
  'TikTok', 'Trending', 'Viral', 'Challenge', 'Dance', 'Comedy', 'Music', 'Tutorial',
  'Lifestyle', 'Fashion', 'Food', 'Travel', 'Beauty', 'Fitness', 'Gaming', 'Tech',
  'DIY', 'Art', 'Education', 'Entertainment', 'News', 'Sports', 'Animals', 'Kids',
  'Relationship', 'Motivation', 'Business', 'Health', 'Photography', 'Review',
  'Vietnamese', 'English', 'Funny', 'Cute', 'Amazing', 'Epic', 'Cool', 'Hot',
  'New', 'Popular', 'Best', 'Top', 'Latest', 'Awesome', 'Incredible', 'Must-Watch'
];

export default function TagInputAdvanced({ 
  tags = [], 
  onChange, 
  placeholder = "Thêm tag...", 
  className = "" 
}: TagInputAdvancedProps) {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter tags based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = POPULAR_TAGS.filter(tag => 
        tag.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(tag)
      ).slice(0, 10);
      setFilteredTags(filtered);
      setIsDropdownOpen(filtered.length > 0);
    } else {
      // Show popular tags that aren't already selected
      const availableTags = POPULAR_TAGS.filter(tag => !tags.includes(tag)).slice(0, 20);
      setFilteredTags(availableTags);
      setIsDropdownOpen(false);
    }
  }, [inputValue, tags]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
      setInputValue('');
      setSelectedIndex(-1);
      setIsDropdownOpen(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredTags[selectedIndex]) {
        addTag(filteredTags[selectedIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredTags.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setSelectedIndex(-1);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputFocus = () => {
    if (filteredTags.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      inputRef.current?.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-3">
        {/* Input Section */}
        <div className="relative">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                placeholder={placeholder}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={toggleDropdown}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              disabled={!inputValue.trim()}
              className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Thêm</span>
            </button>
          </div>

          {/* Dropdown with suggestions */}
          {isDropdownOpen && filteredTags.length > 0 && (
            <div 
              ref={dropdownRef}
              className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <div className="p-2">
                <div className="text-xs text-gray-500 mb-2 flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  {inputValue ? 'Gợi ý tag' : 'Tag phổ biến'}
                </div>
                {filteredTags.map((tag, index) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors ${
                      index === selectedIndex ? 'bg-purple-100 text-purple-700' : 'text-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Tags */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Đã chọn ({tags.length} tag{tags.length > 1 ? 's' : ''})
              </span>
              {tags.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-xs text-gray-500 hover:text-red-500"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Popular Tags Section (when no input) */}
        {!inputValue && !isDropdownOpen && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center">
                <Tag className="h-3 w-3 mr-1" />
                Tag phổ biến
              </span>
              <button
                type="button"
                onClick={toggleDropdown}
                className="text-xs text-purple-600 hover:text-purple-800"
              >
                Xem tất cả
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.filter(tag => !tags.includes(tag)).slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}