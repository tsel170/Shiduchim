import { FullProfile, ProfileFormErrors, ReferenceContact } from '../types/profile';
import { MAX_PROFILE_PHOTOS } from '../constants/profileOptions';

const PHONE_PATTERN = /^[\d\s\-()]{7,15}$/;

export function validatePhoneNumber(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 && PHONE_PATTERN.test(phone.trim());
}

export function validateReference(contact: ReferenceContact): {
  name?: string;
  phoneNumber?: string;
} {
  const errors: { name?: string; phoneNumber?: string } = {};
  if (!contact.name.trim()) {
    errors.name = 'שם נדרש';
  }
  if (!contact.phoneNumber.trim()) {
    errors.phoneNumber = 'מספר טלפון נדרש';
  } else if (!validatePhoneNumber(contact.phoneNumber)) {
    errors.phoneNumber = 'מספר טלפון לא תקין';
  }
  return errors;
}

export function validateProfile(profile: FullProfile): ProfileFormErrors {
  const errors: ProfileFormErrors = { references: {} };

  if (!profile.age || profile.age <= 0) {
    errors.age = 'גיל חייב להיות מספר חיובי';
  }

  if (!profile.heightCm || profile.heightCm <= 0) {
    errors.heightCm = 'גובה חייב להיות מספר חיובי (בס"מ)';
  }

  if (profile.photos.length > MAX_PROFILE_PHOTOS) {
    errors.photos = `ניתן להעלות עד ${MAX_PROFILE_PHOTOS} תמונות`;
  }

  profile.references.forEach((ref) => {
    const refErrors = validateReference(ref);
    if (Object.keys(refErrors).length > 0) {
      errors.references![ref.id] = refErrors;
    }
  });

  if (Object.keys(errors.references!).length === 0) {
    delete errors.references;
  }

  return errors;
}

export function hasValidationErrors(errors: ProfileFormErrors): boolean {
  return Boolean(
    errors.age ||
      errors.heightCm ||
      errors.photos ||
      errors.general ||
      (errors.references && Object.keys(errors.references).length > 0)
  );
}
