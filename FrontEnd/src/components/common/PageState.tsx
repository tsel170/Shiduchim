import React from 'react';
import { AppEmptyState } from '../ui';
import { PageSkeleton, PageSkeletonVariant } from './PageSkeleton';
import './PageState.css';

interface PageStateProps {
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  skeleton?: React.ReactNode;
  skeletonVariant?: PageSkeletonVariant;
  children?: React.ReactNode;
}

export const PageState: React.FC<PageStateProps> = ({
  loading = false,
  error = null,
  isEmpty = false,
  emptyMessage = 'אין נתונים להצגה כרגע.',
  emptyTitle = 'אין תוצאות',
  skeleton,
  skeletonVariant = 'list',
  children,
}) => {
  if (loading) {
    return (
      skeleton ?? (
        <PageSkeleton variant={skeletonVariant} />
      )
    );
  }

  if (error) {
    return (
      <div className="page-state page-state--error ds-alert ds-alert--error" role="alert">
        <span className="page-state__error-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
        </span>
        <p className="page-state__error-text">{error}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <AppEmptyState
        title={emptyTitle}
        message={emptyMessage}
        className="page-state--empty"
      />
    );
  }

  return <>{children}</>;
};
