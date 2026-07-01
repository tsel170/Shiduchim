import React from 'react';
import './FavoriteButton.css';

interface FavoriteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isFavorite: boolean;
  isLoading?: boolean;
  variant?: 'full' | 'icon';
  fullWidth?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  isLoading = false,
  variant = 'full',
  fullWidth = false,
  className = '',
  disabled,
  children,
  type = 'button',
  ...rest
}) => {
  const label =
    children ??
    (isLoading
      ? isFavorite
        ? 'מסיר...'
        : 'מוסיף...'
      : isFavorite
        ? 'הסר ממועדפים'
        : 'הוסף למועדפים');

  return (
    <button
      type={type}
      className={[
        'favorite-btn',
        variant === 'icon' ? 'favorite-btn--icon' : 'favorite-btn--full',
        isFavorite ? 'favorite-btn--saved' : 'favorite-btn--add',
        isLoading ? 'favorite-btn--loading' : '',
        fullWidth ? 'favorite-btn--full-width' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled || isLoading}
      aria-pressed={isFavorite}
      aria-busy={isLoading}
      aria-label={
        variant === 'icon'
          ? isFavorite
            ? 'הסר ממועדפים'
            : 'הוסף למועדפים'
          : undefined
      }
      {...rest}
    >
      {isLoading ? (
        <>
          <span className="favorite-btn__spinner" aria-hidden="true" />
          {variant === 'full' ? label : null}
        </>
      ) : (
        <>
          <span className="favorite-btn__icon" aria-hidden="true">
            <HeartIcon filled={isFavorite} />
          </span>
          {variant === 'full' ? label : null}
        </>
      )}
    </button>
  );
};

function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
