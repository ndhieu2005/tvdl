'use client';

import React, { useEffect, useState } from 'react';

interface MobileImageFixProps {
  children: React.ReactNode;
}

const MobileImageFix: React.FC<MobileImageFixProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      // Force image reflow on mobile
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.complete) {
          img.style.display = 'none';
          img.offsetHeight; // Trigger reflow
          img.style.display = '';
        }
      });
    }
  }, [isMobile]);

  return (
    <div className={`mobile-image-fix ${isMobile ? 'is-mobile' : ''}`}>
      {children}
    </div>
  );
};

export default MobileImageFix;