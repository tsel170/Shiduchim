import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

const AUTH_STORAGE_KEY = 'shiduchim_auth_user';

function renderApp(initialRoute = '/browse') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );
}

function seedPersonAuth() {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      accountId: 'acc-person-1',
      email: 'Person',
      role: 'person',
      favoriteProfileIds: ['p1', 'p2'],
    })
  );
}

beforeEach(() => {
  localStorage.clear();
});

test('shows login page when unauthenticated', () => {
  renderApp('/browse');
  expect(screen.getByRole('heading', { name: 'שידוכים' })).toBeInTheDocument();
  expect(screen.getByLabelText('אימייל')).toBeInTheDocument();
});

test('renders app shell with browse profiles after login', async () => {
  renderApp('/login');
  await userEvent.type(screen.getByLabelText('אימייל'), 'Person');
  await userEvent.type(screen.getByLabelText('סיסמה'), 'Person');
  await userEvent.click(screen.getByRole('button', { name: 'התחברות' }));

  expect(screen.getByRole('heading', { name: 'עיון בפרופילים' })).toBeInTheDocument();
  expect(screen.getByText('שידוכים')).toBeInTheDocument();
});

test('navigates to my profile page', async () => {
  seedPersonAuth();
  renderApp('/browse');
  await userEvent.click(screen.getByRole('button', { name: 'הפרופיל שלי' }));
  expect(screen.getByRole('heading', { name: 'הפרופיל שלי' })).toBeInTheDocument();
});

test('opens profile details from grid', async () => {
  seedPersonAuth();
  renderApp('/browse');
  const profileCards = screen.getAllByRole('button', { name: /צפייה בפרופיל של/ });
  await userEvent.click(profileCards[0]);
  expect(screen.getByRole('button', { name: /חזרה לרשימה/ })).toBeInTheDocument();
});
