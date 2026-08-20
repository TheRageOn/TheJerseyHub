"use client";

import React, { createContext, useContext, useSyncExternalStore, useCallback } from "react";

type ThemeMode = "white" | "black";

interface ThemeContextType {
  theme: ThemeMode;
  isWhite: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "tjh_theme";
const THEME_CHANGE_EVENT = "tjh_theme_change";

function getThemeSnapshot(): ThemeMode {
  if (typeof window === "undefined") return "white";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved === "white" || saved === "black") {
      return saved;
    }
  } catch {}
  return "white";
}

function getThemeServerSnapshot(): ThemeMode {
  return "white";
}

function subscribeToTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore is React 18/19 official pattern for external storage without hydration mismatch
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  const setTheme = useCallback((newTheme: ThemeMode) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "white" ? "black" : "white");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isWhite: theme === "white",
        toggleTheme,
        setTheme,
      }}
    >
      <div
        className={theme === "white" ? "theme-white" : "theme-black"}
        suppressHydrationWarning
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
