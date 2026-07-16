import { ProfileDocument } from '../../profiles/schemas/profile.schema';

export function toProfileResponse(profile: ProfileDocument) {
  const familyVision =
    profile.familyVision ?? (profile as { homeVision?: string }).homeVision ?? '';

  return {
    id: profile.profileId,
    profileId: profile.profileId,
    ownerAccountId: profile.ownerAccountId,
    addedByShadchanId: profile.addedByShadchanId,
    firstName: profile.firstName,
    lastName: profile.lastName ?? '',
    city: profile.city ?? '',
    age: profile.age,
    heightCm: profile.heightCm ?? 0,
    religiousStream: profile.religiousStream ?? '',
    gender: profile.gender ?? '',
    maritalStatus: profile.maritalStatus,
    personalityTraits: profile.personalityTraits ?? [],
    hobbies: profile.hobbies ?? [],
    familyVision,
    lookingFor: profile.lookingFor ?? [],
    additionalInfo: profile.additionalInfo ?? '',
    references: profile.references ?? [],
    photos: profile.photos ?? [],
    shadchanIds: profile.shadchanIds ?? [],
    aboutMe: profile.aboutMe,
    aboutMyFamily: profile.aboutMyFamily,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}
