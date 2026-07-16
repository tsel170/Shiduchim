import React from 'react';
import './SendButton.css';

export type SendButtonVariant =
  | 'site'
  | 'alt'
  | 'management'
  | 'shadchan'
  | 'interested'
  | 'decline';

interface SendButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: SendButtonVariant;
  isLoading?: boolean;
  loadingLabel?: string;
  selected?: boolean;
  sent?: boolean;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const SendButton: React.FC<SendButtonProps> = ({
  variant,
  isLoading = false,
  loadingLabel = 'שולח...',
  selected = false,
  sent = false,
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled,
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    className={[
      'send-btn',
      `send-btn--${variant}`,
      size === 'sm' ? 'send-btn--sm' : '',
      isLoading ? 'send-btn--loading' : '',
      selected ? 'send-btn--selected' : '',
      sent ? 'send-btn--sent' : '',
      fullWidth ? 'send-btn--full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    disabled={disabled || isLoading}
    aria-busy={isLoading}
    {...rest}
  >
    {isLoading ? (
      <>
        <span className="send-btn__spinner" aria-hidden="true" />
        {loadingLabel}
      </>
    ) : (
      <>
        <span className="send-btn__icon" aria-hidden="true">
          {sent ? <CheckIcon /> : ICONS[variant]}
        </span>
        {children}
      </>
    )}
  </button>
);

const ICONS: Record<SendButtonVariant, React.ReactNode> = {
  site: <SendIcon />,
  alt: <ShareIcon />,
  management: <UserPlusIcon />,
  shadchan: <MailIcon />,
  interested: <HeartIcon />,
  decline: <XIcon />,
};

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M22 6l-10 7L2 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon() {
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

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
