import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOverlayEnter } from '../../hooks/useOverlayEnter';
import './ProfilePreviewOverlay.css';

interface ProfilePreviewOverlayProps {
  onClose: () => void;
  children: React.ReactNode;
}

export const ProfilePreviewOverlay: React.FC<ProfilePreviewOverlayProps> = ({
  onClose,
  children,
}) => {
  const entered = useOverlayEnter();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className={`profile-preview${entered ? ' profile-preview--entered' : ''}`}
      role="presentation"
    >
      <button
        type="button"
        className="profile-preview__backdrop"
        onClick={onClose}
        aria-label="סגור תצוגת פרופיל"
        tabIndex={-1}
      />
      <div
        className="profile-preview__panel"
        role="dialog"
        aria-modal="true"
        aria-label="תצוגת פרופיל"
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
