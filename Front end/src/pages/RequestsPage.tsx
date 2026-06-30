import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiError';
import { ApiRequest, requestsApi } from '../api/requestsApi';
import { suggestionsApi, ApiSuggestion } from '../api/suggestionsApi';
import { RequestProfilePreview } from '../components/requests/RequestProfilePreview';
import { PageState } from '../components/common/PageState';
import { getPersonSuggestionResponseLabel } from '../constants/suggestionOptions';
import './AddedProfilesPage.css';
import './Page.css';
import './RequestsPage.css';

export const RequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ApiRequest[]>([]);
  const [responses, setResponses] = useState<ApiSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(() => new Set());
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [requests, personResponses] = await Promise.all([
          requestsApi.list(),
          suggestionsApi.listShadchanResponses(),
        ]);
        if (!cancelled) {
          setItems(requests);
          setResponses(personResponses);
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSendSenderProfile = useCallback(async (request: ApiRequest) => {
    const ownerAccountId = request.senderProfile?.ownerAccountId;
    if (!ownerAccountId || !request.senderProfile) {
      setActionError('לא נמצא חשבון למשודך/ת ששלח/ה את הבקשה');
      return;
    }

    setActionError(null);
    try {
      await suggestionsApi.create({
        ownerAccountId,
        profileId: request.targetProfileId,
        shadchanNote:
          request.notes ??
          `המלצה עבור ${request.senderProfile.firstName} ${request.senderProfile.lastName}`,
      });
      setSentRequestIds((prev) => new Set(prev).add(request.requestId));
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  }, []);

  return (
    <div className="page added-profiles-page requests-page">
      <header className="page__header">
        <h1 className="page__title">בקשות</h1>
        <p className="page__subtitle">
          {responses.length} עדכוני עניין · {items.length} בקשות ממשודכים
        </p>
      </header>

      {!loading && !error && responses.length > 0 && (
        <section className="requests-page__section">
          <h2 className="requests-page__section-title">עדכונים מהמשודכים/ות</h2>
          <ul className="added-profiles-list">
            {responses.map((item) => {
              const profileName = item.profile
                ? `${item.profile.firstName} ${item.profile.lastName}`.trim()
                : 'פרופיל';
              const responseLabel = item.personResponse
                ? getPersonSuggestionResponseLabel(item.personResponse)
                : '';

              return (
                <li key={item.suggestionId} className="added-profiles-card request-card">
                  <div className="request-card__content">
                    <p className="request-card__date">
                      {item.personRespondedAt
                        ? new Date(item.personRespondedAt).toLocaleDateString('he-IL')
                        : ''}
                    </p>
                    <p className="request-card__note">
                      <strong>{item.ownerName ?? 'משודך/ת'}</strong> — {responseLabel} בפרופיל{' '}
                      <strong>{profileName}</strong>
                    </p>
                    <div className="request-card__actions">
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => navigate(`/profiles/${item.profileId}`)}
                      >
                        צפה בפרופיל
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <PageState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && items.length === 0 && responses.length === 0}
        emptyMessage="אין בקשות או עדכונים פעילים כרגע."
      >
        {actionError && <p className="request-card__note request-card__note--error">{actionError}</p>}
        <ul className="added-profiles-list">
          {items.map((request) => {
            const senderProfile = request.senderProfile;
            const requestedProfile = request.targetProfile;
            const isSent = sentRequestIds.has(request.requestId);

            return (
              <li key={request.requestId} className="added-profiles-card request-card">
                <div className="request-card__content">
                  <p className="request-card__date">
                    {new Date(request.createdAt).toLocaleDateString('he-IL')}
                  </p>

                  <div className="request-card__previews">
                    {senderProfile ? (
                      <RequestProfilePreview
                        label="המשודך/ת ששלח/ה"
                        profile={senderProfile}
                        onViewProfile={(id) => navigate(`/profiles/${id}`)}
                      />
                    ) : (
                      <p className="request-card__note">בקשה ללא פרופיל משודך/ת מצורף</p>
                    )}
                    <RequestProfilePreview
                      label="פרופיל שביקש/ה לבדוק"
                      profile={requestedProfile}
                      onViewProfile={(id) => navigate(`/profiles/${id}`)}
                    />
                  </div>

                  {request.notes && <p className="request-card__note">{request.notes}</p>}

                  <div className="request-card__actions">
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      disabled={isSent || !senderProfile}
                      onClick={() => senderProfile && handleSendSenderProfile(request)}
                    >
                      {isSent
                        ? 'הפרופיל נשלח'
                        : senderProfile
                          ? `שלח את פרופיל ${senderProfile.firstName}`
                          : 'אין פרופיל משודך/ת'}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </PageState>
    </div>
  );
};
