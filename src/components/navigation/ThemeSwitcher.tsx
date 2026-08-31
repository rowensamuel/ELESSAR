import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Check, ChevronDown } from 'lucide-react';
import { useTheme, THEME_CONFIGS, ThemeMode } from '../../context/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const themesList: ThemeMode[] = ['arctic', 'midnight'];
  const currentConfig = THEME_CONFIGS[theme];
  const isArctic = theme === 'arctic';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Minimalist Theme Trigger Button */}
      <button
        id="theme-switcher-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select visual theme"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--text-primary)] shadow-xs transition-colors duration-150 cursor-pointer group"
      >
        {/* Simple Sun/Moon theme icon with 1.75 stroke */}
        {isArctic ? (
          <Sun className="w-3.5 h-3.5 text-[var(--accent)] stroke-[1.75]" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-[var(--accent)] stroke-[1.75]" />
        )}

        <span className="text-xs font-sans font-semibold tracking-wider uppercase text-[var(--text-primary)]">
          {currentConfig.shortName}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--text-secondary)] stroke-[1.75] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Theme Selection Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="theme-switcher-btn"
          className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] p-1.5 z-50 animate-fade-in"
        >
          <div className="px-2.5 py-1.5 border-b border-[var(--border-subtle)] mb-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Theme Appearance
            </span>
          </div>

          <div className="space-y-0.5">
            {themesList.map((tId) => {
              const conf = THEME_CONFIGS[tId];
              const isSelected = theme === tId;

              return (
                <button
                  key={tId}
                  id={`theme-option-${tId}`}
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setTheme(tId);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent-subtle)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]'
                      : 'hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {tId === 'arctic' ? (
                      <Sun className="w-3.5 h-3.5 text-[var(--accent)] stroke-[1.75]" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-[var(--accent)] stroke-[1.75]" />
                    )}
                    <div>
                      <span className="font-medium text-[var(--text-primary)] block">
                        {conf.name}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] block">
                        {conf.tagline}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[var(--accent)] stroke-[2]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
