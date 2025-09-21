import { useState, useRef, useEffect, useCallback } from 'react';

export const useAppState = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isMounted = useRef(true);

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
