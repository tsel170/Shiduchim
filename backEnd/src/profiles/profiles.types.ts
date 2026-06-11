import { Profile } from './entities/profile.entity';

export type ProfileResponse = ReturnType<typeof toProfileResponse>;

export function cmToMeters(heightCm: number): number {
  return Math.round((heightCm / 100) * 100) / 100;
}

export function cmToImperial(heightCm: number): string {
  const totalInches = Math.round(heightCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
}

export function toProfileResponse(profile: Profile) {
  const {
    personalityTraits,
    hobbies,
    lookingForInPartner,
    inquiryPhones,
    ...rest
  } = profile;

  return {
    ...rest,
    heightMeters: cmToMeters(profile.heightCm),
    heightImperial: cmToImperial(profile.heightCm),
    personalityTraits: personalityTraits.map((item) => item.value),
    hobbies: hobbies.map((item) => item.value),
    lookingForInPartner: lookingForInPartner.map((item) => item.value),
    inquiryPhones: inquiryPhones.map(
      ({ id, contactName, phonePrefix, phoneNumber }) => ({
        id,
        contactName,
        phonePrefix,
        phoneNumber,
      }),
    ),
  };
}

export function toProfilesResponse(profiles: Profile[]) {
  return profiles.map(toProfileResponse);
}
