import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAuthProfilesByIds } from '../data/mockAuthProfiles';
import { getCityLabel } from '../constants/profileOptions';
import './AddedProfilesPage.css';
import './Page.css';

export const AddedProfilesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const managedIds = currentUser?.role === 'shadchan' ? currentUser.managedProfileIds ?? [] : [];
  const profiles = getAuthProfilesByIds(managedIds);

  return (
    <div className="page added-profiles-page">
      <header className="page__header">
        <h1 className="page__title">פרופילים שהוספתי</h1>
        <p className="page__subtitle">{profiles.length} פרופילים בניהולך</p>
      </header>

      {profiles.length === 0 ? (
        <div className="profile-grid__empty added-profiles-page__empty">
          <p>אין פרופילים בניהול. הוסף פרופילים דרך המערכת (בקרוב).</p>
        </div>
      ) : (
        <ul className="added-profiles-list">
          {profiles.map((profile) => (
            <li key={profile.profileId} className="added-profiles-card">
              <div>
                <h3 className="added-profiles-card__name">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="added-profiles-card__meta">
                  גיל {profile.age}
                  <span className="added-profiles-card__dot" aria-hidden="true">
                    ·
                  </span>
                  {getCityLabel(profile.city)}
                </p>
              </div>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => navigate(`/profiles/${profile.profileId}`)}
              >
                צפה בפרופיל
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
