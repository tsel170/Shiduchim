import React, { useEffect } from 'react';
import './ShadchanSharePanel.css';

interface SharePanelOverlayProps {
  onClose: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}

export const SharePanelOverlay: React.FC<SharePanelOverlayProps> = ({
  onClose,
  ariaLabel,
  children,
}) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="share-panel-overlay" role="presentation">
      <button
        type="button"
        className="share-panel-overlay__backdrop"
        onClick={onClose}
        aria-label="סגור"
        tabIndex={-1}
      />
      <div
        className="share-panel-overlay__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </div>
  );
};
