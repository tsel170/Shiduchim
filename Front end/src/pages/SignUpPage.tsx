import React, { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AccountRole } from '../types/account';
import './LoginPage.css';

type SignUpStep = 'role' | 'details';

const ROLE_OPTIONS: ReadonlyArray<{
  role: AccountRole;
  title: string;
  description: string;
}> = [
  {
    role: 'person',
    title: 'משודך/ת',
    description: 'עיון בפרופילים, מועדפים והצעות מהשדכן',
  },
  {
    role: 'shadchan',
    title: 'שדכן/ית',
    description: 'ניהול פרופילים, בקשות והצעות למשודכים',
  },
];

export const SignUpPage: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<SignUpStep>('role');
  const [role, setRole] = useState<AccountRole | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/browse" replace />;
  }

  const selectedRoleLabel = ROLE_OPTIONS.find((option) => option.role === role)?.title;

  const handleContinueToDetails = () => {
    setError('');
    if (!role) {
      setError('נא לבחור תפקיד לפני המשך.');
      return;
    }
    setStep('details');
  };

  const handleBackToRole = () => {
    setError('');
    setStep('role');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!role) {
      setStep('role');
      setError('נא לבחור תפקיד.');
      return;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    if (!trimmedFirstName) {
      setError('נא להזין שם פרטי.');
      return;
    }
    if (role === 'shadchan' && !trimmedLastName) {
      setError('שדכן חייב להזין שם משפחה.');
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('נא להזין אימייל.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('נא להזין כתובת אימייל תקינה.');
      return;
    }
    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים.');
      return;
    }

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setError('נא להזין מספר טלפון.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(
      trimmedEmail,
      password,
      role,
      trimmedFirstName,
      trimmedLastName,
      trimmedPhone
    );
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(role === 'shadchan' ? '/added-profiles' : '/browse', { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <span className="login-card__logo" aria-hidden="true">
            ש
          </span>
          <h1>שידוכים</h1>
          <p>{step === 'role' ? 'בחר/י את התפקיד שלך' : 'פרטי חשבון'}</p>
        </div>

        {step === 'role' ? (
          <div className="signup-role-step">
            <p className="signup-role-step__intro">איך תשתמש/י במערכת?</p>
            <div className="signup-role-grid" role="radiogroup" aria-label="בחירת תפקיד">
              {ROLE_OPTIONS.map((option) => {
                const isSelected = role === option.role;
                return (
                  <button
                    key={option.role}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`signup-role-card${isSelected ? ' signup-role-card--selected' : ''}`}
                    onClick={() => {
                      setRole(option.role);
                      setError('');
                    }}
                  >
                    <span className="signup-role-card__title">{option.title}</span>
                    <span className="signup-role-card__description">{option.description}</span>
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="login-form__error" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              className="btn btn--primary login-form__submit"
              onClick={handleContinueToDetails}
              disabled={!role}
            >
              המשך
            </button>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {selectedRoleLabel && (
              <p className="signup-role-badge">
                נרשם/ת כ-<span>{selectedRoleLabel}</span>
              </p>
            )}

            <div className="login-form__field">
              <label htmlFor="signup-first-name">שם פרטי</label>
              <input
                id="signup-first-name"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="ישראל"
                disabled={isSubmitting}
              />
            </div>

            <div className="login-form__field">
              <label htmlFor="signup-last-name">
                שם משפחה
                {role === 'person' && (
                  <span className="login-form__optional"> (אופציונלי)</span>
                )}
              </label>
              <input
                id="signup-last-name"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="ישראלי"
                disabled={isSubmitting}
              />
            </div>

            <div className="login-form__field">
              <label htmlFor="signup-email">אימייל</label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={isSubmitting}
              />
            </div>

            <div className="login-form__field">
              <label htmlFor="signup-password">סיסמה</label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="לפחות 6 תווים"
                disabled={isSubmitting}
              />
            </div>

            <div className="login-form__field">
              <label htmlFor="signup-phone">טלפון</label>
              <input
                id="signup-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="050-1234567"
                disabled={isSubmitting}
                required
              />
            </div>

            {error && (
              <p className="login-form__error" role="alert">
                {error}
              </p>
            )}

            <div className="signup-form-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleBackToRole}
                disabled={isSubmitting}
              >
                חזרה
              </button>
              <button
                type="submit"
                className={`btn btn--primary${isSubmitting ? ' btn--loading' : ''}`}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting && <span className="btn__spinner" aria-hidden="true" />}
                {isSubmitting ? 'נרשם...' : 'הרשמה'}
              </button>
            </div>
          </form>
        )}

        <p className="login-card__footer">
          כבר יש לך חשבון?{' '}
          <Link className="login-card__footer-link" to="/login">
            התחברות
          </Link>
        </p>
      </div>
    </div>
  );
};
