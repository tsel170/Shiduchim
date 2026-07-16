import React, { useEffect, useState } from 'react';
import './ConfirmDialog.css';

export type ConfirmDialogTone = 'danger' | 'primary';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  cooldownSeconds?: number;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'אישור',
  cancelLabel = 'ביטול',
  tone = 'primary',
  cooldownSeconds = 3,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds);

  useEffect(() => {
    if (!isOpen) return;

    setSecondsLeft(cooldownSeconds);
    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isOpen, cooldownSeconds]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) onCancel();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const canConfirm = secondsLeft === 0 && !isLoading;
  const progress =
    cooldownSeconds > 0 ? ((cooldownSeconds - secondsLeft) / cooldownSeconds) * 100 : 100;

  return (
    <div className="confirm-dialog" role="presentation">
      <button
        type="button"
        className="confirm-dialog__backdrop"
        onClick={isLoading ? undefined : onCancel}
        aria-label="סגור"
        tabIndex={-1}
      />
      <div
        className={`confirm-dialog__panel confirm-dialog__panel--${tone}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <div className="confirm-dialog__icon" aria-hidden="true">
          {tone === 'danger' ? <TrashIcon /> : <InfoIcon />}
        </div>

        <h2 id="confirm-dialog-title" className="confirm-dialog__title">
          {title}
        </h2>

        <div id="confirm-dialog-message" className="confirm-dialog__message">
          {message}
        </div>

        {cooldownSeconds > 0 && secondsLeft > 0 && (
          <div className="confirm-dialog__cooldown">
            <div className="confirm-dialog__cooldown-track" aria-hidden="true">
              <div
                className="confirm-dialog__cooldown-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="confirm-dialog__cooldown-text">
              ניתן לאשר בעוד <strong>{secondsLeft}</strong> שניות
            </p>
          </div>
        )}

        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="btn btn--secondary confirm-dialog__btn"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn confirm-dialog__btn confirm-dialog__btn--confirm confirm-dialog__btn--${tone}`}
            onClick={onConfirm}
            disabled={!canConfirm}
          >
            {isLoading ? 'מבצע...' : secondsLeft > 0 ? `אישור (${secondsLeft})` : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

function TrashIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" strokeLinecap="round" />
    </svg>
  );
}
