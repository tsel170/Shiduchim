import React from 'react';
import './PageState.css';

interface PageStateProps {
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  children?: React.ReactNode;
}

export const PageState: React.FC<PageStateProps> = ({
  loading = false,
  error = null,
  isEmpty = false,
  emptyMessage = 'אין נתונים להצגה.',
  children,
}) => {
  if (loading) {
    return (
      <div className="page-state page-state--loading" role="status" aria-live="polite">
        <div className="page-state__spinner" aria-hidden="true" />
        <p className="page-state__label">טוען...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-state page-state--error" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="page-state page-state--empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};
