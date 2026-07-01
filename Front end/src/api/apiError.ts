const API_ERROR_MESSAGES_HE: Record<string, string> = {
  'senderProfileId is required':
    'נדרש פרופיל אישי כדי לשלוח לשדכן. צור/י את הפרופיל שלי ונסה שוב.',
  'Profile already in favorites': 'הפרופיל כבר נמצא במועדפים',
  'Invalid email or password': 'אימייל או סיסמה שגויים',
  'לא נמצאה הצעה מהשדכן עבור פרופיל זה':
    'לא נמצאה הצעה מהשדכן עבור פרופיל זה. פתח/י פרופיל מהרשימה "הצעות מהשדכן".',
  'request entity too large':
    'הבקשה גדולה מדי (בדרך כלל בגלל תמונות). נסה/י תמונה קטנה יותר או פחות תמונות.',
  'Payload Too Large':
    'הבקשה גדולה מדי (בדרך כלל בגלל תמונות). נסה/י תמונה קטנה יותר או פחות תמונות.',
};

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

function translateApiMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return trimmed;
  if (API_ERROR_MESSAGES_HE[trimmed]) return API_ERROR_MESSAGES_HE[trimmed];
  if (!/[a-zA-Z]/.test(trimmed)) return trimmed;
  return trimmed;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isNetworkError) return 'שגיאת רשת. בדוק את החיבור לשרת.';
    if (error.isUnauthorized) return 'פג תוקף ההתחברות. התחבר מחדש.';
    if (error.isForbidden) return 'אין הרשאה לפעולה זו.';
    if (error.status === 413) {
      return translateApiMessage(error.message) ||
        'הבקשה גדולה מדי (בדרך כלל בגלל תמונות). נסה/י תמונה קטנה יותר או פחות תמונות.';
    }
    if (error.isNotFound) {
      const message = error.message?.trim();
      if (message && !/^cannot (get|post|put|patch|delete) /i.test(message)) {
        return translateApiMessage(message);
      }
      return 'לא נמצאה נקודת הקצה בשרת. ודא שהבקאנד רץ (npm run start:dev ב-backEnd) וש-REACT_APP_API_URL מצביע לפורט הנכון.';
    }
    if (error.isServerError) return 'שגיאת שרת. נסה שוב מאוחר יותר.';
    const message = error.message?.trim();
    if (message) return translateApiMessage(message);
    return 'שגיאה בלתי צפויה.';
  }
  return 'שגיאה בלתי צפויה.';
}
