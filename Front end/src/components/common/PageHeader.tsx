import React, { ReactNode } from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  variant?: 'default' | 'hero';
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  variant = 'default',
  className = '',
}) => {
  return (
    <header
      className={`page-header page-header--${variant}${className ? ` ${className}` : ''}`}
    >
      <div className="page-header__content">
        {badge && <div className="page-header__badge">{badge}</div>}
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
};
