import React from 'react';
import './Header.css';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="header">
      <div className="header__start">
        <button
          type="button"
          className="header__menu-btn"
          aria-label="פתח תפריט"
          onClick={onMenuToggle}
        >
          <MenuIcon />
        </button>
        <a href="/" className="header__brand" onClick={(e) => e.preventDefault()}>
          <span className="header__logo" aria-hidden="true">
            ש
          </span>
          <span className="header__brand-text">שידוכים</span>
        </a>
      </div>

      <div className="header__search">
        <SearchIcon />
        <input
          type="search"
          className="header__search-input"
          placeholder="חיפוש לפי שם, עיר או גיל..."
          aria-label="חיפוש פרופילים"
        />
      </div>

      <div className="header__actions">
        <button type="button" className="header__icon-btn" aria-label="התראות">
          <BellIcon />
          <span className="header__badge" aria-hidden="true" />
        </button>
        <button type="button" className="header__profile" aria-label="פרופיל משתמש">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop"
            alt=""
            className="header__avatar"
          />
          <span className="header__profile-name">יוסי כהן</span>
        </button>
      </div>
    </header>
  );
};

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" />
    </svg>
  );
}
