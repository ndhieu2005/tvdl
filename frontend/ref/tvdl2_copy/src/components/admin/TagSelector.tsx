'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { TagData } from '@/lib/tags';

interface TagSelectorProps {
  selectedTags: TagData[];
  onTagsChange: (tags: TagData[]) => void;
  maxTags?: number;
  placeholder?: string;
}

export default function TagSelector({
  selectedTags,
  onTagsChange,
  maxTags = 10,
  placeholder = 'Tìm kiếm và chọn tags...'
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<TagData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchTags(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchTags = async (query: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/tags?search=${encodeURIComponent(query)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Filter out already selected tags
        const availableTags = data.data.filter(
          (tag: TagData) => !selectedTags.some(selected => selected.id === tag.id)
        );
        setSuggestions(availableTags);
      }
    } catch (error) {
      console.error('Error searching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = (tag: TagData) => {
    if (selectedTags.length >= maxTags) return;
    
    const newTags = [...selectedTags, tag];
    onTagsChange(newTags);
    
    // Reset search
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Focus back to input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleTagRemove = (tagId: string) => {
    const newTags = selectedTags.filter(tag => tag.id !== tagId);
    onTagsChange(newTags);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const slug = newTagName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          name: newTagName,
          slug,
          status: 'ACTIVE',
        }),
      });

      const data = await response.json();
      if (data.success) {
        handleTagSelect(data.data);
        setNewTagName('');
        setShowCreateForm(false);
      } else {
        alert(data.error || 'Lỗi khi tạo tag');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Lỗi khi tạo tag');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (suggestions.length > 0) {
        // Select first suggestion
        handleTagSelect(suggestions[0]);
      } else if (searchQuery.trim()) {
        // Show create form
        setNewTagName(searchQuery.trim());
        setShowCreateForm(true);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSearchQuery('');
    } else if (e.key === 'Backspace' && !searchQuery && selectedTags.length > 0) {
      // Remove last tag if input is empty
      handleTagRemove(selectedTags[selectedTags.length - 1].id);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border"
            style={{
              backgroundColor: tag.color ? `${tag.color}20` : '#8B5CF620',
              borderColor: tag.color || '#8B5CF6',
              color: tag.color || '#8B5CF6',
            }}
          >
            {tag.name}
            <button
              onClick={() => handleTagRemove(tag.id)}
              className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setShowSuggestions(true)}
            disabled={selectedTags.length >= maxTags}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder={selectedTags.length >= maxTags ? `Đã chọn tối đa ${maxTags} tags` : placeholder}
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (searchQuery || suggestions.length > 0) && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {loading && (
              <div className="px-4 py-2 text-sm text-gray-500">
                Đang tìm kiếm...
              </div>
            )}
            
            {!loading && suggestions.length === 0 && searchQuery && (
              <div className="px-4 py-2 text-sm text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Không tìm thấy tag nào</span>
                  <button
                    onClick={() => {
                      setNewTagName(searchQuery.trim());
                      setShowCreateForm(true);
                    }}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={14} />
                    Tạo mới
                  </button>
                </div>
              </div>
            )}

            {!loading && suggestions.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagSelect(tag)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                ></div>
                <div>
                  <div className="font-medium">{tag.name}</div>
                  <div className="text-xs text-gray-500">
                    {tag.postCount} bài viết
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tag Count */}
      <div className="mt-2 text-xs text-gray-500">
        {selectedTags.length}/{maxTags} tags đã chọn
      </div>

      {/* Create Tag Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Tạo Tag Mới</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Tag
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên tag..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (tự động tạo)
                </label>
                <input
                  type="text"
                  value={newTagName
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim()}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tạo Tag
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewTagName('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}