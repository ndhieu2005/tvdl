'use client';

import React, { useState, KeyboardEvent } from 'react';
import { X, Tag } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const suggestedTags = [
  'viral', 'trending', 'dance', 'comedy', 'food', 'fashion', 'beauty', 
  'education', 'tutorial', 'meme', 'challenge', 'music', 'art', 'fitness',
  'travel', 'lifestyle', 'technology', 'pets', 'gaming', 'sports'
];

export default function TagInput({ 
  tags, 
  onChange, 
  placeholder = "Nhập thẻ và nhấn Enter...",
  maxTags = 10 
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    if (value.trim()) {
      const filtered = suggestedTags.filter(tag => 
        tag.toLowerCase().includes(value.toLowerCase()) && 
        !tags.includes(tag)
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onChange([...tags, trimmedTag]);
      setInputValue('');
      setSuggestions([]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
  };

  return (
    <div className="space-y-3">
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 hover:text-purple-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length >= maxTags ? `Tối đa ${maxTags} thẻ` : placeholder}
          disabled={tags.length >= maxTags}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
              >
                <Tag className="h-3 w-3 inline mr-2 text-gray-400" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular Tags */}
      <div>
        <p className="text-sm text-gray-600 mb-2">Thẻ phổ biến:</p>
        <div className="flex flex-wrap gap-1">
          {suggestedTags
            .filter(tag => !tags.includes(tag))
            .slice(0, 10)
            .map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                disabled={tags.length >= maxTags}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {tag}
              </button>
            ))}
        </div>
      </div>

      {/* Counter */}
      <p className="text-xs text-gray-500">
        {tags.length}/{maxTags} thẻ
      </p>
    </div>
  );
}