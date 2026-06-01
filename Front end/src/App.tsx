import React, { useCallback, useMemo, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { NavItem } from './components/sidebar/Sidebar';
import { mockProfiles } from './data/mockProfiles';
import { BrowseProfilesPage } from './pages/BrowseProfilesPage';
import { SavedProfilesPage } from './pages/SavedProfilesPage';
import { MyRequestsPage } from './pages/MyRequestsPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  const [activeNav, setActiveNav] = useState<NavItem>('browse');
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    mockProfiles.forEach((p) => {
      if (p.saved) initial.add(p.id);
    });
    return initial;
  });

  const handleToggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const mainContent = useMemo(() => {
    switch (activeNav) {
      case 'browse':
        return (
          <BrowseProfilesPage
            profiles={mockProfiles}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
          />
        );
      case 'saved':
        return (
          <SavedProfilesPage
            profiles={mockProfiles}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
          />
        );
      case 'requests':
        return <MyRequestsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  }, [activeNav, savedIds, handleToggleSave]);

  return (
    <AppLayout activeNav={activeNav} onNavigate={setActiveNav}>
      {mainContent}
    </AppLayout>
  );
}

export default App;
