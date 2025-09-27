'use client';

import { Button } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  variant?: 'default' | 'floating';
}

export default function ThemeToggle({ variant = 'default' }: ThemeToggleProps) {
  const { isDarkMode, toggleTheme } = useTheme();

  const baseClasses = "flex items-center transition-all duration-300";
  const variantClasses = {
    default: "",
    floating: "hover:scale-110 hover:shadow-lg"
  };

  return (
    <Button
      type="text"
      size="large"
      icon={
        <span className={`transition-transform duration-500 ${isDarkMode ? 'rotate-180' : 'rotate-0'}`}>
          {isDarkMode ? <SunOutlined /> : <MoonOutlined />}
        </span>
      }
      onClick={toggleTheme}
      className={`${baseClasses} ${variantClasses[variant]}`}
      title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
    />
  );
}