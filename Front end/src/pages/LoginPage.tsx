import React, { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/browse';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('נא להזין אימייל.');
      return;
    }
    if (!password) {
      setError('נא להזין סיסמה.');
      return;
    }

    setIsSubmitting(true);
    const success = await login(trimmedEmail, password);
    setIsSubmitting(false);

    if (!success) {
      setError('אימייל או סיסמה שגויים.');
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <span className="login-card__logo" aria-hidden="true">
            ש
          </span>
          <h1>שידוכים</h1>
          <p>התחברות למערכת</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-form__field">
            <label htmlFor="login-email">אימייל</label>
            <input
              id="login-email"
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Person / Shadchan"
              disabled={isSubmitting}
            />
          </div>

          <div className="login-form__field">
            <label htmlFor="login-password">סיסמה</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="הזן סיסמה"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn--primary login-form__submit" disabled={isSubmitting}>
            {isSubmitting ? 'מתחבר...' : 'התחברות'}
          </button>
        </form>

        <p className="login-card__footer">
          אין לך חשבון?{' '}
          <Link className="login-card__footer-link" to="/signup">
            הרשמה
          </Link>
        </p>

        <p className="login-card__hint">
          דמו: Person / Person או Shadchan / Shadchan
        </p>
      </div>
    </div>
  );
};
