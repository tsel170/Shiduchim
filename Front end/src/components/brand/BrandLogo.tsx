import React from 'react';
import './BrandLogo.css';

export type BrandLogoSize = 'sm' | 'md' | 'lg';

interface BrandLogoProps {
  size?: BrandLogoSize;
  showText?: boolean;
  showSlogan?: boolean;
  className?: string;
}

/** Minimal line-art: nest arc + two doves facing each other */
export const PigeonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4.5 22.5c0-9.5 6.5-14.5 11.5-14.5s11.5 5 11.5 14.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <circle cx="11" cy="16" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M13.1 16h2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    <path
      d="M8.8 17.8c-1.1 1.7-.7 3.9 1.6 4.8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="21" cy="16" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M18.9 16h-2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    <path
      d="M23.2 17.8c1.1 1.7.7 3.9-1.6 4.8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showSlogan = false,
  className = '',
}) => (
  <div className={`brand-logo brand-logo--${size}${className ? ` ${className}` : ''}`}>
    <span className="brand-logo__icon-wrap" aria-hidden="true">
      <PigeonIcon className="brand-logo__icon" />
    </span>
    {showText && (
      <div className="brand-logo__text">
        <span className="brand-logo__name">שובך</span>
        {showSlogan && <span className="brand-logo__slogan">שני יונים, קן אחד</span>}
      </div>
    )}
  </div>
);
