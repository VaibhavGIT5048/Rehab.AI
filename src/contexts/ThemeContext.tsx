import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('light');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(true);

  // Get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Calculate actual theme based on preference
  const calculateActualTheme = (themePreference: Theme): 'light' | 'dark' => {
    if (themePreference === 'auto') {
      return getSystemTheme();
    }
    return themePreference;
  };

  // Apply theme to document
  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    const body = document.body;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    setActualTheme(newTheme);
  };

  // Load theme from localStorage or database
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // First check localStorage for immediate theme application
        const localTheme = localStorage.getItem('theme') as Theme;
        if (localTheme && ['light', 'dark', 'auto'].includes(localTheme)) {
          setThemeState(localTheme);
          const calculatedTheme = calculateActualTheme(localTheme);
          applyTheme(calculatedTheme);
        } else {
          // Default to light theme if no preference found
          const defaultTheme = 'light';
          setThemeState(defaultTheme);
          applyTheme(defaultTheme);
          localStorage.setItem('theme', defaultTheme);
        }

        // Then load from database if user is logged in
        if (user) {
          const { data, error } = await supabase
            .from('user_settings')
            .select('theme')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!error && data?.theme && ['light', 'dark', 'auto'].includes(data.theme)) {
            const dbTheme = data.theme as Theme;
            setThemeState(dbTheme);
            const calculatedTheme = calculateActualTheme(dbTheme);
            applyTheme(calculatedTheme);
            localStorage.setItem('theme', dbTheme);
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        // Fallback to light theme
        setThemeState('light');
        applyTheme('light');
        localStorage.setItem('theme', 'light');
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, [user]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const systemTheme = getSystemTheme();
        applyTheme(systemTheme);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    if (!['light', 'dark', 'auto'].includes(newTheme)) {
      console.warn('Invalid theme value:', newTheme);
      return;
    }

    setThemeState(newTheme);
    const newActualTheme = calculateActualTheme(newTheme);
    applyTheme(newActualTheme);

    // Save to localStorage immediately
    localStorage.setItem('theme', newTheme);

    // Save to database if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            theme: newTheme
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.warn('Failed to save theme to database:', error);
        }
      } catch (error) {
        console.error('Error saving theme to database:', error);
      }
    }
  };

  const value = {
    theme,
    actualTheme,
    setTheme,
    loading
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};