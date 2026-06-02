import React from 'react';
import './Header.css';

export type HeaderPanelMode = 'filters' | 'preferences' | 'favorites-sort' | 'none';

interface HeaderProps {
  onMenuToggle: () => void;
  onBrandClick: () => void;
  panelMode: HeaderPanelMode;
  isPanelOpen: boolean;
  onPanelToggle: () => void;
  panelHighlight?: boolean;
}

const PANEL_CONFIG = {
  filters: {
    label: 'פילטרים',
    context: 'עמוד עיון בפרופילים',
    action: 'סינון רשימת פרופילים',
  },
  preferences: {
    label: 'העדפות תצוגה',
    context: 'דף צפייה בפרופיל',
    action: 'התאמת שדות בפרופיל',
  },
  'favorites-sort': {
    label: 'מיון לפי דירוג',
    context: 'עמוד מועדפים',
    action: 'בחירת קטגוריית דירוג',
  },
} as const;

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  onBrandClick,
  panelMode,
  isPanelOpen,
  onPanelToggle,
  panelHighlight = false,
}) => {
  const config = panelMode !== 'none' ? PANEL_CONFIG[panelMode] : null;

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
        <button type="button" className="header__brand" onClick={onBrandClick}>
          <span className="header__logo" aria-hidden="true">
            ש
          </span>
          <span className="header__brand-text">שידוכים</span>
        </button>
      </div>

      <div className="header__center">
        {config ? (
          <button
            type="button"
            className={`header__panel-btn header__panel-btn--${panelMode}${
              isPanelOpen ? ' header__panel-btn--open' : ''
            }${panelHighlight ? ' header__panel-btn--highlight' : ''}`}
            onClick={onPanelToggle}
            aria-expanded={isPanelOpen}
            aria-label={`${config.label} · ${config.context}`}
          >
            <span className={`header__panel-icon header__panel-icon--${panelMode}`} aria-hidden="true">
              {panelMode === 'filters' && <FilterIcon />}
              {panelMode === 'preferences' && <DisplayPrefsIcon />}
              {panelMode === 'favorites-sort' && <SortIcon />}
            </span>
            <span className="header__panel-btn-copy">
              <span className="header__panel-btn-context">{config.context}</span>
              <span className="header__panel-btn-row">
                <span className="header__panel-btn-text">{config.label}</span>
                <span className="header__panel-btn-chevron">{isPanelOpen ? '▲' : '▼'}</span>
              </span>
              <span className="header__panel-btn-action">{config.action}</span>
            </span>
            {panelHighlight && (
              <span className="header__panel-badge" aria-label="הגדרות מותאמות פעילות">
                פעיל
              </span>
            )}
          </button>
        ) : null}
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

function FilterIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
      <path d="M4 5h16M7 12h10M10 19h4" strokeLinecap="round" />
    </svg>
  );
}

function DisplayPrefsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 10h8M8 14h5" strokeLinecap="round" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
      <path d="M8 4v16M16 6v12M12 9v10" strokeLinecap="round" />
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
