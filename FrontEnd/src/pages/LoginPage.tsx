import React, { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/brand/BrandLogo';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const afterLoginPath =
    from && from !== '/login' && from !== '/signup' && from !== '/'
      ? from
      : '/browse';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Ensure a clean login even if a previous session still exists.
    if (isAuthenticated) {
      logout();
    }
    const success = await login(trimmedEmail, password);
    setIsSubmitting(false);

    if (!success) {
      setError('אימייל או סיסמה שגויים.');
      return;
    }

    navigate(afterLoginPath, { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <BrandLogo size="lg" showSlogan />
          <p className="login-card__tagline">התחברות למערכת</p>
        </div>

        {isAuthenticated && (
          <div className="login-card__session" role="status">
            <p>יש כבר חיבור פעיל במכשיר זה.</p>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => navigate('/browse', { replace: true })}
            >
              המשך לאפליקציה
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => logout()}>
              התנתק והתחבר מחדש
            </button>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-form__field">
            <label htmlFor="login-email">אימייל</label>
            <input
              id="login-email"
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="משודך/ת או שדכן/ית"
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
      </div>
    </div>
  );
};
