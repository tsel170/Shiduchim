import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiError';
import { ApiRequest, requestsApi } from '../api/requestsApi';
import { matchCasesApi } from '../api/matchCasesApi';
import { suggestionsApi, ApiSuggestion } from '../api/suggestionsApi';
import { RequestProfilePreview } from '../components/requests/RequestProfilePreview';
import { PageState } from '../components/common/PageState';
import { SendButton } from '../components/common/SendButton';
import { getPersonSuggestionResponseLabel } from '../constants/suggestionOptions';
import { useAuth } from '../contexts/AuthContext';
import { getProfileDisplayName } from '../utils/profileDisplay';
import './AddedProfilesPage.css';
import './Page.css';
import './RequestsPage.css';

export const RequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
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
    const senderProfile = request.senderProfile;
    const senderProfileId = request.senderProfileId ?? senderProfile?.id;
    const recipientAccountId = request.targetOwnerAccountId;

    if (!senderProfile || !senderProfileId) {
      setActionError('לא נמצא פרופיל של המשודך/ת ששלח/ה את הבקשה');
      return;
    }

    if (!recipientAccountId) {
      setActionError('למשודך/ת שביקש/ה לבדוק את הפרופיל אין חשבון באפליקציה');
      return;
    }

    if (!currentUser?.accountId) {
      setActionError('יש להתחבר מחדש');
      return;
    }

    setActionError(null);
    try {
      const senderName = getProfileDisplayName(senderProfile);
      const targetName = getProfileDisplayName(request.targetProfile);
      await matchCasesApi.create({
        senderProfileId,
        targetProfileId: request.targetProfileId,
        assignedShadchanId: currentUser.accountId,
        note:
          request.notes ??
          `המלצה עבור ${targetName}: ${senderName} ביקש/ה לשמוע על הפרופיל שלך`,
      });
      setSentRequestIds((prev) => new Set(prev).add(request.requestId));
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  }, [currentUser?.accountId]);

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
            const canSendToTarget = Boolean(
              senderProfile && request.senderProfileId && request.targetOwnerAccountId
            );

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
                    <SendButton
                      variant="site"
                      size="sm"
                      sent={isSent}
                      disabled={isSent || !canSendToTarget}
                      onClick={() => canSendToTarget && handleSendSenderProfile(request)}
                    >
                      {isSent
                        ? 'הפרופיל נשלח'
                        : !senderProfile || !request.senderProfileId
                          ? 'אין פרופיל משודך/ת'
                          : !request.targetOwnerAccountId
                            ? 'למשודך/ת המבוקש/ת אין חשבון'
                            : `שלח את פרופיל ${getProfileDisplayName(senderProfile)}`}
                    </SendButton>
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
