import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import logoSvg from '../../assets/logo_gradient.svg';

export const SKOOLIB_URL = 'https://skoolib.net/li/tvdlcs1/opac-public';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Auto focus input on modal open & clear old query
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onClose();
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-200"
    >
      {/* Top Header: Logo on left, Close button on right */}
      <div className="w-full px-6 sm:px-12 lg:px-16 py-6 sm:py-8 flex items-center justify-between">
        <Link to="/" onClick={onClose} className="inline-block">
          <img
            src={logoSvg}
            alt="Thư viện Dương Liễu"
            className="h-10 sm:h-12 w-auto"
          />
        </Link>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng tìm kiếm"
          className="p-2 text-gray-500 hover:text-dark hover:scale-110 transition-all duration-200 cursor-pointer"
        >
          <X className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.2]" />
        </button>
      </div>

      {/* Main Center Area: Large minimalist input with underline */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-20 pb-24">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl"
        >
          <div className="relative border-b-2 border-[#1B3F8B] pb-3 sm:pb-5 focus-within:border-yellow transition-colors duration-200">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập từ khoá tìm kiếm"
              className="w-full bg-transparent text-3xl sm:text-5xl md:text-6xl font-light text-gray-800 placeholder-gray-400 focus:outline-hidden tracking-tight"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
