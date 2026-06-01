import React, { useCallback, useMemo, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { NavItem } from './components/sidebar/Sidebar';
import {
  getProfileById,
  mockFullProfiles,
  mockProfileSummaries,
} from './data/mockProfiles';
import { mockMyProfile } from './data/mockMyProfile';
import { FullProfile } from './types/profile';
import { BrowseProfilesPage } from './pages/BrowseProfilesPage';
import { SavedProfilesPage } from './pages/SavedProfilesPage';
import { MyRequestsPage } from './pages/MyRequestsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfileDetailsPage } from './pages/ProfileDetailsPage';
import { MyProfilePage } from './pages/MyProfilePage';

function App() {
  const [activeNav, setActiveNav] = useState<NavItem>('browse');
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [myProfile, setMyProfile] = useState<FullProfile>(mockMyProfile);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    mockFullProfiles.forEach((p) => {
      if (p.saved) initial.add(p.id);
    });
    return initial;
  });

  const profileSummaries = useMemo(
    () =>
      mockProfileSummaries.map((p) => ({
        ...p,
        saved: savedIds.has(p.id),
      })),
    [savedIds]
  );

  const handleNavigate = useCallback((item: NavItem) => {
    setActiveNav(item);
    setViewingProfileId(null);
  }, []);

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

  const handleViewProfile = useCallback((id: string) => {
    setViewingProfileId(id);
  }, []);

  const handleBackFromDetails = useCallback(() => {
    setViewingProfileId(null);
  }, []);

  const mainContent = useMemo(() => {
    if (viewingProfileId) {
      const profile = getProfileById(viewingProfileId);
      if (!profile) {
        return (
          <div className="page">
            <p>הפרופיל לא נמצא.</p>
            <button type="button" className="btn btn--secondary" onClick={handleBackFromDetails}>
              חזרה
            </button>
          </div>
        );
      }
      return (
        <ProfileDetailsPage
          profile={profile}
          isSaved={savedIds.has(profile.id)}
          onBack={handleBackFromDetails}
          onToggleSave={() => handleToggleSave(profile.id)}
        />
      );
    }

    switch (activeNav) {
      case 'browse':
        return (
          <BrowseProfilesPage
            profiles={profileSummaries}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onViewProfile={handleViewProfile}
          />
        );
      case 'saved':
        return (
          <SavedProfilesPage
            profiles={profileSummaries}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onViewProfile={handleViewProfile}
          />
        );
      case 'my-profile':
        return (
          <MyProfilePage
            initialProfile={myProfile}
            onSave={setMyProfile}
          />
        );
      case 'requests':
        return <MyRequestsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  }, [
    activeNav,
    viewingProfileId,
    profileSummaries,
    savedIds,
    myProfile,
    handleToggleSave,
    handleViewProfile,
    handleBackFromDetails,
  ]);

  const sidebarActive: NavItem = viewingProfileId ? 'browse' : activeNav;

  return (
    <AppLayout activeNav={sidebarActive} onNavigate={handleNavigate}>
      {mainContent}
    </AppLayout>
  );
}

export default App;
