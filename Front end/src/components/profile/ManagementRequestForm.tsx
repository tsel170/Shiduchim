import React, { useState } from 'react';
import { SendButton } from '../common/SendButton';
import { FullProfile } from '../../types/profile';
import { getProfileDisplayName } from '../../utils/profileDisplay';
import './ManagementRequestForm.css';

interface ManagementRequestFormProps {
  profile: FullProfile;
  onSend: (message: string) => Promise<void>;
  onClose: () => void;
  isSending?: boolean;
  onSent?: () => void;
}

export const ManagementRequestForm: React.FC<ManagementRequestFormProps> = ({
  profile,
  onSend,
  onClose,
  isSending = false,
  onSent,
}) => {
  const [message, setMessage] = useState('');
  const displayName = getProfileDisplayName(profile);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isSending) return;
    await onSend(trimmed);
    setMessage('');
    onSent?.();
  };

  return (
    <section className="management-request-form" aria-label="בקשת ניהול">
      <header className="management-request-form__header">
        <h2 className="management-request-form__title">בקשת ניהול</h2>
        <p className="management-request-form__subtitle">
          שליחה ל{displayName} — לאחר אישור, הפרופיל יופיע באחריותך והמשודך/ת יראה אותך ברשימת
          השדכנים
        </p>
      </header>

      <form className="management-request-form__body" onSubmit={handleSubmit}>
        <label className="management-request-form__label" htmlFor="management-request-message">
          הודעה למשודך/ת
        </label>
        <textarea
          id="management-request-message"
          className="management-request-form__textarea"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="לדוגמה: היי, אשמח לעזור לך בתהליך השידוכים..."
          rows={5}
          maxLength={4000}
          disabled={isSending}
        />
        <div className="management-request-form__actions">
          <button type="button" className="btn btn--secondary" onClick={onClose} disabled={isSending}>
            ביטול
          </button>
          <SendButton
            type="submit"
            variant="management"
            isLoading={isSending}
            disabled={!message.trim()}
          >
            שלח בקשת ניהול
          </SendButton>
        </div>
      </form>
    </section>
  );
};
