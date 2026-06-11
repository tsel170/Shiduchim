import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { mockAccounts } from '../data/mockAccounts';
import { Account, AuthUser } from '../types/account';

const AUTH_STORAGE_KEY = 'shiduchim_auth_user';

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toAuthUser(account: Account): AuthUser {
  const { password: _password, ...user } = account;
  return user;
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.accountId || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => readStoredUser());

  useEffect(() => {
    persistUser(currentUser);
  }, [currentUser]);

  const login = useCallback((email: string, password: string): boolean => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = mockAccounts.find(
      (entry) =>
        entry.email.trim().toLowerCase() === normalizedEmail &&
        entry.password === password
    );
    if (!account) return false;
    const user = toAuthUser(account);
    setCurrentUser(user);
    persistUser(user);
    return true;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    persistUser(null);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: currentUser !== null,
      login,
      logout,
    }),
    [currentUser, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
