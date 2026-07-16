import { Injectable, PipeTransform } from '@nestjs/common';

const OPTIONAL_STRING_KEYS = [
  'lastName',
  'city',
  'religiousStream',
  'familyVision',
  'additionalInfo',
  'aboutMe',
  'aboutMyFamily',
  'ownerAccountId',
  'addedByShadchanId',
] as const;

const OPTIONAL_ARRAY_KEYS = [
  'personalityTraits',
  'hobbies',
  'lookingFor',
  'references',
  'photos',
  'shadchanIds',
] as const;

@Injectable()
export class SanitizeProfileBodyPipe implements PipeTransform {
  transform(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return value;
    }

    const body = { ...(value as Record<string, unknown>) };

    for (const key of OPTIONAL_STRING_KEYS) {
      if (body[key] === '' || body[key] === null) {
        delete body[key];
      }
    }

    for (const key of OPTIONAL_ARRAY_KEYS) {
      const arr = body[key];
      if (Array.isArray(arr) && arr.length === 0) {
        delete body[key];
      }
    }

    if (
      body.heightCm === 0 ||
      body.heightCm === '' ||
      body.heightCm === null ||
      body.heightCm === undefined
    ) {
      delete body.heightCm;
    }

    return body;
  }
}
