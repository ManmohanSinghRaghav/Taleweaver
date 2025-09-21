import { useState, useRef, useEffect, useCallback } from 'react';

export const useAppState = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('taleweaver-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isMounted = useRef(true);

  // Apply theme to document and save to localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('taleweaver-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode]);

  return {
    isDarkMode,
    isLoading,
    error,
    isSpeaking,
    
    // Setters used by the app
    setIsLoading,
    setError,
    setIsSpeaking,
    toggleTheme,
  };
};
