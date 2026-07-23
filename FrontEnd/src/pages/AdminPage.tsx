import React, { useCallback, useEffect, useState } from 'react';
import { adminApi, AdminAccount } from '../api/adminApi';
import { getApiErrorMessage } from '../api/apiError';
import { AccountRole } from '../types/account';
import { PageHeader } from '../components/common/PageHeader';
import { PageState } from '../components/common/PageState';
import { getCityLabel } from '../constants/profileOptions';
import './Page.css';
import './AdminPage.css';

type AdminTab = 'accounts' | 'profiles' | 'cases' | 'favorites';

export const AdminPage: React.FC = () => {
  const [tab, setTab] = useState<AdminTab>('accounts');
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [profiles, setProfiles] = useState<Awaited<ReturnType<typeof adminApi.listProfiles>>>([]);
  const [cases, setCases] = useState<Awaited<ReturnType<typeof adminApi.listMatchCases>>>([]);
  const [favorites, setFavorites] = useState<Awaited<ReturnType<typeof adminApi.listFavorites>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<AccountRole | ''>('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'accounts') {
        setAccounts(
          await adminApi.listAccounts({
            q: query || undefined,
            role: roleFilter || undefined,
            isDeleted: showDeleted ? true : false,
          })
        );
      } else if (tab === 'profiles') {
        setProfiles(await adminApi.listProfiles(showDeleted));
      } else if (tab === 'cases') {
        setCases(await adminApi.listMatchCases());
      } else {
        setFavorites(await adminApi.listFavorites());
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [tab, query, roleFilter, showDeleted]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAccountAction = async (
    accountId: string,
    action: 'block' | 'unblock' | 'soft-delete' | 'restore'
  ) => {
    setBusyId(accountId);
    try {
      if (action === 'block') await adminApi.blockAccount(accountId);
      if (action === 'unblock') await adminApi.unblockAccount(accountId);
      if (action === 'soft-delete') await adminApi.softDeleteAccount(accountId);
      if (action === 'restore') await adminApi.restoreAccount(accountId);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const runProfileAction = async (profileId: string, action: 'soft-delete' | 'restore') => {
    setBusyId(profileId);
    try {
      if (action === 'soft-delete') await adminApi.softDeleteProfile(profileId);
      else await adminApi.restoreProfile(profileId);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page admin-page">
      <PageHeader
        variant="hero"
        title="ניהול מערכת"
        subtitle="חשבונות, פרופילים, תיקים ומועדפים — ללא מחיקה קבועה"
      />

      <div className="admin-page__tabs" role="tablist">
        {(
          [
            ['accounts', 'חשבונות'],
            ['profiles', 'פרופילים'],
            ['cases', 'תיקי שידוך'],
            ['favorites', 'מועדפים'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            className={`admin-page__tab${tab === id ? ' admin-page__tab--active' : ''}`}
            aria-selected={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {(tab === 'accounts' || tab === 'profiles') && (
        <div className="admin-page__filters">
          {tab === 'accounts' && (
            <>
              <input
                className="form-field__input"
                placeholder="חיפוש אימייל / שם / מזהה"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                className="form-field__select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as AccountRole | '')}
              >
                <option value="">כל התפקידים</option>
                <option value="person">משודך/ת</option>
                <option value="shadchan">שדכן/ית</option>
                <option value="admin">מנהל/ת</option>
              </select>
            </>
          )}
          <label className="admin-page__checkbox">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
            />
            הצג מחוקים
          </label>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => void load()}>
            רענון
          </button>
        </div>
      )}

      {error && <PageState error={error} />}

      {loading ? (
        <PageState loading skeletonVariant="list" />
      ) : tab === 'accounts' ? (
        <ul className="admin-page__list">
          {accounts.map((account) => (
            <li key={account.accountId} className="admin-page__card">
              <div>
                <h3>
                  {account.firstName} {account.lastName}
                </h3>
                <p>
                  {account.email} · {account.role}
                  {account.isBlocked ? ' · חסום' : ''}
                  {account.isDeleted ? ' · מחוק' : ''}
                </p>
                {account.associatedProfile && (
                  <p>
                    פרופיל משויך: {account.associatedProfile.firstName}{' '}
                    {account.associatedProfile.lastName} (
                    {getCityLabel(account.associatedProfile.city) || 'ללא עיר'})
                  </p>
                )}
                {!!account.responsibleShadchanim?.length && (
                  <p>
                    שדכנים:{' '}
                    {account.responsibleShadchanim
                      .map((s) => `${s.firstName} ${s.lastName}`.trim() || s.email)
                      .join(', ')}
                  </p>
                )}
              </div>
              <div className="admin-page__actions">
                {!account.isDeleted && (
                  <>
                    {account.isBlocked ? (
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        disabled={busyId === account.accountId}
                        onClick={() => void runAccountAction(account.accountId, 'unblock')}
                      >
                        בטל חסימה
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        disabled={busyId === account.accountId || account.role === 'admin'}
                        onClick={() => void runAccountAction(account.accountId, 'block')}
                      >
                        חסום
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      disabled={busyId === account.accountId || account.role === 'admin'}
                      onClick={() => void runAccountAction(account.accountId, 'soft-delete')}
                    >
                      מחיקה רכה
                    </button>
                  </>
                )}
                {account.isDeleted && (
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    disabled={busyId === account.accountId}
                    onClick={() => void runAccountAction(account.accountId, 'restore')}
                  >
                    שחזור
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : tab === 'profiles' ? (
        <ul className="admin-page__list">
          {profiles.map((profile) => (
            <li key={profile.id} className="admin-page__card">
              <div>
                <h3>
                  {profile.firstName} {profile.lastName}
                </h3>
                <p>
                  {getCityLabel(profile.city) || 'ללא עיר'} · גיל {profile.age}
                  {profile.isDeleted ? ' · מחוק' : ''}
                </p>
              </div>
              <div className="admin-page__actions">
                {profile.isDeleted ? (
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    disabled={busyId === profile.id}
                    onClick={() => void runProfileAction(profile.id, 'restore')}
                  >
                    שחזור
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    disabled={busyId === profile.id}
                    onClick={() => void runProfileAction(profile.id, 'soft-delete')}
                  >
                    מחיקה רכה
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : tab === 'cases' ? (
        <ul className="admin-page__list">
          {cases.map((matchCase) => (
            <li key={matchCase.caseId} className="admin-page__card">
              <div>
                <h3>{matchCase.caseId}</h3>
                <p>
                  {matchCase.stage ?? matchCase.currentStatus} · שדכן{' '}
                  {matchCase.assignedShadchanId}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="admin-page__list">
          {favorites.map((favorite) => (
            <li key={favorite.favoriteId} className="admin-page__card">
              <div>
                <h3>{favorite.favoriteId}</h3>
                <p>פרופיל {favorite.profileId}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
