import React, { useEffect, useState } from 'react';
import { SendButton } from '../common/SendButton';
import './CloseCaseDialog.css';

interface CloseCaseDialogProps {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export const CloseCaseDialog: React.FC<CloseCaseDialogProps> = ({
  isOpen,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) setReason('');
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = reason.trim();
  const canSubmit = trimmed.length >= 3;

  return (
    <div className="close-case-dialog" role="dialog" aria-modal="true" aria-label="ביטול תיק">
      <div className="close-case-dialog__backdrop" onClick={isLoading ? undefined : onClose} />
      <div className="close-case-dialog__panel">
        <h2 className="close-case-dialog__title">ביטול תיק</h2>
        <p className="close-case-dialog__hint">
          פעולה זו תסגור את התיק. יש לציין סיבה כדי למנוע ביטול בטעות.
        </p>
        <label className="close-case-dialog__field">
          סיבת הביטול
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="למשל: הזוג לא מתאים, בקשת המשודכים, שינוי בנסיבות..."
            autoFocus
          />
        </label>
        <div className="close-case-dialog__actions">
          <SendButton
            variant="decline"
            isLoading={isLoading}
            disabled={!canSubmit}
            onClick={() => onConfirm(trimmed)}
          >
            אישור ביטול
          </SendButton>
          <button type="button" className="btn btn--secondary" onClick={onClose} disabled={isLoading}>
            חזרה
          </button>
        </div>
      </div>
    </div>
  );
};
