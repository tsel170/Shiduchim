const API_ERROR_MESSAGES_HE: Record<string, string> = {
  'senderProfileId is required':
    'נדרש פרופיל אישי כדי לשלוח לשדכן. צור/י את הפרופיל שלי ונסה שוב.',
  'Profile already in favorites': 'הפרופיל כבר נמצא במועדפים',
  'Invalid email or password': 'אימייל או סיסמה שגויים',
  'Email already registered': 'כתובת האימייל כבר רשומה במערכת',
  'Interest already exists for this profile': 'כבר קיים עניין בפרופיל זה',
  'role is required': 'נדרש לציין תפקיד',
  'Invalid or missing token': 'אסימון התחברות לא תקין או חסר',
  'request entity too large':
    'הבקשה גדולה מדי (בדרך כלל בגלל תמונות). נסה/י תמונה קטנה יותר או פחות תמונות.',
  'Payload Too Large':
    'הבקשה גדולה מדי (בדרך כלל בגלל תמונות). נסה/י תמונה קטנה יותר או פחות תמונות.',
  'Network error': 'שגיאת רשת. בדוק את החיבור לשרת.',
  'Request failed': 'הבקשה נכשלה',
  'Bad Request': 'בקשה לא תקינה',
  Unauthorized: 'נדרשת התחברות',
  Forbidden: 'אין הרשאה לפעולה זו',
  'Not Found': 'הפריט המבוקש לא נמצא',
  Conflict: 'הפעולה מתנגשת עם מצב קיים',
  'Internal Server Error': 'שגיאת שרת. נסה שוב מאוחר יותר.',
};

const API_ERROR_PATTERNS_HE: Array<[RegExp, string]> = [
  [/^Profile "[^"]+" not found$/i, 'הפרופיל לא נמצא'],
  [/^Account "[^"]+" not found$/i, 'החשבון לא נמצא'],
  [/^Request "[^"]+" not found$/i, 'הבקשה לא נמצאה'],
  [/^Suggestion "[^"]+" not found$/i, 'ההצעה לא נמצאה'],
  [/^Favorite "[^"]+" not found$/i, 'רשומת מועדפים לא נמצאה'],
  [/^Interest "[^"]+" not found$/i, 'רשומת עניין לא נמצאה'],
  [/^cannot (get|post|put|patch|delete) /i, 'לא נמצאה נקודת הקצה בשרת'],
];

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isServerError() {
    return this.status >= 500;
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

function translateSingleApiMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return trimmed;

  const exact = API_ERROR_MESSAGES_HE[trimmed];
  if (exact) return exact;

  if (!/[a-zA-Z]{2,}/.test(trimmed)) return trimmed;

  for (const [pattern, hebrew] of API_ERROR_PATTERNS_HE) {
    if (pattern.test(trimmed)) return hebrew;
  }

  return 'אירעה שגיאה. נסה שוב.';
}

function translateApiMessage(message: string): string {
  const parts = message
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length > 1) {
    return parts.map(translateSingleApiMessage).join(', ');
  }

  return translateSingleApiMessage(message);
}

export function translateClientApiMessage(message: string): string {
  return translateApiMessage(message);
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isNetworkError) return 'שגיאת רשת. בדוק את החיבור לשרת.';
    if (error.isUnauthorized) {
      const message = error.message?.trim();
      if (message && message !== 'Unauthorized') {
        return translateApiMessage(message);
      }
      return 'פג תוקף ההתחברות. התחבר מחדש.';
    }
    if (error.isForbidden) {
      const message = error.message?.trim();
      if (message && message !== 'Forbidden') {
        return translateApiMessage(message);
      }
      return 'אין הרשאה לפעולה זו.';
    }
    if (error.status === 413) {
      return (
        translateApiMessage(error.message) ||
        'הבקשה גדולה מדי (בדרך כלל בגלל תמונות). נסה/י תמונה קטנה יותר או פחות תמונות.'
      );
    }
    if (error.isNotFound) {
      const message = error.message?.trim();
      if (message && !/^cannot (get|post|put|patch|delete) /i.test(message)) {
        return translateApiMessage(message);
      }
      return 'לא ניתן להתחבר לשרת. ודא שהשרת פועל ונסה שוב.';
    }
    if (error.isServerError) return 'שגיאת שרת. נסה שוב מאוחר יותר.';
    const message = error.message?.trim();
    if (message) return translateApiMessage(message);
    return 'שגיאה בלתי צפויה.';
  }
  return 'שגיאה בלתי צפויה.';
}
