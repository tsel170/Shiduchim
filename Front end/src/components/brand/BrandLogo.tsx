import React from 'react';
import './BrandLogo.css';

export type BrandLogoSize = 'sm' | 'md' | 'lg';

interface BrandLogoProps {
  size?: BrandLogoSize;
  showText?: boolean;
  showSlogan?: boolean;
  className?: string;
}

const BRAND_ICON_SRC = `${process.env.PUBLIC_URL}/favicon.png`;

export const PigeonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img
    className={className}
    src={BRAND_ICON_SRC}
    alt=""
    aria-hidden="true"
    draggable={false}
  />
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
