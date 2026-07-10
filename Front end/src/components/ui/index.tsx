import React from 'react';
import './ui.css';

interface AppLoaderProps {
  label?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  label = 'טוען...',
  hint,
  size = 'md',
  className = '',
}) => (
  <div
    className={`app-loader app-loader--${size}${className ? ` ${className}` : ''}`}
    role="status"
    aria-live="polite"
  >
    <div className="app-loader__spinner" aria-hidden="true" />
    <p className="app-loader__label">{label}</p>
    {hint && <p className="app-loader__hint">{hint}</p>}
  </div>
);

interface AppEmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  title = 'אין תוצאות',
  message = 'אין נתונים להצגה כרגע.',
  icon,
  action,
  className = '',
}) => (
  <div className={`app-empty-state ds-empty${className ? ` ${className}` : ''}`}>
    <div className="ds-empty__icon" aria-hidden="true">
      {icon ?? (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12h8" strokeLinecap="round" />
        </svg>
      )}
    </div>
    <p className="ds-empty__title">{title}</p>
    <p className="ds-empty__text">{message}</p>
    {action && <div className="app-empty-state__action">{action}</div>}
  </div>
);

type AppBadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'muted';

interface AppBadgeProps {
  children: React.ReactNode;
  variant?: AppBadgeVariant;
  className?: string;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  children,
  variant = 'muted',
  className = '',
}) => (
  <span className={`ds-badge ds-badge--${variant}${className ? ` ${className}` : ''}`}>
    {children}
  </span>
);

interface AppCardProps {
  children: React.ReactNode;
  elevated?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  elevated = false,
  interactive = false,
  className = '',
  onClick,
}) => {
  const classes = [
    'ds-card',
    elevated ? 'ds-card--elevated' : '',
    interactive ? 'ds-card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {children}
      </button>
    );
  }

  return <div className={classes}>{children}</div>;
};

interface AppPageProps {
  children: React.ReactNode;
  width?: 'default' | 'narrow' | 'medium';
  className?: string;
}

export const AppPage: React.FC<AppPageProps> = ({
  children,
  width = 'default',
  className = '',
}) => {
  const widthClass =
    width === 'narrow' ? 'ds-page--narrow' : width === 'medium' ? 'ds-page--medium' : '';
  return <div className={`ds-page ${widthClass} ${className}`.trim()}>{children}</div>;
};

interface AppSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const AppSection: React.FC<AppSectionProps> = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
}) => (
  <section className={`app-section${className ? ` ${className}` : ''}`}>
    {(title || actions) && (
      <header className="app-section__header">
        <div>
          {title && <h2 className="app-section__title">{title}</h2>}
          {subtitle && <p className="app-section__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="app-section__actions">{actions}</div>}
      </header>
    )}
    {children}
  </section>
);

interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? (label ? `input-${label.replace(/\s/g, '-')}` : undefined);
    return (
      <div className={`app-input${error ? ' app-input--error' : ''}${className ? ` ${className}` : ''}`}>
        {label && (
          <label className="app-input__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <input ref={ref} id={inputId} className="app-input__field" {...props} />
        {error && (
          <p className="app-input__error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && <p className="app-input__hint">{hint}</p>}
      </div>
    );
  }
);

AppInput.displayName = 'AppInput';
