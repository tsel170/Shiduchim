import { BadRequestException, ValidationError } from '@nestjs/common';

const FIELD_LABELS: Record<string, string> = {
  firstName: 'שם פרטי',
  lastName: 'שם משפחה',
  age: 'גיל',
  gender: 'מין',
  maritalStatus: 'מצב משפחתי',
  city: 'עיר',
  heightCm: 'גובה',
  religiousStream: 'זרם דתי',
  familyVision: 'חזון בית ומשפחה',
  email: 'אימייל',
  password: 'סיסמה',
  role: 'תפקיד',
  targetProfileId: 'פרופיל יעד',
  personProfileId: 'פרופיל משודך',
  senderProfileId: 'פרופיל שולח',
  profileId: 'פרופיל',
  message: 'הודעה',
  notes: 'הערות',
  response: 'תגובה',
  shadchanId: 'שדכן',
};

function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    const fieldPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const fieldKey = fieldPath.split('.').pop() ?? fieldPath;
    const label = FIELD_LABELS[fieldKey] ?? fieldKey;

    if (error.constraints) {
      for (const message of Object.values(error.constraints)) {
        messages.push(toHebrewValidationMessage(label, message));
      }
    }

    if (error.children?.length) {
      messages.push(...flattenValidationErrors(error.children, fieldPath));
    }
  }

  return messages;
}

function toHebrewValidationMessage(label: string, message: string): string {
  if (!/[a-zA-Z]/.test(message)) {
    return message;
  }

  if (message.includes('must be shorter than or equal to') || message.includes('must not be greater than')) {
    return `${label}: הערך גדול מדי`;
  }
  if (message.includes('must be longer than or equal to') || message.includes('must not be less than')) {
    return `${label}: הערך קטן מדי`;
  }
  if (message.includes('must be an array')) {
    return `${label}: פורמט לא תקין`;
  }
  if (message.includes('each value in') || message.includes('each value must')) {
    return `${label}: ערך לא תקין`;
  }
  if (message.includes('must be one of the following')) {
    return `${label}: ערך לא תקין`;
  }
  if (message.includes('must be an integer') || message.includes('must be a number')) {
    return `${label}: חייב להיות מספר`;
  }
  if (message.includes('should not be empty') || message.includes('must be a string')) {
    return `${label}: שדה חובה`;
  }
  if (message.includes('must be an email')) {
    return 'נא להזין כתובת אימייל תקינה';
  }

  return `${label}: נתונים לא תקינים`;
}

export function validationExceptionFactory(errors: ValidationError[]) {
  const messages = flattenValidationErrors(errors);
  return new BadRequestException(
    messages.length > 0 ? messages : ['נתונים לא תקינים'],
  );
}
