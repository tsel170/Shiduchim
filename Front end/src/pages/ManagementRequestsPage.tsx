import React, { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/apiError';
import { managementRequestsApi } from '../api/managementRequestsApi';
import { PageState } from '../components/common/PageState';
import { ManagementRequestList } from '../components/suggestions/ManagementRequestList';
import { getManagementRequestsSubtitle } from '../constants/suggestionOptions';
import { getUserDisplayLabel } from '../utils/accountName';
import { useAuth } from '../contexts/AuthContext';
import { ManagementRequest } from '../types/managementRequest';
import './Page.css';
import './ShadchanSuggestionsPage.css';

export const ManagementRequestsPage: React.FC = () => {
  const { refreshCurrentUser, currentUser } = useAuth();
  const [requests, setRequests] = useState<ManagementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pending = await managementRequestsApi.list('pending');
      setRequests(pending);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRespond = useCallback(
    async (requestId: string, response: 'approved' | 'declined') => {
      setRespondingId(requestId);
      setActionMessage(null);
      try {
        await managementRequestsApi.respond(requestId, response);
        setRequests((prev) => prev.filter((request) => request.requestId !== requestId));
        if (response === 'approved') {
          await refreshCurrentUser();
        }
        setActionMessage(
          response === 'approved'
            ? 'אישרת את בקשת הניהול — השדכן/ית נוסף/ה לרשימת השדכנים שלך'
            : 'דחית את בקשת הניהול'
        );
      } catch (err) {
        setActionMessage(getApiErrorMessage(err));
      } finally {
        setRespondingId(null);
      }
    },
    [refreshCurrentUser]
  );

  return (
    <div className="page added-profiles-page shadchan-suggestions-page">
      <header className="suggestions-page-hero suggestions-page-hero--management">
        <div className="suggestions-page-hero__glow" aria-hidden="true" />
        <div className="suggestions-page-hero__icon" aria-hidden="true">
          <HandshakeIcon />
        </div>
        <h1 className="suggestions-page-hero__title">בקשות ניהול</h1>
        <p className="suggestions-page-hero__subtitle">
          {loading ? 'טוען...' : getManagementRequestsSubtitle(requests.length)}
        </p>
      </header>

      {actionMessage && (
        <div className="shadchan-suggestions-page__toast" role="status">
          {actionMessage}
        </div>
      )}

      <PageState loading={loading} error={error} isEmpty={!loading && !error && requests.length === 0}>
        <ManagementRequestList
          requests={requests}
          respondingId={respondingId}
          onRespond={handleRespond}
        />
        {!loading && requests.length === 0 && (
          <p className="page__subtitle">
            בקשות מגיעות לחשבון המחובר ({currentUser ? getUserDisplayLabel(currentUser) : 'לא ידוע'}).
          </p>
        )}
      </PageState>
    </div>
  );
};

function HandshakeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
