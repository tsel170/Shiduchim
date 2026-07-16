import React from 'react';
import { ManagementRequest } from '../../types/managementRequest';
import { getShadchanDisplayName, getShadchanInitial } from '../../utils/accountName';
import './ManagementRequestList.css';

const CARD_ACCENTS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#db2777', '#ea580c'];

interface ManagementRequestListProps {
  requests: ManagementRequest[];
  respondingId: string | null;
  onRespond: (requestId: string, response: 'approved' | 'declined') => void;
  compact?: boolean;
}

function formatRequestDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export const ManagementRequestList: React.FC<ManagementRequestListProps> = ({
  requests,
  respondingId,
  onRespond,
  compact = false,
}) => (
  <ul className={`mgmt-request-list${compact ? ' mgmt-request-list--compact' : ''}`}>
    {requests.map((request, index) => {
      const shadchan = request.shadchan;
      const shadchanName = shadchan ? getShadchanDisplayName(shadchan) : 'שדכן/ית';
      const initial = shadchan ? getShadchanInitial(shadchan) : 'ש';
      const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
      const isResponding = respondingId === request.requestId;

      return (
        <li
          key={request.requestId}
          className="mgmt-request-card"
          style={{ '--mgmt-accent': accent } as React.CSSProperties}
        >
          <div className="mgmt-request-card__avatar" aria-hidden="true">
            {initial}
          </div>

          <div className="mgmt-request-card__body">
            <div className="mgmt-request-card__head">
              <div>
                <h3 className="mgmt-request-card__name">{shadchanName}</h3>
                {request.createdAt && (
                  <time className="mgmt-request-card__date" dateTime={request.createdAt}>
                    נשלח ב{formatRequestDate(request.createdAt)}
                  </time>
                )}
              </div>
              <span className="mgmt-request-card__tag">בקשת ניהול</span>
            </div>

            <div className="mgmt-request-card__message-wrap">
              <p className="mgmt-request-card__message-label">הודעה מהשדכן/ית</p>
              <blockquote className="mgmt-request-card__message">{request.message}</blockquote>
            </div>
          </div>

          <div className="mgmt-request-card__actions">
            <button
              type="button"
              className={`mgmt-request-card__btn mgmt-request-card__btn--approve${
                isResponding ? ' mgmt-request-card__btn--loading' : ''
              }`}
              onClick={() => onRespond(request.requestId, 'approved')}
              disabled={respondingId !== null}
              aria-busy={isResponding}
            >
              {isResponding && <span className="mgmt-request-card__spinner" aria-hidden="true" />}
              <CheckIcon />
              אישור
            </button>
            <button
              type="button"
              className={`mgmt-request-card__btn mgmt-request-card__btn--decline${
                isResponding ? ' mgmt-request-card__btn--loading' : ''
              }`}
              onClick={() => onRespond(request.requestId, 'declined')}
              disabled={respondingId !== null}
              aria-busy={isResponding}
            >
              <XIcon />
              דחייה
            </button>
          </div>
        </li>
      );
    })}
  </ul>
);

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
