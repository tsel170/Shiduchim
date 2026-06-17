import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '../api/authApi';
import { getApiErrorMessage } from '../api/apiError';
import { setUnauthorizedHandler } from '../api/apiClient';
import { AuthUser, AccountSettings, AccountRole } from '../types/account';

const AUTH_USER_STORAGE_KEY = 'shiduchim_auth_user';

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    role: AccountRole,
    firstName: string,
    lastName: string,
    phone: string
  ) => Promise<{ success: true } | { success: false; message: string }>;
  logout: () => void;
  getCurrentUser: () => AuthUser | null;
  refreshCurrentUser: () => Promise<void>;
  updateAccountSettings: (settings: Partial<AccountSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeAuthUser(user: AuthUser): AuthUser {
  return {
    ...user,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    linkedShadchanIds: user.linkedShadchanIds ?? [],
  };
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.accountId || !parsed?.role) return null;
    return normalizeAuthUser(parsed);
  } catch {
    return null;
  }
}

function persistUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return;
  }
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    authApi.clearSession();
    setCurrentUser(null);
    persistUser(null);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const user = normalizeAuthUser(await authApi.getCurrentUser());
    setCurrentUser(user);
    persistUser(user);
  }, []);

  const updateAccountSettings = useCallback(async (settings: Partial<AccountSettings>) => {
    const user = await authApi.updateSettings(settings);
    setCurrentUser(user);
    persistUser(user);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!readStoredUser() && !localStorage.getItem('shiduchim_auth_token')) {
        setIsLoading(false);
        return;
      }

      try {
        const user = normalizeAuthUser(await authApi.getCurrentUser());
        if (!cancelled) {
          setCurrentUser(user);
          persistUser(user);
        }
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [logout]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password);
      const user = await authApi.persistSession(response);
      setCurrentUser(user);
      persistUser(user);
      return true;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      role: AccountRole,
      firstName: string,
      lastName: string,
      phone: string
    ): Promise<{ success: true } | { success: false; message: string }> => {
      try {
        const response = await authApi.register(
          email,
          password,
          role,
          firstName,
          lastName,
          phone
        );
        const user = await authApi.persistSession(response);
        setCurrentUser(user);
        persistUser(user);
        return { success: true };
      } catch (error) {
        const message = getApiErrorMessage(error);
        if (message.toLowerCase().includes('already registered')) {
          return { success: false, message: 'כתובת האימייל כבר רשומה במערכת.' };
        }
        return { success: false, message };
      }
    },
    []
  );

  const getCurrentUser = useCallback(() => currentUser, [currentUser]);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: currentUser !== null,
      isLoading,
      login,
      register,
      logout,
      getCurrentUser,
      refreshCurrentUser,
      updateAccountSettings,
    }),
    [currentUser, isLoading, login, register, logout, getCurrentUser, refreshCurrentUser, updateAccountSettings]
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
