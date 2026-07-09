import React, { useState } from 'react';
import { SendButton } from '../common/SendButton';
import { DENIAL_REASON_LABELS, DenialReason } from '../../types/matchCase';
import './DenyCaseDialog.css';

interface DenyCaseDialogProps {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: (reason: DenialReason, note: string) => void;
  onClose: () => void;
}

export const DenyCaseDialog: React.FC<DenyCaseDialogProps> = ({
  isOpen,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState<DenialReason>('NotInterested');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  return (
    <div className="deny-case-dialog" role="dialog" aria-modal="true" aria-label="דחיית תיק">
      <div className="deny-case-dialog__backdrop" onClick={onClose} />
      <div className="deny-case-dialog__panel">
        <h2 className="deny-case-dialog__title">דחיית תיק</h2>
        <label className="deny-case-dialog__field">
          סיבה
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as DenialReason)}
          >
            {(Object.keys(DENIAL_REASON_LABELS) as DenialReason[]).map((key) => (
              <option key={key} value={key}>
                {DENIAL_REASON_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
        <label className="deny-case-dialog__field">
          הערה (אופציונלי)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={2000}
          />
        </label>
        <div className="deny-case-dialog__actions">
          <SendButton variant="decline" isLoading={isLoading} onClick={() => onConfirm(reason, note)}>
            אישור דחייה
          </SendButton>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};
