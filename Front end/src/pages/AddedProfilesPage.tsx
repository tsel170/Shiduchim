import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiError';
import { profilesApi } from '../api/profilesApi';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PageState } from '../components/common/PageState';
import { AccountFilterTabs } from '../components/profile/AccountFilterTabs';
import { useAuth } from '../contexts/AuthContext';
import { getCityLabel } from '../constants/profileOptions';
import { FullProfile } from '../types/profile';
import { getProfileDisplayName, getProfileInitial } from '../utils/profileDisplay';
import {
  AccountFilter,
  filterProfilesByAccount,
  getAccountFilterEmptyMessage,
} from '../utils/profileAccount';
import './AddedProfilesPage.css';
import './Page.css';

const CARD_ACCENTS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#db2777', '#ea580c'];

function canShadchanDeleteProfile(profile: FullProfile): boolean {
  return !profile.ownerAccountId;
}

export const AddedProfilesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<FullProfile[]>([]);
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<FullProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(
    null
  );

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'shadchan') return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const loaded = await profilesApi.getAll({
          managedByShadchanId: currentUser!.accountId,
        });
        if (!cancelled) setProfiles(loaded);
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
  }, [currentUser]);

  useEffect(() => {
    if (!toast) return;
    const timerId = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timerId);
  }, [toast]);

  const handleConfirmDelete = useCallback(async () => {
    if (!profileToDelete) return;

    setIsDeleting(true);
    try {
      await profilesApi.remove(profileToDelete.id);
      setProfiles((prev) => prev.filter((item) => item.id !== profileToDelete.id));
      setProfileToDelete(null);
      setToast({ message: 'הפרופיל נמחק בהצלחה', tone: 'success' });
    } catch (err) {
      setToast({ message: getApiErrorMessage(err), tone: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }, [profileToDelete]);

  const filteredProfiles = useMemo(
    () => filterProfilesByAccount(profiles, accountFilter),
    [profiles, accountFilter]
  );

  const emptyMessage = getAccountFilterEmptyMessage(
    accountFilter,
    'אין פרופילים באחריותך כרגע.'
  );

  return (
    <div className="page added-profiles-page">
      <header className="added-profiles-page__hero">
        <div className="added-profiles-page__hero-glow" aria-hidden="true" />
        <h1 className="added-profiles-page__title">פרופילים באחריותי</h1>
        <p className="added-profiles-page__subtitle">
          <span className="added-profiles-page__count">{filteredProfiles.length}</span>
          {accountFilter === 'all'
            ? 'פרופילים באחריותך'
            : `מתוך ${profiles.length} פרופילים באחריותך`}
        </p>
      </header>

      <AccountFilterTabs value={accountFilter} onChange={setAccountFilter} />

      {toast && (
        <div
          className={`added-profiles-page__toast added-profiles-page__toast--${toast.tone}`}
          role="status"
        >
          {toast.tone === 'success' ? <CheckIcon /> : <AlertIcon />}
          <span>{toast.message}</span>
        </div>
      )}

      <PageState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && filteredProfiles.length === 0}
        emptyMessage={emptyMessage}
      >
        <ul className="added-profiles-list">
          {filteredProfiles.map((profile, index) => {
            const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
            const displayName = getProfileDisplayName(profile);

            return (
              <li
                key={profile.id}
                className="added-profiles-card"
                style={{ '--card-accent': accent } as React.CSSProperties}
              >
                <div className="added-profiles-card__badge" aria-hidden="true">
                  {getProfileInitial(profile)}
                </div>

                <div className="added-profiles-card__body">
                  <h3 className="added-profiles-card__name">{displayName}</h3>
                  <p className="added-profiles-card__meta">
                    <span className="added-profiles-card__chip">גיל {profile.age}</span>
                    <span className="added-profiles-card__chip">
                      {getCityLabel(profile.city) || 'ללא עיר'}
                    </span>
                  </p>
                  {profile.ownerAccountId && (
                    <p className="added-profiles-card__note added-profiles-card__note--locked">
                      <LockIcon />
                      פרופיל משויך לחשבון משתמש — לא ניתן למחיקה
                    </p>
                  )}
                </div>

                <div className="added-profiles-card__actions">
                  <button
                    type="button"
                    className="btn btn--sm added-profiles-card__btn added-profiles-card__btn--edit"
                    onClick={() => navigate(`/added-profiles/${profile.id}/edit`)}
                  >
                    ערוך
                  </button>
                  <button
                    type="button"
                    className="btn btn--sm added-profiles-card__btn added-profiles-card__btn--view"
                    onClick={() => navigate(`/profiles/${profile.id}`)}
                  >
                    צפה
                  </button>
                  {canShadchanDeleteProfile(profile) && (
                    <button
                      type="button"
                      className="btn btn--sm added-profiles-card__btn added-profiles-card__btn--delete"
                      onClick={() => setProfileToDelete(profile)}
                      disabled={isDeleting && profileToDelete?.id === profile.id}
                    >
                      מחק
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </PageState>

      <ConfirmDialog
        isOpen={Boolean(profileToDelete)}
        title="מחיקת פרופיל"
        tone="danger"
        cooldownSeconds={3}
        isLoading={isDeleting}
        confirmLabel="מחק לצמיתות"
        cancelLabel="ביטול"
        message={
          profileToDelete ? (
            <>
              האם למחוק את הפרופיל של <strong>{getProfileDisplayName(profileToDelete)}</strong>?
              <br />
              פעולה זו אינה ניתנת לביטול.
            </>
          ) : null
        }
        onCancel={() => {
          if (!isDeleting) setProfileToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round" />
    </svg>
  );
}
