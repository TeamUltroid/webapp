'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, THEMES, getThemeById, applyTheme } from './themes';
import { api } from './api';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from server on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {        const settings = await api.getMiniAppSettings();
        const savedThemeId = settings.theme || 'midnight_pro';
        const theme = getThemeById(savedThemeId);
        setCurrentTheme(theme);
        applyTheme(theme);
      } catch (error) {
        console.error('Failed to load theme:', error);
        // Use default theme
        applyTheme(THEMES[0]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setTheme = async (themeId: string) => {
    try {
      const theme = getThemeById(themeId);
      setCurrentTheme(theme);
      applyTheme(theme);
      
      // Save theme to server
      await api.saveMiniAppSetting('theme', themeId);
    } catch (error) {
      console.error('Failed to save theme:', error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};
