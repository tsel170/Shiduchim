import { ApiError, translateClientApiMessage } from './apiError';

/** In dev, use CRA proxy (package.json → backend). Set REACT_APP_API_URL for production (e.g. Render). */
const API_BASE_URL = process.env.REACT_APP_API_URL ?? '';
const TOKEN_STORAGE_KEY = 'shiduchim_auth_token';

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null) {
  if (!token) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(data.message)) {
      return translateClientApiMessage(data.message.join(', '));
    }
    if (data.message) return translateClientApiMessage(String(data.message));
  } catch {
    // ignore
  }
  return response.statusText ? translateStatusText(response.statusText) : 'הבקשה נכשלה';
}

const STATUS_TEXT_HE: Record<string, string> = {
  'Bad Request': 'בקשה לא תקינה',
  Unauthorized: 'נדרשת התחברות',
  Forbidden: 'אין הרשאה לפעולה זו',
  'Not Found': 'הפריט המבוקש לא נמצא',
  Conflict: 'הפעולה מתנגשת עם מצב קיים',
  'Payload Too Large': 'הבקשה גדולה מדי',
  'Internal Server Error': 'שגיאת שרת',
};

function translateStatusText(statusText: string): string {
  const mapped = STATUS_TEXT_HE[statusText];
  if (mapped) return mapped;
  if (/[a-zA-Z]{2,}/.test(statusText)) return 'אירעה שגיאה';
  return statusText;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  config?: { skipAuth?: boolean }
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (!config?.skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(0, 'שגיאת רשת');
  }

  if (response.status === 401) {
    onUnauthorized?.();
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
