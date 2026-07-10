import React from 'react';
import './PageState.css';

interface PageStateProps {
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  children?: React.ReactNode;
}

export const PageState: React.FC<PageStateProps> = ({
  loading = false,
  error = null,
  isEmpty = false,
  emptyMessage = 'אין נתונים להצגה כרגע.',
  emptyTitle = 'אין תוצאות',
  children,
}) => {
  if (loading) {
    return (
      <div className="page-state page-state--loading ds-card" role="status" aria-live="polite">
        <div className="page-state__spinner" aria-hidden="true" />
        <p className="page-state__label">טוען נתונים...</p>
        <p className="page-state__hint">רגע אחד בבקשה</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-state page-state--error ds-alert ds-alert--error" role="alert">
        <span className="page-state__error-icon" aria-hidden="true">
          !
        </span>
        <p className="page-state__error-text">{error}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="ds-empty page-state--empty">
        <div className="ds-empty__icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12h8" strokeLinecap="round" />
          </svg>
        </div>
        <p className="ds-empty__title">{emptyTitle}</p>
        <p className="ds-empty__text">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};
