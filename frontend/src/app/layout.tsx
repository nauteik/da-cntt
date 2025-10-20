import type { Metadata } from "next";
import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App } from "antd";
import ThemeProvider from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import "@/styles/globals.css";
import "@/styles/antd-overrides.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BAC - Blue Angels Care",
  description: "Management system for Blue Angels Care",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical CSS to prevent flash of unstyled content */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html:not(.dark) {
                --bg-primary: #FAFAFA;
                --bg-surface: #F0F2F5;
                --text-primary: #222222;
                --text-secondary: #555555;
                --border-color: #E0E0E0;
              }
              html.dark {
                --bg-primary: #0D1117;
                --bg-surface: #161B22;
                --text-primary: #F0F6FC;
                --text-secondary: #C9D1D9;
                --border-color: #30363D;
              }
              body {
                background-color: var(--bg-primary);
                color: var(--text-primary);
                transition: background-color 0.3s ease, color 0.3s ease;
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // IMPORTANT: This script runs BEFORE any React hydration
                  // Its job is to set the correct theme class as early as possible
                  // to avoid any "flash" of wrong theme
                  
                  // Check local storage first
                  var theme = localStorage.getItem('theme');
                  var isDark;
                  
                  // Determine theme
                  if (theme === 'dark') {
                    isDark = true;
                  } else if (theme === 'light') {
                    isDark = false;
                  } else {
                    // If no explicit preference, check system preference
                    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }
                  
                  // Apply theme to document
                  var docEl = document.documentElement;
                  
                  // Always start by removing the class to ensure clean state
                  docEl.classList.remove('dark');
                  
                  if (isDark) {
                    // Apply dark mode
                    docEl.classList.add('dark');
                    docEl.style.colorScheme = 'dark';
                  } else {
                    // Apply light mode
                    docEl.style.colorScheme = 'light';
                  }
                  
                  // Set CSS variable for proper initial colors before CSS loads
                  if (isDark) {
                    docEl.style.setProperty('--bg-primary', '#0D1117');
                    docEl.style.setProperty('--bg-surface', '#161B22');
                    docEl.style.setProperty('--text-primary', '#F0F6FC');
                    docEl.style.setProperty('--text-secondary', '#C9D1D9');
                    docEl.style.setProperty('--border-color', '#30363D');
                  } else {
                    docEl.style.setProperty('--bg-primary', '#FAFAFA');
                    docEl.style.setProperty('--bg-surface', '#F0F2F5');
                    docEl.style.setProperty('--text-primary', '#222222');
                    docEl.style.setProperty('--text-secondary', '#555555');
                    docEl.style.setProperty('--border-color', '#E0E0E0');
                  }
                  
                  // Make the initial theme available globally for debugging
                  window.__theme = isDark ? 'dark' : 'light';
                } catch (e) {
                  console.error('Theme initialization failed:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AntdRegistry>
          <ReactQueryProvider>
            <ThemeProvider>
              <AuthProvider>
                <App>{children}</App>
              </AuthProvider>
            </ThemeProvider>
          </ReactQueryProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
