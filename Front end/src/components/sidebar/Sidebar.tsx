import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AccountRole } from '../../types/account';
import './Sidebar.css';

export type NavItem =
  | 'browse'
  | 'saved'
  | 'suggestions'
  | 'added-profiles'
  | 'add-profile'
  | 'ai-import'
  | 'requests'
  | 'my-profile'
  | 'settings';

interface NavConfig {
  id: NavItem;
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: AccountRole[];
  group: 'main' | 'manage' | 'account';
  highlight?: boolean;
}

const NAV_ITEMS: NavConfig[] = [
  {
    id: 'browse',
    path: '/browse',
    label: 'עיון בפרופילים',
    icon: <GridIcon />,
    roles: ['person', 'shadchan'],
    group: 'main',
  },
  {
    id: 'saved',
    path: '/favorites',
    label: 'מועדפים',
    icon: <HeartIcon />,
    roles: ['person'],
    group: 'main',
  },
  {
    id: 'suggestions',
    path: '/suggestions',
    label: 'הצעות מהשדכן',
    icon: <InboxIcon />,
    roles: ['person'],
    group: 'main',
  },
  {
    id: 'added-profiles',
    path: '/added-profiles',
    label: 'פרופילים באחריותי',
    icon: <FolderIcon />,
    roles: ['shadchan'],
    group: 'manage',
  },
  {
    id: 'ai-import',
    path: '/ai-import',
    label: 'ייבוא AI',
    icon: <SparklesIcon />,
    roles: ['shadchan'],
    group: 'manage',
    highlight: true,
  },
  {
    id: 'add-profile',
    path: '/add-profile',
    label: 'הוספת פרופיל',
    icon: <PlusIcon />,
    roles: ['shadchan'],
    group: 'manage',
  },
  {
    id: 'requests',
    path: '/requests',
    label: 'בקשות',
    icon: <RequestIcon />,
    roles: ['shadchan'],
    group: 'manage',
  },
  {
    id: 'my-profile',
    path: '/my-profile',
    label: 'הפרופיל שלי',
    icon: <UserIcon />,
    roles: ['person'],
    group: 'account',
  },
  {
    id: 'settings',
    path: '/settings',
    label: 'הגדרות',
    icon: <SettingsIcon />,
    roles: ['person', 'shadchan'],
    group: 'account',
  },
];

const GROUP_LABELS: Record<NavConfig['group'], string> = {
  main: 'ראשי',
  manage: 'ניהול',
  account: 'חשבון',
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userLabel?: string;
}

function pathToNavItem(pathname: string): NavItem {
  if (pathname.startsWith('/profiles')) return 'browse';
  if (pathname.startsWith('/favorites')) return 'saved';
  if (pathname.startsWith('/suggestions')) return 'suggestions';
  if (pathname.startsWith('/added-profiles')) return 'added-profiles';
  if (pathname.startsWith('/ai-import')) return 'ai-import';
  if (pathname.startsWith('/add-profile')) return 'add-profile';
  if (pathname.startsWith('/requests')) return 'requests';
  if (pathname.startsWith('/my-profile')) return 'my-profile';
  if (pathname.startsWith('/settings')) return 'settings';
  return 'browse';
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout, userLabel }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeItem = pathToNavItem(location.pathname);

  const items = NAV_ITEMS.filter((item) =>
    currentUser ? item.roles.includes(currentUser.role) : false
  );

  const groups: NavConfig['group'][] = ['main', 'manage', 'account'];

  return (
    <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`} aria-label="ניווט ראשי">
      <div className="sidebar__brand">
        <span className="sidebar__brand-logo" aria-hidden="true">
          ש
        </span>
        <span className="sidebar__brand-text">שידוכים</span>
      </div>

      <nav className="sidebar__nav">
        {groups.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;

          return (
            <div key={group} className="sidebar__group">
              <span className="sidebar__group-label">{GROUP_LABELS[group]}</span>
              <ul className="sidebar__list">
                {groupItems.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`sidebar__link${
                        activeItem === item.id ? ' sidebar__link--active' : ''
                      }${item.highlight ? ' sidebar__link--highlight' : ''}`}
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                      aria-current={activeItem === item.id ? 'page' : undefined}
                    >
                      <span className="sidebar__icon">{item.icon}</span>
                      <span className="sidebar__label">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        {userLabel && <p className="sidebar__user-label">{userLabel}</p>}
        <button
          type="button"
          className="sidebar__logout"
          onClick={() => {
            onClose();
            onLogout();
          }}
        >
          <LogoutIcon />
          <span>התנתקות</span>
        </button>
      </div>
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

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7a2 2 0 012-2h5l2 2h9a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RequestIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 6l-10 7L2 6" strokeLinecap="round" strokeLinejoin="round" />
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

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
