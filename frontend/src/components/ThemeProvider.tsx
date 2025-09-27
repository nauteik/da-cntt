"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ConfigProvider, theme } from "antd";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

// This function is no longer needed as we're relying on the class state
// set by the inline script in layout.tsx

// We'll read the dark class directly in the effect

export default function ThemeProvider({ children }: ThemeProviderProps) {
  // IMPORTANT: For SSR, always default to false (light mode)
  // This ensures consistent server rendering
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Helper function to apply theme to document
  const applyTheme = (dark: boolean) => {
    const docEl = document.documentElement;

    // Apply or remove the dark class
    if (dark) {
      docEl.classList.add("dark");
      docEl.style.colorScheme = "dark";

      // Set critical CSS variables directly for immediate effect
      docEl.style.setProperty("--bg-primary", "#0D1117");
      docEl.style.setProperty("--bg-surface", "#161B22");
      docEl.style.setProperty("--text-primary", "#F0F6FC");
      docEl.style.setProperty("--text-secondary", "#C9D1D9");
      docEl.style.setProperty("--border-color", "#30363D");
    } else {
      docEl.classList.remove("dark");
      docEl.style.colorScheme = "light";

      // Reset to light theme variables
      docEl.style.setProperty("--bg-primary", "#FAFAFA");
      docEl.style.setProperty("--bg-surface", "#F0F2F5");
      docEl.style.setProperty("--text-primary", "#222222");
      docEl.style.setProperty("--text-secondary", "#555555");
      docEl.style.setProperty("--border-color", "#E0E0E0");
    }
  };

  // After hydration, we'll get the real theme from the document element and localStorage
  useEffect(() => {
    try {
      // Prioritize localStorage over class state to ensure consistency
      const savedTheme = localStorage.getItem("theme");
      let finalDarkMode: boolean;

      if (savedTheme === "dark") {
        finalDarkMode = true;
      } else if (savedTheme === "light") {
        finalDarkMode = false;
      } else {
        // Fallback to system preference or class state
        finalDarkMode = document.documentElement.classList.contains("dark");
      }

      // Set theme state
      setIsDarkMode(finalDarkMode);

      // Apply theme immediately to avoid flicker
      applyTheme(finalDarkMode);

      // Mark as mounted after theme is applied
      setIsMounted(true);

      // For debugging
      console.log(
        `ThemeProvider hydrated with theme: ${finalDarkMode ? "dark" : "light"}`
      );
    } catch (e) {
      // Error fallback - use class state
      const darkModeFromClass =
        document.documentElement.classList.contains("dark");
      setIsDarkMode(darkModeFromClass);
      setIsMounted(true);
      console.error("Theme hydration error:", e);
    }
  }, []);

  useEffect(() => {
    // Skip applying theme until mounted to avoid hydration mismatch
    if (!isMounted) return;

    // Apply theme only if needed
    const hasClass = document.documentElement.classList.contains("dark");

    if ((isDarkMode && !hasClass) || (!isDarkMode && hasClass)) {
      // Apply theme using our helper function
      applyTheme(isDarkMode);
      console.log(
        `Theme updated after mount: ${isDarkMode ? "dark" : "light"}`
      );
    }
  }, [isDarkMode, isMounted]);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;

    // Update state first to trigger re-render
    setIsDarkMode(newDarkMode);

    // Then update localStorage for persistence
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");

    // Apply theme using our helper function
    applyTheme(newDarkMode);

    // For debugging - may help identify issues
    console.log(`Theme toggled to: ${newDarkMode ? "dark" : "light"}`);
  };

  // Configure Ant Design theme tokens
  const antdTheme = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      // Primary colors
      colorPrimary: isDarkMode ? "#3399FF" : "#0077CC",

      // Background colors
      colorBgBase: isDarkMode ? "#0D1117" : "#FAFAFA",
      colorBgContainer: isDarkMode ? "#1C1F26" : "#F0F2F5",
      colorBgElevated: isDarkMode ? "#1C1F26" : "#FFFFFF",

      // Text colors
      colorText: isDarkMode ? "#F5F5F5" : "#222222",
      colorTextSecondary: isDarkMode ? "#AAAAAA" : "#555555",

      // Border colors
      colorBorder: isDarkMode ? "#2C2F36" : "#E0E0E0",
      colorBorderSecondary: isDarkMode ? "#2C2F36" : "#E0E0E0",

      // Layout colors
      colorBgLayout: isDarkMode ? "#0D1117" : "#FAFAFA",

      // Additional customizations for better integration
      borderRadius: 8,
      boxShadow: isDarkMode
        ? "0 1px 3px rgba(255, 255, 255, 0.1)"
        : "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    components: {
      Layout: {
        headerBg: isDarkMode ? "#1C1F26" : "#FFFFFF",
        siderBg: isDarkMode ? "#1C1F26" : "#001529",
        bodyBg: isDarkMode ? "#0D1117" : "#FAFAFA",
      },
      Menu: {
        darkItemBg: isDarkMode ? "#1C1F26" : "#001529",
        darkItemSelectedBg: isDarkMode ? "#3399FF" : "#1890ff",
        darkItemHoverBg: isDarkMode ? "#2C2F36" : "#111b26",
      },
      Card: {
        colorBgContainer: isDarkMode ? "#1C1F26" : "#FFFFFF",
      },
      Table: {
        colorBgContainer: isDarkMode ? "#1C1F26" : "#FFFFFF",
        headerBg: isDarkMode ? "#2C2F36" : "#F0F2F5",
      },
      Button: {
        primaryShadow: "none",
        defaultShadow: "none",
      },
    },
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
}
