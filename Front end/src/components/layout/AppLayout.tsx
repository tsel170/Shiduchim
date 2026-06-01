import React, { ReactNode } from 'react';
import { Header } from '../header/Header';
import { Sidebar, NavItem } from '../sidebar/Sidebar';
import './AppLayout.css';

interface AppLayoutProps {
  activeNav: NavItem;
  onNavigate: (item: NavItem) => void;
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeNav,
  onNavigate,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="app-shell">
      <Header onMenuToggle={() => setSidebarOpen((open) => !open)} />
      <div className="app-shell__body">
        <Sidebar
          activeItem={activeNav}
          onNavigate={(item) => {
            onNavigate(item);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <button
          type="button"
          className={`app-shell__overlay${sidebarOpen ? ' app-shell__overlay--visible' : ''}`}
          aria-label="סגור תפריט"
          aria-hidden={!sidebarOpen}
          tabIndex={sidebarOpen ? 0 : -1}
          onClick={() => setSidebarOpen(false)}
        />
        <main className="app-shell__main">{children}</main>
      </div>
    </div>
  );
};
