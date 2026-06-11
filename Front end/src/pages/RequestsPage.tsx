import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RequestProfilePreview } from '../components/requests/RequestProfilePreview';
import { getProfileById } from '../data/mockProfiles';
import { mockShadchanRequests } from '../data/mockShadchanRequests';
import './AddedProfilesPage.css';
import './Page.css';
import './RequestsPage.css';

export const RequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(() => new Set());

  const items = mockShadchanRequests
    .map((request) => {
      const senderProfile = getProfileById(request.fromPersonId);
      const requestedProfile = getProfileById(request.profileId);
      return senderProfile && requestedProfile
        ? { request, senderProfile, requestedProfile }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const handleSendSenderProfile = useCallback(
    (requestId: string, senderName: string, targetName: string) => {
      window.alert(`פרופיל ${senderName} נשלח ל${targetName} (הדגמה בלבד)`);
      setSentRequestIds((prev) => new Set(prev).add(requestId));
    },
    []
  );

  return (
    <div className="page added-profiles-page requests-page">
      <header className="page__header">
        <h1 className="page__title">בקשות</h1>
        <p className="page__subtitle">{items.length} בקשות ממשודכים</p>
      </header>

      {items.length === 0 ? (
        <div className="profile-grid__empty added-profiles-page__empty">
          <p>אין בקשות פעילות כרגע.</p>
        </div>
      ) : (
        <ul className="added-profiles-list">
          {items.map(({ request, senderProfile, requestedProfile }) => {
            const senderName = `${senderProfile.firstName} ${senderProfile.lastName}`;
            const targetName = `${requestedProfile.firstName} ${requestedProfile.lastName}`;
            const isSent = sentRequestIds.has(request.requestId);

            return (
              <li key={request.requestId} className="added-profiles-card request-card">
                <div className="request-card__content">
                  <p className="request-card__date">{request.sentAt}</p>

                  <div className="request-card__previews">
                    <RequestProfilePreview
                      label="המשודך/ת ששלח/ה"
                      profile={senderProfile}
                      onViewProfile={(id) => navigate(`/profiles/${id}`)}
                    />
                    <RequestProfilePreview
                      label="פרופיל שביקש/ה לבדוק"
                      profile={requestedProfile}
                      onViewProfile={(id) => navigate(`/profiles/${id}`)}
                    />
                  </div>

                  {request.message && <p className="request-card__note">{request.message}</p>}

                  <div className="request-card__actions">
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      disabled={isSent}
                      onClick={() =>
                        handleSendSenderProfile(request.requestId, senderName, targetName)
                      }
                    >
                      {isSent ? 'הפרופיל נשלח' : `שלח את פרופיל ${senderProfile.firstName}`}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
