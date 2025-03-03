'use client';

import { WebAppProvider } from '@vkruglikov/react-telegram-web-app';
import { ReactNode } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

export function TelegramWrapper({ children }: { children: ReactNode }) {
  if (typeof window !== 'undefined' && !window.Telegram?.WebApp) {
    console.warn('Telegram WebApp is not initialized');
    return <div>Loading Telegram Web App...</div>;
  }

  return (
    <WebAppProvider options={{ smoothButtonsTransition: true }}>
      {children}
    </WebAppProvider>
  );
} 