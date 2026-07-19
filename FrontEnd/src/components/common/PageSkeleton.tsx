import React from 'react';
import './PageSkeleton.css';

export type PageSkeletonVariant = 'list' | 'detail' | 'form' | 'cards';

interface PageSkeletonProps {
  variant?: PageSkeletonVariant;
  rows?: number;
  className?: string;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({
  variant = 'list',
  rows = 4,
  className = '',
}) => {
  const rootClass = [
    'page-skeleton',
    `page-skeleton--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} role="status" aria-busy="true" aria-label="טוען תוכן">
      {variant === 'list' &&
        Array.from({ length: rows }, (_, index) => (
          <div key={`list-row-${index}`} className="page-skeleton__list-row">
            <div className="page-skeleton__list-main">
              <div className="skeleton-block page-skeleton__line page-skeleton__line--title" />
              <div className="skeleton-block page-skeleton__line page-skeleton__line--meta" />
              <div className="skeleton-block page-skeleton__chip" />
            </div>
            <div className="skeleton-block page-skeleton__btn" />
          </div>
        ))}

      {variant === 'cards' && (
        <div className="page-skeleton__cards">
          {Array.from({ length: rows }, (_, index) => (
            <div key={`card-${index}`} className="page-skeleton__card">
              <div className="skeleton-block page-skeleton__card-image" />
              <div className="page-skeleton__card-body">
                <div className="skeleton-block page-skeleton__line page-skeleton__line--title" />
                <div className="skeleton-block page-skeleton__line page-skeleton__line--meta" />
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === 'detail' && (
        <>
          <div className="skeleton-block page-skeleton__hero" />
          <div className="page-skeleton__detail-body">
            <div className="skeleton-block page-skeleton__line page-skeleton__line--heading" />
            <div className="skeleton-block page-skeleton__line page-skeleton__line--wide" />
            <div className="skeleton-block page-skeleton__line page-skeleton__line--wide" />
            <div className="skeleton-block page-skeleton__line page-skeleton__line--meta" />
            <div className="page-skeleton__actions">
              <div className="skeleton-block page-skeleton__btn" />
              <div className="skeleton-block page-skeleton__btn page-skeleton__btn--secondary" />
            </div>
          </div>
        </>
      )}

      {variant === 'form' && (
        <>
          <div className="skeleton-block page-skeleton__line page-skeleton__line--heading" />
          <div className="skeleton-block page-skeleton__line page-skeleton__line--meta" />
          <div className="page-skeleton__form-grid">
            {Array.from({ length: Math.max(rows, 6) }, (_, index) => (
              <div key={`field-${index}`} className="page-skeleton__field">
                <div className="skeleton-block page-skeleton__line page-skeleton__line--label" />
                <div className="skeleton-block page-skeleton__input" />
              </div>
            ))}
          </div>
          <div className="page-skeleton__actions">
            <div className="skeleton-block page-skeleton__btn" />
            <div className="skeleton-block page-skeleton__btn page-skeleton__btn--secondary" />
          </div>
        </>
      )}
    </div>
  );
};
