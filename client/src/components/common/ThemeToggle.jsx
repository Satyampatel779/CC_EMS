import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export const ThemeToggle = ({ variant = "default", size = "default", showTooltip = true }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const toggleButton = (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className="relative overflow-hidden transition-all duration-300 hover:scale-105"
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div className="relative">
        {/* Sun Icon */}
        <Sun 
          className={`absolute transition-all duration-500 ease-in-out ${
            isDarkMode 
              ? 'rotate-90 scale-0 opacity-0' 
              : 'rotate-0 scale-100 opacity-100'
          }`}
          size={size === "sm" ? 16 : size === "lg" ? 24 : 20}
        />
        
        {/* Moon Icon */}
        <Moon 
          className={`transition-all duration-500 ease-in-out ${
            isDarkMode 
              ? 'rotate-0 scale-100 opacity-100' 
              : '-rotate-90 scale-0 opacity-0'
          }`}
          size={size === "sm" ? 16 : size === "lg" ? 24 : 20}
        />
      </div>
    </Button>
  );

  if (!showTooltip) {
    return toggleButton;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {toggleButton}
        </TooltipTrigger>
        <TooltipContent>
          <p>{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const ThemeToggleWithText = ({ className = "" }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300 ${className}`}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div className="relative">
        <Sun 
          className={`absolute transition-all duration-500 ease-in-out ${
            isDarkMode 
              ? 'rotate-90 scale-0 opacity-0' 
              : 'rotate-0 scale-100 opacity-100'
          }`}
          size={18}
        />
        <Moon 
          className={`transition-all duration-500 ease-in-out ${
            isDarkMode 
              ? 'rotate-0 scale-100 opacity-100' 
              : '-rotate-90 scale-0 opacity-0'
          }`}
          size={18}
        />
      </div>
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
};
