import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockShadchanRequests } from '../data/mockShadchanRequests';
import './AddedProfilesPage.css';
import './Page.css';

export const RequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const requests = mockShadchanRequests;

  return (
    <div className="page added-profiles-page">
      <header className="page__header">
        <h1 className="page__title">בקשות</h1>
        <p className="page__subtitle">{requests.length} בקשות ממשודכים</p>
      </header>

      {requests.length === 0 ? (
        <div className="profile-grid__empty added-profiles-page__empty">
          <p>אין בקשות פעילות כרגע.</p>
        </div>
      ) : (
        <ul className="added-profiles-list">
          {requests.map((request) => (
            <li key={request.requestId} className="added-profiles-card">
              <div>
                <h3 className="added-profiles-card__name">{request.profileName}</h3>
                <p className="added-profiles-card__meta">
                  מ: {request.fromPersonName}
                  <span className="added-profiles-card__dot" aria-hidden="true">
                    ·
                  </span>
                  {request.sentAt}
                </p>
                {request.message && (
                  <p className="added-profiles-card__note">{request.message}</p>
                )}
              </div>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => navigate(`/profiles/${request.profileId}`)}
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
