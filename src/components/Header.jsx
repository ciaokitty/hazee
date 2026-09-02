import React from 'react';
import { CreditCard, Sun, Moon } from 'lucide-react';

export default function Header({ theme, toggleTheme }) {
  return (
    <header className="app-header">
      <div className="brand-logo">
        <CreditCard size={22} aria-hidden="true" />
        <span>Mind Your Biz</span>
      </div>

      <button
        type="button"
        className="btn-secondary theme-toggle"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        aria-label="Toggle color theme"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  );
}
