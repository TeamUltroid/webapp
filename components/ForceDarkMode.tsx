'use client';

import { useEffect } from 'react';

export function ForceDarkMode() {
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');
    
    // Apply dark styles directly
    const style = document.createElement('style');
    style.textContent = `
      html, body {
        background-color: #0a0a1a !important;
        color: #e2e8f0 !important;
      }
      body {
        background: radial-gradient(circle at 10% 20%, #0a0a1a 0%, #141428 90%) !important;
        background-attachment: fixed !important;
      }
      
      /* Add subtle animated particles */
      body::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: radial-gradient(#8b5cf6 1px, transparent 1px);
        background-size: 50px 50px;
        opacity: 0.1;
        z-index: -1;
        animation: particles 20s linear infinite;
      }
      
      @keyframes particles {
        0% {
          background-position: 0 0;
        }
        100% {
          background-position: 50px 50px;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Add class to body for additional styling
    document.body.classList.add('cyberpunk-theme');
    
    // Add telegram-app class to the main container for special effects
    setTimeout(() => {
      const mainContainer = document.querySelector('main') || document.body;
      mainContainer.classList.add('telegram-app');
    }, 500);
  }, []);
  
  return null;
} 