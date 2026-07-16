import { ApiError, translateClientApiMessage } from './apiError';

/**
 * Production (Vercel): set REACT_APP_API_URL to your Render backend URL
 * (e.g. https://shiduchim-api.onrender.com) — no trailing slash.
 * Development: leave empty to use CRA proxy → localhost backend.
 */
function resolveApiBaseUrl(): string {
  const raw = (process.env.REACT_APP_API_URL ?? '').trim().replace(/\/$/, '');

  if (raw) {
    return raw;
  }

  if (process.env.NODE_ENV === 'production') {
    console.error(
      '[API] REACT_APP_API_URL is missing.\n' +
        'Requests are going to the Vercel frontend (wrong host) → 405 Method Not Allowed.\n' +
        'Fix: Vercel → Project → Settings → Environment Variables →\n' +
        '  REACT_APP_API_URL = https://YOUR-BACKEND.onrender.com\n' +
        'Then Redeploy the frontend.',
    );
  }

  return '';
}

const API_BASE_URL = resolveApiBaseUrl();
const TOKEN_STORAGE_KEY = 'shiduchim_auth_token';

if (API_BASE_URL) {
  console.info(`[API] Base URL: ${API_BASE_URL}`);
} else if (process.env.NODE_ENV === 'development') {
  console.info('[API] Base URL: (CRA proxy → package.json "proxy")');
}

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

function buildHint(status: number, url: string): string | undefined {
  const hitsFrontend =
    typeof window !== 'undefined' &&
    window.location.origin &&
    url.startsWith(window.location.origin);

  if (status === 405 || (hitsFrontend && !API_BASE_URL)) {
    return (
      'POST hit the Vercel static site, not the Nest API. ' +
      'Set REACT_APP_API_URL on Vercel to your Render URL and redeploy.'
    );
  }
  if (status === 0) {
    return 'Network/CORS failure. Check FRONTEND_URL on Render matches your Vercel origin.';
  }
  if (status === 401) {
    return 'Auth failed — wrong credentials or expired token.';
  }
  if (status >= 500) {
    return 'Backend error — check Render logs.';
  }
  return undefined;
}

function logApiFailure(details: {
  method: string;
  url: string;
  status: number;
  statusText: string;
  message: string;
  bodyPreview?: string;
  hint?: string;
}) {
  const lines = [
    `[API] ${details.method} ${details.url}`,
    `      status: ${details.status} ${details.statusText}`,
    `      message: ${details.message}`,
    `      apiBase: ${API_BASE_URL || '(empty — using same origin / proxy)'}`,
  ];
  if (details.bodyPreview) {
    lines.push(`      body: ${details.bodyPreview}`);
  }
  if (details.hint) {
    lines.push(`      hint: ${details.hint}`);
  }
  console.error(lines.join('\n'));
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  config?: { skipAuth?: boolean }
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
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
  } catch (error) {
    const message = 'שגיאת רשת';
    logApiFailure({
      method,
      url,
      status: 0,
      statusText: 'Network Error',
      message,
      bodyPreview: error instanceof Error ? error.message : String(error),
      hint: buildHint(0, url),
    });
    throw new ApiError(0, message);
  }

  if (response.status === 401) {
    onUnauthorized?.();
  }

  if (!response.ok) {
    const cloned = response.clone();
    let bodyPreview: string | undefined;
    try {
      bodyPreview = (await cloned.text()).slice(0, 500);
    } catch {
      bodyPreview = undefined;
    }

    const message = await parseErrorMessage(response);
    const hint = buildHint(response.status, url);
    logApiFailure({
      method,
      url,
      status: response.status,
      statusText: response.statusText,
      message,
      bodyPreview,
      hint,
    });
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
