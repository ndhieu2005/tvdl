'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, LogIn, UserPlus } from 'lucide-react';
import { SITE_CONTENT } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useServerSettings } from '@/contexts/ServerSettingsContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserMenu } from '@/components/auth/UserMenu';
import { MobileUserMenuSimple } from '@/components/MobileUserMenuSimple';
import { Button } from '@/components/ui/button';

// A simple component to handle image fallbacks
const StaticLogo: React.FC<{ siteName: string }> = ({ siteName }) => {
  const [logoSrc, setLogoSrc] = useState('/logo.svg');

  return (
    <img
      src={logoSrc}
      alt={siteName}
      className="h-16 w-auto"
      onError={() => {
        // If /logo.svg fails, try /logo.png as a fallback
        if (logoSrc === '/logo.svg') {
          setLogoSrc('/logo.png');
        }
      }}
    />
  );
};

// SearchBar component
const SearchBar: React.FC = () => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={SITE_CONTENT.search.placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
    </div>
  );
};

const Header: React.FC = () => {
  const { user, loading } = useAuth();
  const { settings, loading: settingsLoading, isHydrated } = useServerSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [logoError, setLogoError] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const openLoginModal = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalTab('register');
    setIsAuthModalOpen(true);
  };
  // Remove excessive logging - only log when needed
  useEffect(() => {
    // Removed console.log to reduce noise
  }, []); // Only run once on mount

  const navigation = [
    { name: SITE_CONTENT.navigation.home, href: '/' },
    { name: SITE_CONTENT.navigation.about, href: '/about' },
    // { name: 'Sách', href: '/books' },
    { name: SITE_CONTENT.navigation.events, href: '/events' },
    { name: SITE_CONTENT.navigation.services, href: '/services' },
    { name: SITE_CONTENT.navigation.news, href: '/news' },
    { name: SITE_CONTENT.navigation.contact, href: '/contact' },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              <img
                src="/logo.png"
                alt={settings?.siteName || 'Thư viện Dương Liễu'}
                className="h-16 w-auto"
                onError={() => {
                  setLogoError(true);
                }}
                onLoad={() => {
                  setLogoError(false);
                }}
              />
              
              {/* Fallback when logo.png fails */}
              {logoError && (
                <StaticLogo siteName={settings?.siteName || 'Thư viện Dương Liễu'} />
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-2 xl:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-gray-700 hover:text-purple-600 px-2 xl:px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out rounded-lg hover:bg-purple-50 hover:shadow-sm hover:scale-105 group whitespace-nowrap"
              >
                {item.name}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-purple-600 transition-all duration-300 ease-in-out group-hover:w-full group-hover:left-0"></span>
              </Link>
            ))}
          </nav>

          {/* Search & Auth & Mobile menu button */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <button
              onClick={toggleSearch}
              className="text-gray-700 hover:text-purple-600 p-2 rounded-md transition-all duration-200 hover:bg-purple-50 hover:scale-110"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Auth buttons or User menu */}
            {!loading && (
              <>
                {user ? (
                  <>
                    {/* Desktop User Menu */}
                    <div className="hidden lg:block">
                      <UserMenu />
                    </div>
                    {/* Mobile User Menu - only show on mobile */}
                    <div className="lg:hidden">
                      <MobileUserMenuSimple />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Desktop Auth Buttons */}
                    <div className="hidden lg:flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={openLoginModal}
                        className="text-gray-700 hover:text-purple-600 transition-all duration-200 hover:scale-105"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Đăng nhập
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openRegisterModal}
                        className="text-purple-600 border-purple-600 hover:bg-purple-50 transition-all duration-200 hover:scale-105 hover:shadow-md"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Đăng ký
                      </Button>
                    </div>
                    {/* Mobile Login Button */}
                    <div className="lg:hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={openLoginModal}
                        className="text-gray-700 hover:text-purple-600 transition-all duration-200"
                      >
                        <LogIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-700 hover:text-purple-600 p-2 rounded-md transition-all duration-200 hover:bg-purple-50"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="py-4 border-t">
            <SearchBar />
          </div>
        )}

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-purple-600 block px-3 py-3 text-base font-medium transition-all duration-200 rounded-lg hover:bg-purple-50 hover:pl-5"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile auth section - only show for non-logged users */}
              {!loading && !user && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openLoginModal}
                    className="w-full text-gray-700 hover:text-purple-600 justify-start"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Đăng nhập
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openRegisterModal}
                    className="w-full text-purple-600 border-purple-600 hover:bg-purple-50 justify-start"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Đăng ký
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </header>
  );
};

export default Header;