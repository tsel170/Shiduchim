import { ApiError, translateClientApiMessage } from './apiError';

/**
 * Production (Vercel): set REACT_APP_API_URL to your Render backend URL
 * (e.g. https://shiduchim-api.onrender.com) — no trailing slash.
 * Development: leave empty to use CRA proxy → localhost backend.
 */
function resolveApiBaseUrl(): string {
  return (process.env.REACT_APP_API_URL ?? '').trim().replace(/\/$/, '');
}

const API_BASE_URL = resolveApiBaseUrl();
const TOKEN_STORAGE_KEY = 'shiduchim_auth_token';

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

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
  'Method Not Allowed':
    'הבקשה נשלחה לכתובת הלא נכונה (כנראה לפרונט במקום לבקאנד). הגדר REACT_APP_API_URL ב-Vercel.',
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
  const url = `${API_BASE_URL}${path}`;

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
    response = await fetch(url, {
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
