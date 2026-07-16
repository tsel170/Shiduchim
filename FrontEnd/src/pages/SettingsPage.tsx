import React, { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../api/apiError';
import { authApi } from '../api/authApi';
import { PageState } from '../components/common/PageState';
import { AddShadchanDialog } from '../components/settings/AddShadchanDialog';
import { useAuth } from '../contexts/AuthContext';
import { ShadchanSummary } from '../types/account';
import {
  formatAccountName,
  getShadchanContactMeta,
  getShadchanDisplayName,
  getShadchanInitial,
} from '../utils/accountName';
import './Page.css';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const { currentUser, refreshCurrentUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [availableShadchanim, setAvailableShadchanim] = useState<ShadchanSummary[]>([]);
  const [linkedShadchanim, setLinkedShadchanim] = useState<ShadchanSummary[]>([]);
  const [loadingShadchanim, setLoadingShadchanim] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [addingShadchanId, setAddingShadchanId] = useState<string | null>(null);
  const [removingShadchanId, setRemovingShadchanId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(
    null
  );

  const isPerson = currentUser?.role === 'person';
  const isShadchan = currentUser?.role === 'shadchan';
  const linkedIds = currentUser?.linkedShadchanIds ?? [];

  useEffect(() => {
    if (!currentUser) return;
    setFirstName(currentUser.firstName ?? '');
    setLastName(currentUser.lastName ?? '');
    setEmail(currentUser.email);
    setPhone(currentUser.phone ?? '');
  }, [
    currentUser?.accountId,
    currentUser?.firstName,
    currentUser?.lastName,
    currentUser?.email,
    currentUser?.phone,
  ]);

  useEffect(() => {
    if (!isPerson) return;
    let cancelled = false;

    async function loadShadchanData() {
      setLoadingShadchanim(true);
      try {
        const [allShadchanim, linked] = await Promise.all([
          authApi.getShadchanim(),
          authApi.getLinkedShadchanim(),
        ]);
        if (!cancelled) {
          setAvailableShadchanim(allShadchanim);
          setLinkedShadchanim(linked);
        }
      } catch (error) {
        if (!cancelled) {
          setAvailableShadchanim([]);
          setLinkedShadchanim([]);
          setToast({ message: getApiErrorMessage(error), tone: 'error' });
        }
      } finally {
        if (!cancelled) setLoadingShadchanim(false);
      }
    }

    loadShadchanData();
    return () => {
      cancelled = true;
    };
  }, [isPerson, linkedIds.join('|')]);

  useEffect(() => {
    if (!toast) return;
    const timerId = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timerId);
  }, [toast]);

  const addableShadchanim = useMemo(
    () => availableShadchanim.filter((shadchan) => !linkedIds.includes(shadchan.accountId)),
    [availableShadchanim, linkedIds]
  );

  const profileDirty =
    Boolean(currentUser) &&
    (firstName.trim() !== (currentUser!.firstName ?? '') ||
      lastName.trim() !== (currentUser!.lastName ?? '') ||
      email.trim() !== currentUser!.email ||
      phone.trim() !== (currentUser!.phone ?? ''));

  const handleSaveProfile = async () => {
    if (!currentUser || !profileDirty) return;

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName) {
      setToast({ message: 'נא להזין שם פרטי', tone: 'error' });
      return;
    }
    if (isShadchan && !trimmedLastName) {
      setToast({ message: 'שדכן חייב להזין שם משפחה', tone: 'error' });
      return;
    }

    setIsSavingProfile(true);
    setToast(null);
    try {
      await authApi.updateProfile({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: email.trim(),
        phone: phone.trim() || null,
      });
      await refreshCurrentUser();
      setToast({ message: 'פרטי החשבון נשמרו בהצלחה', tone: 'success' });
    } catch (error) {
      setToast({ message: getApiErrorMessage(error), tone: 'error' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddShadchan = async (shadchanAccountId: string) => {
    setAddingShadchanId(shadchanAccountId);
    setToast(null);
    try {
      await authApi.addLinkedShadchan(shadchanAccountId);
      await refreshCurrentUser();
      setIsAddDialogOpen(false);
      setToast({ message: 'השדכן נוסף לרשימה', tone: 'success' });
    } catch (error) {
      setToast({ message: getApiErrorMessage(error), tone: 'error' });
    } finally {
      setAddingShadchanId(null);
    }
  };

  const handleRemoveShadchan = async (shadchanAccountId: string) => {
    setRemovingShadchanId(shadchanAccountId);
    setToast(null);
    try {
      await authApi.removeLinkedShadchan(shadchanAccountId);
      await refreshCurrentUser();
      setToast({ message: 'השדכן הוסר מהרשימה', tone: 'success' });
    } catch (error) {
      setToast({ message: getApiErrorMessage(error), tone: 'error' });
    } finally {
      setRemovingShadchanId(null);
    }
  };

  if (!currentUser) {
    return <PageState loading />;
  }

  const displayName = formatAccountName(
    currentUser.firstName,
    currentUser.lastName,
    currentUser.email
  );

  return (
    <div className="page settings-page">
      <header className="settings-page__hero">
        <div className="settings-page__hero-glow" aria-hidden="true" />
        <h1 className="settings-page__title">הגדרות</h1>
        <p className="settings-page__subtitle">{displayName} · פרטי חשבון וניהול קשר</p>
      </header>

      {toast && (
        <div
          className={`settings-page__toast settings-page__toast--${toast.tone}`}
          role="status"
        >
          {toast.message}
        </div>
      )}

      <section className="settings-card">
        <div className="settings-card__header">
          <span className="settings-card__icon" aria-hidden="true">
            👤
          </span>
          <div>
            <h2 className="settings-card__title">פרטי חשבון</h2>
            <p className="settings-card__desc">שם, אימייל וטלפון</p>
          </div>
        </div>

        <div className="settings-form">
          <label className="settings-form__field">
            <span className="settings-form__label">שם פרטי</span>
            <input
              type="text"
              className="settings-form__input"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
            />
          </label>
          <label className="settings-form__field">
            <span className="settings-form__label">
              שם משפחה
              {isPerson && <span className="settings-form__optional"> (אופציונלי)</span>}
            </span>
            <input
              type="text"
              className="settings-form__input"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              autoComplete="family-name"
            />
          </label>
          <label className="settings-form__field">
            <span className="settings-form__label">אימייל</span>
            <input
              type="email"
              className="settings-form__input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="settings-form__field">
            <span className="settings-form__label">טלפון</span>
            <input
              type="tel"
              className="settings-form__input"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="050-1234567"
              autoComplete="tel"
            />
          </label>
        </div>

        <button
          type="button"
          className={`btn btn--primary settings-card__save${isSavingProfile ? ' btn--loading' : ''}`}
          onClick={handleSaveProfile}
          disabled={!profileDirty || isSavingProfile}
          aria-busy={isSavingProfile}
        >
          {isSavingProfile && <span className="btn__spinner" aria-hidden="true" />}
          {isSavingProfile ? 'שומר...' : 'שמור שינויים'}
        </button>
      </section>

      {isPerson && (
        <section className="settings-card settings-card--shadchanim">
          <div className="settings-card__header">
            <span className="settings-card__icon settings-card__icon--purple" aria-hidden="true">
              🤝
            </span>
            <div>
              <h2 className="settings-card__title">שדכנים שאני עובד/ת איתם</h2>
              <p className="settings-card__desc">
                {loadingShadchanim
                  ? 'טוען רשימת שדכנים...'
                  : `${linkedShadchanim.length} שדכנים מקושרים`}
              </p>
            </div>
            <button
              type="button"
              className="btn btn--primary settings-card__add-btn"
              onClick={() => setIsAddDialogOpen(true)}
              disabled={loadingShadchanim || addableShadchanim.length === 0}
            >
              הוסף שדכן
            </button>
          </div>

          {loadingShadchanim ? (
            <div className="settings-shadchan-skeleton" aria-busy="true" aria-label="טוען שדכנים">
              {Array.from({ length: 2 }, (_, index) => (
                <div key={index} className="settings-shadchan-skeleton__row skeleton-block" />
              ))}
            </div>
          ) : linkedShadchanim.length === 0 ? (
            <p className="settings-card__empty">
              עדיין לא קישרת שדכנים. לחץ/י על &quot;הוסף שדכן&quot; לבחירה מהרשימה.
            </p>
          ) : (
            <ul className="settings-shadchan-list">
              {linkedShadchanim.map((shadchan) => {
                const shadchanName = getShadchanDisplayName(shadchan);
                const contactMeta = getShadchanContactMeta(shadchan.phone);

                return (
                  <li key={shadchan.accountId} className="settings-shadchan-item">
                    <div className="settings-shadchan-item__avatar" aria-hidden="true">
                      {getShadchanInitial(shadchan)}
                    </div>
                    <div className="settings-shadchan-item__body">
                      <p className="settings-shadchan-item__name">{shadchanName}</p>
                      {contactMeta && (
                        <p className="settings-shadchan-item__meta">{contactMeta}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`btn btn--sm settings-shadchan-item__remove${
                        removingShadchanId === shadchan.accountId ? ' btn--loading' : ''
                      }`}
                      onClick={() => handleRemoveShadchan(shadchan.accountId)}
                      disabled={removingShadchanId === shadchan.accountId}
                      aria-busy={removingShadchanId === shadchan.accountId}
                    >
                      {removingShadchanId === shadchan.accountId && (
                        <span className="btn__spinner btn__spinner--dark" aria-hidden="true" />
                      )}
                      {removingShadchanId === shadchan.accountId ? 'מסיר...' : 'הסר'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {isPerson && (
        <AddShadchanDialog
          isOpen={isAddDialogOpen}
          shadchanim={addableShadchanim}
          isLoading={loadingShadchanim}
          isSubmitting={Boolean(addingShadchanId)}
          onAdd={handleAddShadchan}
          onClose={() => {
            if (!addingShadchanId) setIsAddDialogOpen(false);
          }}
        />
      )}
    </div>
  );
};
