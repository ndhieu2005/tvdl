'use client';

import { useEffect } from 'react';
import { isIOSSafari, iosSafariCSS } from '@/lib/ios-safari-fixes';

export default function IOSSafariStyles() {
  useEffect(() => {
    if (isIOSSafari()) {
      // Add iOS Safari specific styles
      const style = document.createElement('style');
      style.innerHTML = `
        ${iosSafariCSS}
        
        /* Additional iOS fixes for admin panels */
        .ios-modal-fix {
          -webkit-overflow-scrolling: touch;
          overflow-scrolling: touch;
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }
        
        .ios-optimized {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          -webkit-transform: translate3d(0, 0, 0);
          transform: translate3d(0, 0, 0);
          image-rendering: auto;
          -webkit-user-select: none;
          user-select: none;
        }
        
        /* Fix upload input on iOS */
        input[type="file"] {
          -webkit-appearance: none;
          appearance: none;
        }
        
        /* Improve modal performance on iOS */
        .modal-container {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        
        /* Fix grid layout issues on iOS */
        .grid {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }
        
        /* Prevent iOS zoom issues */
        @supports (-webkit-touch-callout: none) {
          input[type="text"],
          input[type="email"],
          input[type="password"],
          input[type="search"],
          input[type="url"],
          textarea,
          select {
            font-size: 16px !important;
            -webkit-appearance: none;
            appearance: none;
          }
          
          /* Fix button rendering */
          button {
            -webkit-appearance: none;
            appearance: none;
          }
          
          /* Improve image grid performance */
          .aspect-square img {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            will-change: transform;
          }
        }
      `;
      
      document.head.appendChild(style);
      
      // Add iOS class to body
      document.body.classList.add('ios-safari');
      
      console.log('🍎 iOS Safari styles applied');
      
      return () => {
        style.remove();
        document.body.classList.remove('ios-safari');
      };
    }
  }, []);

  return null;
}