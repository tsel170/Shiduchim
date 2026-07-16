import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOverlayEnter } from '../../hooks/useOverlayEnter';
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
  const entered = useOverlayEnter();

  useEffect(() => {
    document.body.classList.add('share-panel-overlay-open');

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.classList.remove('share-panel-overlay-open');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className={`share-panel-overlay${entered ? ' share-panel-overlay--entered' : ''}`}
      role="presentation"
    >
      <button
        type="button"
        className="share-panel-overlay__backdrop"
        onClick={onClose}
        aria-label="סגור"
      />
      <div
        className="share-panel-overlay__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
