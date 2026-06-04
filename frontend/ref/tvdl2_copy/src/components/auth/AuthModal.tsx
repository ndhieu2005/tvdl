'use client';

import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/useIsMobile';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultTab = 'login' 
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const { isMobile, isHydrated } = useIsMobile();

  const handleSwitchToLogin = () => setActiveTab('login');
  const handleSwitchToRegister = () => setActiveTab('register');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      // Additional mobile-specific fixes
      if (isMobile) {
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`;
      }
    } else {
      document.body.classList.remove('modal-open');
      if (isMobile) {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
      if (isMobile) {
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
      }
    };
  }, [isOpen, isMobile]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      <DialogContent 
        className={
          isMobile 
            ? 'mobile-modal-fullscreen fixed inset-0 z-50 bg-white overflow-y-auto focus:outline-none' 
            : 'fixed left-1/2 top-1/2 z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto focus:outline-none'
        }
        style={isMobile ? {
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          width: '100vw',
          height: '100vh',
          maxWidth: 'none',
          maxHeight: 'none',
          transform: 'none'
        } : undefined}
      >
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">
          {activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký'}
        </DialogTitle>
        
        {isMobile ? (
          <div className="h-full w-full p-4 pt-16 pb-8">
            <div className="h-full overflow-y-auto">
              {activeTab === 'login' ? (
                <LoginForm
                  onSwitchToRegister={handleSwitchToRegister}
                  onClose={onClose}
                />
              ) : (
                <RegisterForm
                  onSwitchToLogin={handleSwitchToLogin}
                  onClose={onClose}
                />
              )}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'login' ? (
              <LoginForm
                onSwitchToRegister={handleSwitchToRegister}
                onClose={onClose}
              />
            ) : (
              <RegisterForm
                onSwitchToLogin={handleSwitchToLogin}
                onClose={onClose}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};