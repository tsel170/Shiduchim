import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import {
  DEFAULT_DISPLAY_PREFERENCES,
  DEFAULT_FILTER_CONFIGURATION,
} from './constants/profileOptions';

const demoAccount = {
  accountId: 'acc-person-1',
  firstName: 'משודך',
  lastName: 'דמו',
  email: 'Person',
  role: 'person' as const,
  profileId: 'person-me',
  phone: null,
  linkedShadchanIds: [],
  settings: {
    filters: DEFAULT_FILTER_CONFIGURATION,
    displayPreferences: DEFAULT_DISPLAY_PREFERENCES,
  },
};

const demoProfiles = [
  {
    id: 'p1',
    profileId: 'p1',
    firstName: 'שרה',
    lastName: 'כהן',
    city: 'jerusalem',
    heightCm: 165,
    religiousStream: 'modern-haredi',
    gender: 'female',
    maritalStatus: 'single',
    age: 24,
    personalityTraits: ['אדיב/ה'],
    hobbies: ['קריאה'],
    familyVision: 'בית חם',
    lookingFor: ['משפחתי/ת'],
    additionalInfo: '',
    references: [],
    photos: ['https://example.com/photo.jpg'],
  },
];

function mockFetchResponse(data: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  } as Response);
}

function installFetchMock() {
  global.fetch = jest.fn(async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes('/auth/login')) {
      return mockFetchResponse({ token: 'test-token', account: demoAccount });
    }
    if (url.includes('/auth/me')) {
      return mockFetchResponse(demoAccount);
    }
    if (url.includes('/profiles/search')) {
      return mockFetchResponse(demoProfiles);
    }
    if (url.includes('/profiles/person-me')) {
      return mockFetchResponse({ ...demoProfiles[0], id: 'person-me', profileId: 'person-me' });
    }
    if (url.includes('/profiles/')) {
      return mockFetchResponse(demoProfiles[0]);
    }
    if (url.includes('/favorites')) {
      return mockFetchResponse([]);
    }

    return mockFetchResponse({}, false, 404);
  }) as jest.Mock;
}

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
  localStorage.setItem('shiduchim_auth_token', 'test-token');
  localStorage.setItem('shiduchim_auth_user', JSON.stringify(demoAccount));
}

beforeEach(() => {
  localStorage.clear();
  installFetchMock();
});

test('shows login page when unauthenticated', async () => {
  renderApp('/browse');
  expect(screen.getByText('שובך')).toBeInTheDocument();
  expect(screen.getByLabelText('אימייל')).toBeInTheDocument();
});

test('renders app shell with browse profiles after login', async () => {
  renderApp('/login');
  await userEvent.type(screen.getByLabelText('אימייל'), 'Person');
  await userEvent.type(screen.getByLabelText('סיסמה'), 'Person');
  await userEvent.click(screen.getByRole('button', { name: 'התחברות' }));

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'עיון בפרופילים' })).toBeInTheDocument();
  });
  expect(screen.getAllByText('שובך').length).toBeGreaterThanOrEqual(1);
});

test('navigates to my profile page', async () => {
  seedPersonAuth();
  renderApp('/browse');
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'הפרופיל שלי' })).toBeInTheDocument();
  });
  await userEvent.click(screen.getByRole('button', { name: 'הפרופיל שלי' }));
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'הפרופיל שלי' })).toBeInTheDocument();
  });
});

test('opens profile details from grid', async () => {
  seedPersonAuth();
  renderApp('/browse');
  await waitFor(() => {
    expect(screen.getAllByRole('button', { name: /צפייה בפרופיל של/ }).length).toBeGreaterThan(0);
  });
  const profileCards = screen.getAllByRole('button', { name: /צפייה בפרופיל של/ });
  await userEvent.click(profileCards[0]);
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /^חזרה$/ })).toBeInTheDocument();
  });
});
