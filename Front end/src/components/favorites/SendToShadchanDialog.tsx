import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShadchanPickerGroup,
  getDefaultShadchanSelection,
  getVisibleShadchanPickerGroups,
} from '../../utils/shadchanAvailability';
import { ShadchanSummary } from '../../types/account';
import {
  getShadchanContactMeta,
  getShadchanDisplayName,
  getShadchanInitial,
} from '../../utils/accountName';
import '../settings/AddShadchanDialog.css';

export interface SendToShadchanOptions {
  shadchanAccountId: string;
  includeMyProfile: boolean;
}

interface SendToShadchanDialogProps {
  isOpen: boolean;
  profileName: string;
  groups: ShadchanPickerGroup[];
  senderProfileId: string | null;
  senderProfileName?: string;
  isLoading?: boolean;
  isSubmitting?: boolean;
  onSend: (options: SendToShadchanOptions) => void;
  onClose: () => void;
}

export const SendToShadchanDialog: React.FC<SendToShadchanDialogProps> = ({
  isOpen,
  profileName,
  groups,
  senderProfileId,
  senderProfileName,
  isLoading = false,
  isSubmitting = false,
  onSend,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState('');
  const [includeMyProfile, setIncludeMyProfile] = useState(true);

  const visibleGroups = useMemo(() => getVisibleShadchanPickerGroups(groups), [groups]);

  const selectableShadchanim = useMemo(() => {
    const ids = new Set<string>();
    const list: ShadchanSummary[] = [];
    for (const group of visibleGroups) {
      for (const shadchan of group.shadchanim) {
        if (ids.has(shadchan.accountId)) continue;
        ids.add(shadchan.accountId);
        list.push(shadchan);
      }
    }
    return list;
  }, [visibleGroups]);

  const canIncludeMyProfile = Boolean(senderProfileId);
  const mustCreateProfile = includeMyProfile && !canIncludeMyProfile;

  useEffect(() => {
    if (!isOpen) return;
    setSelectedId(getDefaultShadchanSelection(visibleGroups));
    setIncludeMyProfile(true);
  }, [isOpen, visibleGroups]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const renderShadchanOption = (shadchan: ShadchanSummary) => {
    const isSelected = selectedId === shadchan.accountId;
    const displayName = getShadchanDisplayName(shadchan);
    const contactMeta = getShadchanContactMeta(shadchan.phone);

    return (
      <li key={shadchan.accountId}>
        <button
          type="button"
          role="option"
          aria-selected={isSelected}
          className={`add-shadchan-dialog__option${
            isSelected ? ' add-shadchan-dialog__option--selected' : ''
          }`}
          onClick={() => setSelectedId(shadchan.accountId)}
          disabled={isSubmitting}
        >
          <span className="add-shadchan-dialog__avatar" aria-hidden="true">
            {getShadchanInitial(shadchan)}
          </span>
          <span className="add-shadchan-dialog__option-body">
            <span className="add-shadchan-dialog__option-name">{displayName}</span>
            {contactMeta && (
              <span className="add-shadchan-dialog__option-meta">{contactMeta}</span>
            )}
          </span>
        </button>
      </li>
    );
  };

  return (
    <div className="add-shadchan-dialog" role="presentation">
      <button
        type="button"
        className="add-shadchan-dialog__backdrop"
        onClick={isSubmitting ? undefined : onClose}
        aria-label="סגור"
        tabIndex={-1}
      />
      <div
        className="add-shadchan-dialog__panel add-shadchan-dialog__panel--send"
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-shadchan-dialog-title"
      >
        <header className="add-shadchan-dialog__header">
          <div>
            <h2 id="send-shadchan-dialog-title" className="add-shadchan-dialog__title">
              שליחה לשדכן
            </h2>
            <p className="add-shadchan-dialog__subtitle">
              בחר/י לאן לשלוח את <strong>{profileName}</strong>
            </p>
          </div>
          <button
            type="button"
            className="add-shadchan-dialog__close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="סגור"
          >
            ×
          </button>
        </header>

        {isLoading ? (
          <div className="add-shadchan-dialog__loading" aria-busy="true">
            <span className="add-shadchan-dialog__spinner" aria-hidden="true" />
            <p>טוען שדכנים...</p>
          </div>
        ) : selectableShadchanim.length === 0 ? (
          <p className="add-shadchan-dialog__empty">אין שדכנים רשומים במערכת כרגע.</p>
        ) : (
          <div className="send-shadchan-dialog__groups">
            {visibleGroups.map((group) => (
              <section
                key={group.id}
                className={`send-shadchan-dialog__section send-shadchan-dialog__section--${group.id}`}
              >
                <h3 className="send-shadchan-dialog__section-title">{group.title}</h3>
                {group.shadchanim.length === 0 ? (
                  <p className="send-shadchan-dialog__hint">אין שדכנים זמינים בקטגוריה זו.</p>
                ) : (
                  <ul
                    className="add-shadchan-dialog__list"
                    role="listbox"
                    aria-label={group.title}
                  >
                    {group.shadchanim.map(renderShadchanOption)}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}

        <section className="send-shadchan-dialog__section send-shadchan-dialog__section--mine">
          <h3 className="send-shadchan-dialog__section-title">הפרופיל שלי</h3>
          {canIncludeMyProfile ? (
            <label className="send-shadchan-dialog__include">
              <input
                type="checkbox"
                checked={includeMyProfile}
                onChange={(event) => setIncludeMyProfile(event.target.checked)}
                disabled={isSubmitting}
              />
              <span>
                צרף את הפרופיל שלי לבקשה
                {senderProfileName ? ` (${senderProfileName})` : ''}
              </span>
            </label>
          ) : (
            <div className="send-shadchan-dialog__profile-missing">
              <p className="send-shadchan-dialog__hint">
                כדי שהשדכן יכיר/ה אותך, צור/י פרופיל אישי לפני השליחה.
              </p>
              <Link
                to="/my-profile"
                className="btn btn--secondary btn--sm send-shadchan-dialog__profile-link"
                onClick={onClose}
              >
                צור את הפרופיל שלי
              </Link>
            </div>
          )}
        </section>

        <div className="add-shadchan-dialog__actions">
          <button
            type="button"
            className="btn btn--secondary add-shadchan-dialog__btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ביטול
          </button>
          <button
            type="button"
            className={`btn btn--primary add-shadchan-dialog__btn${
              isSubmitting ? ' btn--loading' : ''
            }`}
            onClick={() =>
              selectedId &&
              onSend({
                shadchanAccountId: selectedId,
                includeMyProfile: includeMyProfile && canIncludeMyProfile,
              })
            }
            disabled={
              !selectedId ||
              selectableShadchanim.length === 0 ||
              isSubmitting ||
              mustCreateProfile
            }
            aria-busy={isSubmitting}
          >
            {isSubmitting && <span className="btn__spinner" aria-hidden="true" />}
            {isSubmitting ? 'שולח...' : 'שלח לשדכן'}
          </button>
        </div>
      </div>
    </div>
  );
};
