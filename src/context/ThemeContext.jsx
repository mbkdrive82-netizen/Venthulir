'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEME_LIST = [
  { id: 'classic', label: 'Classic Emerald', tamilLabel: 'பாரம்பரிய எமரால்டு', emoji: '🌲', color: '#1B5E2F' },
  { id: 'amazon-warm', label: 'Amazon Golden Harvest', tamilLabel: 'அமேசான் கோல்டன் ஹார்வெஸ்ட்', emoji: '📦', color: '#FF9900' },
  { id: 'flipkart-blue', label: 'Flipkart Modern Azure', tamilLabel: 'பிளிப்கார்ட் மாடர்ன் ப்ளூ', emoji: '⚡', color: '#2874F0' },
  { id: 'earthy-gold', label: 'Organic Earthy Gold', tamilLabel: 'இயற்கை தங்கம்', emoji: '🌾', color: '#D4A373' },
];

const ThemeContext = createContext({
  theme: 'classic',
  setTheme: () => {},
  toggleTheme: () => {},
  cycleTheme: () => {},
  themes: THEME_LIST,
  currentThemeMeta: THEME_LIST[0],
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('classic');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('venthulir_theme');
      const valid = THEME_LIST.some((t) => t.id === savedTheme);
      if (valid) {
        setThemeState(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.body.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', 'classic');
        document.body.setAttribute('data-theme', 'classic');
      }
    } catch (e) {}
    setMounted(true);
  }, []);

  const setTheme = (newTheme) => {
    const valid = THEME_LIST.some((t) => t.id === newTheme) ? newTheme : 'classic';
    setThemeState(valid);
    try {
      localStorage.setItem('venthulir_theme', valid);
    } catch (e) {}
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', valid);
      document.body.setAttribute('data-theme', valid);
    }
  };

  const cycleTheme = () => {
    const currentIndex = THEME_LIST.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % THEME_LIST.length;
    setTheme(THEME_LIST[nextIndex].id);
  };

  const toggleTheme = cycleTheme;

  const currentThemeMeta = THEME_LIST.find((t) => t.id === theme) || THEME_LIST[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        cycleTheme,
        themes: THEME_LIST,
        currentThemeMeta,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

