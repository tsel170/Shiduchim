import React, { ReactNode } from 'react';
import { Header, HeaderPanelMode } from '../header/Header';
import { Sidebar } from '../sidebar/Sidebar';
import './AppLayout.css';

interface AppLayoutProps {
  onBrandClick: () => void;
  onLogout: () => void;
  userLabel?: string;
  headerPanelMode: HeaderPanelMode;
  isHeaderPanelOpen: boolean;
  onHeaderPanelToggle: () => void;
  headerPanelHighlight?: boolean;
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  onBrandClick,
  onLogout,
  userLabel,
  headerPanelMode,
  isHeaderPanelOpen,
  onHeaderPanelToggle,
  headerPanelHighlight = false,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="app-shell">
      <Header
        onMenuToggle={() => setSidebarOpen((open) => !open)}
        onBrandClick={onBrandClick}
        onLogout={onLogout}
        userLabel={userLabel}
        panelMode={headerPanelMode}
        isPanelOpen={isHeaderPanelOpen}
        onPanelToggle={onHeaderPanelToggle}
        panelHighlight={headerPanelHighlight}
      />
      <div className="app-shell__body">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={onLogout}
          userLabel={userLabel}
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
