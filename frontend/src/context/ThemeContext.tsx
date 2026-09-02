import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'purple' | 'emerald' | 'blue' | 'rose' | 'slate';

export interface AccentColorConfig {
  id: AccentColor;
  nameTr: string;
  nameEn: string;
  colorHex: string;
  gradientFrom: string;
  gradientTo: string;
  primaryClass: string;
  bgLightClass: string;
  textClass: string;
  borderClass: string;
  ringClass: string;
}

export const ACCENT_COLORS: AccentColorConfig[] = [
  {
    id: 'purple',
    nameTr: 'Asil Mor',
    nameEn: 'Royal Purple',
    colorHex: '#9333ea',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-indigo-600',
    primaryClass: 'bg-purple-600',
    bgLightClass: 'bg-purple-500/15',
    textClass: 'text-purple-400 dark:text-purple-400 text-purple-600',
    borderClass: 'border-purple-500/30',
    ringClass: 'ring-purple-500'
  },
  {
    id: 'emerald',
    nameTr: 'Zümrüt Yeşil',
    nameEn: 'Emerald Green',
    colorHex: '#10b981',
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-teal-600',
    primaryClass: 'bg-emerald-600',
    bgLightClass: 'bg-emerald-500/15',
    textClass: 'text-emerald-400 dark:text-emerald-400 text-emerald-600',
    borderClass: 'border-emerald-500/30',
    ringClass: 'ring-emerald-500'
  },
  {
    id: 'blue',
    nameTr: 'Okyanus Mavi',
    nameEn: 'Ocean Blue',
    colorHex: '#0284c7',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-cyan-600',
    primaryClass: 'bg-blue-600',
    bgLightClass: 'bg-blue-500/15',
    textClass: 'text-blue-400 dark:text-blue-400 text-blue-600',
    borderClass: 'border-blue-500/30',
    ringClass: 'ring-blue-500'
  },
  {
    id: 'rose',
    nameTr: 'Gün Batımı',
    nameEn: 'Sunset Rose',
    colorHex: '#f43f5e',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-amber-500',
    primaryClass: 'bg-rose-600',
    bgLightClass: 'bg-rose-500/15',
    textClass: 'text-rose-400 dark:text-rose-400 text-rose-600',
    borderClass: 'border-rose-500/30',
    ringClass: 'ring-rose-500'
  },
  {
    id: 'slate',
    nameTr: 'Titanyum Gri',
    nameEn: 'Titanium Slate',
    colorHex: '#64748b',
    gradientFrom: 'from-slate-600',
    gradientTo: 'to-zinc-600',
    primaryClass: 'bg-slate-700',
    bgLightClass: 'bg-slate-500/15',
    textClass: 'text-slate-300 dark:text-slate-300 text-slate-700',
    borderClass: 'border-slate-500/30',
    ringClass: 'ring-slate-500'
  }
];

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  accent: AccentColor;
  setAccent: (color: AccentColor) => void;
  accentConfig: AccentColorConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('myfinans_theme') as ThemeMode) || 'dark';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    return (localStorage.getItem('myfinans_accent_color') as AccentColor) || 'purple';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('myfinans_theme', theme);
    // backward compatibility
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    // Remove previous theme accent classes
    ACCENT_COLORS.forEach(c => root.classList.remove(`theme-${c.id}`));
    root.classList.add(`theme-${accent}`);
    localStorage.setItem('myfinans_accent_color', accent);
  }, [accent]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setAccent = (color: AccentColor) => {
    setAccentState(color);
  };

  const accentConfig = ACCENT_COLORS.find(c => c.id === accent) || ACCENT_COLORS[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        accent,
        setAccent,
        accentConfig
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
