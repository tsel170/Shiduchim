import { FullProfile, ProfileFormErrors, ReferenceContact } from '../types/profile';
import { MAX_PROFILE_PHOTOS, MIN_PROFILE_AGE, filterPersonalityTraits } from '../constants/profileOptions';

const PHONE_PATTERN = /^[\d\s\-()]{7,15}$/;

export function validatePhoneNumber(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 && PHONE_PATTERN.test(phone.trim());
}

function isReferenceEmpty(contact: ReferenceContact): boolean {
  return !contact.name.trim() && !contact.phoneNumber.trim();
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

/** Full profile edit (e.g. משודך/ת — הפרופיל שלי). */
export function validateProfile(profile: FullProfile): ProfileFormErrors {
  const errors: ProfileFormErrors = { references: {} };

  if (!profile.firstName.trim()) {
    errors.firstName = 'נא להזין שם פרטי';
  }

  if (!profile.age || profile.age < MIN_PROFILE_AGE) {
    errors.age = `נא להזין גיל (מינימום ${MIN_PROFILE_AGE})`;
  }

  if (!profile.gender) {
    errors.gender = 'נא לבחור מין';
  }

  if (!profile.maritalStatus) {
    errors.maritalStatus = 'נא לבחור מצב משפחתי';
  }

  if (profile.heightCm < 0) {
    errors.heightCm = 'גובה לא תקין';
  } else if (profile.heightCm > 0 && profile.heightCm < 100) {
    errors.heightCm = 'גובה חייב להיות לפחות 100 ס"מ';
  }

  if (profile.photos.length > MAX_PROFILE_PHOTOS) {
    errors.photos = `ניתן להעלות עד ${MAX_PROFILE_PHOTOS} תמונות`;
  }

  profile.references.forEach((ref) => {
    if (isReferenceEmpty(ref)) return;
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

/** שדכן מוסיף פרופיל — רק שם פרטי, גיל, מין ומצב משפחתי חובה. */
export function validateShadchanNewProfile(profile: FullProfile): ProfileFormErrors {
  const errors: ProfileFormErrors = { references: {} };

  if (!profile.firstName.trim()) {
    errors.firstName = 'נא להזין שם פרטי';
  }

  if (!profile.age || profile.age < MIN_PROFILE_AGE) {
    errors.age = `נא להזין גיל (מינימום ${MIN_PROFILE_AGE})`;
  }

  if (!profile.gender) {
    errors.gender = 'נא לבחור מין';
  }

  if (!profile.maritalStatus) {
    errors.maritalStatus = 'נא לבחור מצב משפחתי';
  }

  if (profile.heightCm < 0) {
    errors.heightCm = 'גובה לא תקין';
  } else if (profile.heightCm > 0 && profile.heightCm < 100) {
    errors.heightCm = 'גובה חייב להיות לפחות 100 ס"מ';
  }

  if (profile.photos.length > MAX_PROFILE_PHOTOS) {
    errors.photos = `ניתן להעלות עד ${MAX_PROFILE_PHOTOS} תמונות`;
  }

  profile.references.forEach((ref) => {
    if (isReferenceEmpty(ref)) return;
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
    errors.firstName ||
      errors.age ||
      errors.gender ||
      errors.maritalStatus ||
      errors.heightCm ||
      errors.photos ||
      errors.general ||
      (errors.references && Object.keys(errors.references).length > 0)
  );
}

export function buildPersonCreateRequestBody(
  profile: FullProfile,
  ownerAccountId: string
): Record<string, unknown> {
  return {
    ...buildShadchanProfileFields(profile, { includeEmptyArrays: false }),
    ownerAccountId,
    addedByShadchanId: null,
  };
}

export function buildShadchanCreateRequestBody(
  profile: FullProfile,
  addedByShadchanId: string
): Record<string, unknown> {
  return {
    ...buildShadchanProfileFields(profile, { includeEmptyArrays: false }),
    addedByShadchanId,
  };
}

export function buildShadchanUpdateRequestBody(profile: FullProfile): Record<string, unknown> {
  return buildShadchanProfileFields(profile, { includeEmptyArrays: true });
}

function buildShadchanProfileFields(
  profile: FullProfile,
  options: { includeEmptyArrays: boolean }
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    firstName: profile.firstName.trim(),
    age: profile.age,
    gender: profile.gender,
    maritalStatus: profile.maritalStatus,
  };

  const lastName = profile.lastName.trim();
  if (lastName) body.lastName = lastName;

  if (profile.city.trim()) body.city = profile.city.trim();
  if (profile.heightCm > 0) body.heightCm = profile.heightCm;
  if (profile.religiousStream) body.religiousStream = profile.religiousStream;
  if (profile.familyVision.trim()) body.familyVision = profile.familyVision.trim();

  const references = profile.references.filter(
    (ref) => ref.name.trim() || ref.phoneNumber.trim()
  );

  if (options.includeEmptyArrays || references.length > 0) {
    body.references = references;
  }
  if (options.includeEmptyArrays || profile.personalityTraits.length > 0) {
    body.personalityTraits = profile.personalityTraits;
  }
  if (options.includeEmptyArrays || profile.hobbies.length > 0) {
    body.hobbies = profile.hobbies;
  }
  if (options.includeEmptyArrays || profile.lookingFor.length > 0) {
    body.lookingFor = filterPersonalityTraits(profile.lookingFor);
  }
  if (options.includeEmptyArrays || profile.photos.length > 0) {
    body.photos = profile.photos;
  }

  return body;
}
