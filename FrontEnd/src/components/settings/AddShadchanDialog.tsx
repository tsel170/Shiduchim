import React, { useEffect, useState } from 'react';
import { ShadchanSummary } from '../../types/account';
import { getShadchanContactMeta, getShadchanDisplayName, getShadchanInitial } from '../../utils/accountName';
import './AddShadchanDialog.css';

interface AddShadchanDialogProps {
  isOpen: boolean;
  shadchanim: ShadchanSummary[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  onAdd: (shadchanAccountId: string) => void;
  onClose: () => void;
}

export const AddShadchanDialog: React.FC<AddShadchanDialogProps> = ({
  isOpen,
  shadchanim,
  isLoading = false,
  isSubmitting = false,
  onAdd,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSelectedId(shadchanim[0]?.accountId ?? '');
  }, [isOpen, shadchanim]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

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
        className="add-shadchan-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-shadchan-dialog-title"
      >
        <header className="add-shadchan-dialog__header">
          <div>
            <h2 id="add-shadchan-dialog-title" className="add-shadchan-dialog__title">
              הוספת שדכן
            </h2>
            <p className="add-shadchan-dialog__subtitle">בחר/י שדכן מהמערכת לקישור לחשבון שלך</p>
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
        ) : shadchanim.length === 0 ? (
          <p className="add-shadchan-dialog__empty">אין שדכנים זמינים להוספה כרגע.</p>
        ) : (
          <ul className="add-shadchan-dialog__list" role="listbox" aria-label="שדכנים זמינים">
            {shadchanim.map((shadchan) => {
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
            })}
          </ul>
        )}

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
            onClick={() => selectedId && onAdd(selectedId)}
            disabled={!selectedId || shadchanim.length === 0 || isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting && <span className="btn__spinner" aria-hidden="true" />}
            {isSubmitting ? 'מוסיף...' : 'הוסף שדכן'}
          </button>
        </div>
      </div>
    </div>
  );
};
