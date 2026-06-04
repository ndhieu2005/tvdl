'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Settings } from 'lucide-react';
import { SITE_CONTENT } from '@/lib/constants';
import { usePublicSettings } from '@/hooks/usePublicSettings';
import { useCookieConsent } from '@/contexts/CookieContext';
import { clearCache, CACHE_KEYS } from '@/lib/cache';
import SafeHydration from './SafeHydration';

const Footer: React.FC = () => {
  const { settings, refetch } = usePublicSettings();
  const { resetConsent } = useCookieConsent();
  
  // Debug log
  console.log("Footer - Current settings:", settings);
  
  // Function to clear cache and refetch settings
  const handleRefreshSettings = () => {
    console.log("🔄 Clearing cache and refreshing settings...");
    clearCache(CACHE_KEYS.PUBLIC_SETTINGS, CACHE_KEYS.PUBLIC_SETTINGS_EXPIRY);
    refetch();
  };
  const quickLinks = [
    { name: SITE_CONTENT.navigation.home, href: '/' },
    { name: SITE_CONTENT.navigation.about, href: '/about' },
    { name: SITE_CONTENT.navigation.services, href: '/services' },
    { name: SITE_CONTENT.navigation.news, href: '/news' },
  ];

  const categories = [
    { name: SITE_CONTENT.navigation.events, href: '/events' },
    { name: SITE_CONTENT.navigation.contact, href: '/contact' },
  ];

  const legal = [
    { name: SITE_CONTENT.navigation.about, href: '/about' },
    { name: SITE_CONTENT.navigation.contact, href: '/contact' },
    { name: SITE_CONTENT.navigation.privacy, href: '/privacy-policy' },
    { name: SITE_CONTENT.navigation.terms, href: '/terms-of-use' },
    { name: 'Cookie Policy', href: '/cookie-policy' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="text-2xl font-bold text-purple-400 mb-4 block">
              {settings?.siteName || 'ViralPeek'}
            </Link>
            <p className="text-gray-300 mb-6">
              {settings?.siteDescription || SITE_CONTENT.footer.description}
            </p>
            {/* Social Media Links */}
            <div className="flex space-x-4">
              {settings?.facebookUrl && (
                <a href={settings.facebookUrl} className="text-gray-400 hover:text-purple-400 transition-colors" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings?.twitterUrl && (
                <a href={settings.twitterUrl} className="text-gray-400 hover:text-purple-400 transition-colors" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a href={settings.instagramUrl} className="text-gray-400 hover:text-purple-400 transition-colors" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.youtubeUrl && (
                <a href={settings.youtubeUrl} className="text-gray-400 hover:text-purple-400 transition-colors" target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{SITE_CONTENT.footer.quickLinks}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2">
              {categories.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{SITE_CONTENT.footer.legal}</h3>
            <ul className="space-y-2">
              {legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright and Cookie Settings */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-center sm:text-left">
              © 2025 {settings?.siteName || 'ViralPeek'}. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleRefreshSettings}
                className="text-gray-400 hover:text-purple-400 text-sm flex items-center transition-colors"
                title="Refresh Settings"
              >
                🔄 Refresh
              </button>
              <button
                onClick={resetConsent}
                className="text-gray-400 hover:text-purple-400 text-sm flex items-center transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                Cookie Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;