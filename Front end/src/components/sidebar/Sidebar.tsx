import React from 'react';
import './Sidebar.css';

export type NavItem = 'browse' | 'saved' | 'requests' | 'settings';

interface SidebarProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { id: NavItem; label: string; icon: React.ReactNode }[] = [
  { id: 'browse', label: 'עיון בפרופילים', icon: <GridIcon /> },
  { id: 'saved', label: 'פרופילים שמורים', icon: <HeartIcon /> },
  { id: 'requests', label: 'הבקשות שלי', icon: <InboxIcon /> },
  { id: 'settings', label: 'הגדרות', icon: <SettingsIcon /> },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  onNavigate,
  isOpen,
}) => {
  return (
    <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`} aria-label="ניווט ראשי">
      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`sidebar__link${activeItem === item.id ? ' sidebar__link--active' : ''}`}
                onClick={() => onNavigate(item.id)}
                aria-current={activeItem === item.id ? 'page' : undefined}
              >
                <span className="sidebar__icon">{item.icon}</span>
                <span className="sidebar__label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-6l-2 3H10l-2-3H2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
    </svg>
  );
}
