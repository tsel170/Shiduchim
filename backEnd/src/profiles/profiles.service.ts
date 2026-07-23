import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountsService } from '../accounts/accounts.service';
import { CitiesService } from '../cities/cities.service';
import { GeoService } from '../geo/geo.service';
import { resolveKnownCoordinates } from '../cities/known-city-coordinates';
import { matchesFilterConfiguration } from '../common/utils/profile-filter.util';
import { toProfileResponse } from '../common/utils/profile-response.mapper';
import { generateId } from '../common/utils/generate-id';
import { normalizeAccountSettings } from '../common/utils/normalize-account-settings';
import { FilterConfiguration } from '../common/types/data-model.types';
import { CreateShadchanProfileDto } from './dto/create-shadchan-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateShadchanProfileDto } from './dto/update-shadchan-profile.dto';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { AuthUserPayload } from '../auth/types/auth-user.payload';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    private readonly accountsService: AccountsService,
    private readonly citiesService: CitiesService,
    private readonly geoService: GeoService,
  ) {}

  async createForPerson(user: AuthUserPayload, createProfileDto: CreateProfileDto) {
    if (user.role !== 'person') {
      throw new ForbiddenException('רק משודך/ת יכול/ה ליצור פרופיל אישי');
    }
    if (user.profileId) {
      throw new ConflictException('כבר קיים פרופיל אישי לחשבון זה');
    }

    const account = await this.accountsService.findOne(user.accountId);
    const linkedShadchanIds =
      account.role === 'person' ? account.linkedShadchanIds ?? [] : [];

    const profile = await this.create({
      ...createProfileDto,
      ownerAccountId: user.accountId,
      addedByShadchanId: null,
      shadchanIds: linkedShadchanIds,
    });
    await this.accountsService.linkProfile(user.accountId, profile.profileId);
    return profile;
  }

  async create(createProfileDto: CreateShadchanProfileDto | CreateProfileDto) {
    const cityFields = await this.resolveCityFields(createProfileDto.city);
    const profile = await this.profileModel.create({
      profileId: generateId(),
      firstName: createProfileDto.firstName.trim(),
      lastName: createProfileDto.lastName?.trim() ?? '',
      city: cityFields.city,
      cityLatitude: cityFields.cityLatitude,
      cityLongitude: cityFields.cityLongitude,
      age: createProfileDto.age,
      heightCm: createProfileDto.heightCm ?? 0,
      religiousStream: createProfileDto.religiousStream ?? '',
      gender: createProfileDto.gender,
      maritalStatus: createProfileDto.maritalStatus,
      personalityTraits: createProfileDto.personalityTraits ?? [],
      hobbies: createProfileDto.hobbies ?? [],
      familyVision: createProfileDto.familyVision ?? '',
      lookingFor: createProfileDto.lookingFor ?? [],
      additionalInfo: createProfileDto.additionalInfo ?? '',
      references: createProfileDto.references ?? [],
      photos: createProfileDto.photos ?? [],
      shadchanIds: 'shadchanIds' in createProfileDto ? createProfileDto.shadchanIds ?? [] : [],
      aboutMe: 'aboutMe' in createProfileDto ? createProfileDto.aboutMe : undefined,
      aboutMyFamily:
        'aboutMyFamily' in createProfileDto ? createProfileDto.aboutMyFamily : undefined,
      ownerAccountId:
        'ownerAccountId' in createProfileDto ? createProfileDto.ownerAccountId ?? null : null,
      addedByShadchanId: createProfileDto.addedByShadchanId ?? null,
      isDeleted: false,
      deletedAt: null,
    });
    return toProfileResponse(profile);
  }

  async findAll(filters?: {
    addedByShadchanId?: string;
    ownerAccountId?: string;
    managedByShadchanId?: string;
  }) {
    if (filters?.managedByShadchanId) {
      return this.findManagedByShadchan(filters.managedByShadchanId);
    }

    const query: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (filters?.addedByShadchanId) {
      query.addedByShadchanId = filters.addedByShadchanId;
    }
    if (filters?.ownerAccountId) {
      query.ownerAccountId = filters.ownerAccountId;
    }

    const profiles = await this.profileModel.find(query).sort({ createdAt: -1 });
    return profiles.map((profile) => toProfileResponse(profile));
  }

  async findManagedByShadchan(shadchanId: string) {
    const managedFilter = await this.accountsService.getManagedProfilesFilter(shadchanId);
    const profiles = await this.profileModel
      .find({ ...managedFilter, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 });

    const accountsByProfileId =
      await this.accountsService.findPersonAccountsForManagedProfiles(profiles);

    return profiles.map((profile) => {
      const account = this.accountsService.getPersonAccountForManagedProfile(
        profile,
        accountsByProfileId,
      );
      const names = this.accountsService.resolveManagedPersonName(profile, account ?? null);
      return {
        ...toProfileResponse(profile),
        firstName: names.firstName,
        lastName: names.lastName,
        displayName: names.displayName,
      };
    });
  }

  private async isManagedByShadchan(profile: ProfileDocument, shadchanId: string) {
    return this.accountsService.isProfileManagedByShadchan(profile, shadchanId);
  }

  async search(filters: FilterConfiguration) {
    const normalizedFilters = normalizeAccountSettings({ filters }).filters;
    const profiles = await this.profileModel
      .find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 });

    let matched = profiles.filter((profile) =>
      matchesFilterConfiguration(profile, normalizedFilters),
    );

    // Distance filter: empty/null km → keep all. Number + origin city → radius.
    const maxKm = normalizedFilters.maxDistanceKm;
    const originId = normalizedFilters.originCityId?.trim();
    if (originId && maxKm != null && maxKm > 0) {
      const origin = await this.citiesService.resolveCoordinates(originId);
      if (origin?.latitude != null && origin.longitude != null) {
        matched = this.geoService.filterByMaxDistance(
          matched,
          (profile) => {
            if (profile.cityLatitude != null && profile.cityLongitude != null) {
              return {
                latitude: profile.cityLatitude,
                longitude: profile.cityLongitude,
              };
            }
            return resolveKnownCoordinates(String(profile.city ?? ''));
          },
          { latitude: origin.latitude, longitude: origin.longitude },
          maxKm,
        );
      }
    }

    return matched.map((profile) => toProfileResponse(profile));
  }

  async findOne(profileId: string) {
    const profile = await this.profileModel.findOne({
      profileId,
      isDeleted: { $ne: true },
    });
    if (!profile) {
      throw new NotFoundException(`הפרופיל "${profileId}" לא נמצא`);
    }
    return toProfileResponse(profile);
  }

  async update(profileId: string, updateProfileDto: UpdateProfileDto) {
    const set = await this.normalizeProfileUpdate(updateProfileDto);
    const profile = await this.profileModel.findOneAndUpdate(
      { profileId, isDeleted: { $ne: true } },
      { $set: set },
      { new: true, runValidators: true },
    );
    if (!profile) {
      throw new NotFoundException(`הפרופיל "${profileId}" לא נמצא`);
    }
    return toProfileResponse(profile);
  }

  async updateForUser(
    profileId: string,
    user: AuthUserPayload,
    updateProfileDto: UpdateShadchanProfileDto | UpdateProfileDto,
  ) {
    const existing = await this.profileModel.findOne({
      profileId,
      isDeleted: { $ne: true },
    });
    if (!existing) {
      throw new NotFoundException(`הפרופיל "${profileId}" לא נמצא`);
    }

    if (user.role === 'shadchan') {
      if (!(await this.isManagedByShadchan(existing, user.accountId))) {
        throw new ForbiddenException('אין הרשאה לערוך פרופיל זה');
      }
    } else if (user.role === 'person') {
      if (existing.ownerAccountId !== user.accountId) {
        throw new ForbiddenException('אין הרשאה לערוך פרופיל זה');
      }
    }

    const normalized = await this.normalizeProfileUpdate(updateProfileDto);
    const profile = await this.profileModel.findOneAndUpdate(
      { profileId },
      { $set: normalized },
      { new: true, runValidators: true },
    );
    if (!profile) {
      throw new NotFoundException(`הפרופיל "${profileId}" לא נמצא`);
    }
    return toProfileResponse(profile);
  }

  private async normalizeProfileUpdate(
    updateProfileDto: UpdateShadchanProfileDto | UpdateProfileDto,
  ) {
    const set: Record<string, unknown> = { ...updateProfileDto };

    delete set.addedByShadchanId;
    delete set.ownerAccountId;
    delete set.profileId;
    delete set.id;

    if (typeof set.firstName === 'string') {
      set.firstName = set.firstName.trim();
    }
    if (typeof set.lastName === 'string') {
      set.lastName = set.lastName.trim();
    }
    if (typeof set.familyVision === 'string') {
      set.familyVision = set.familyVision.trim();
    }
    if (typeof set.additionalInfo === 'string') {
      set.additionalInfo = set.additionalInfo.trim();
    }
    if (set.heightCm === undefined) {
      // keep existing
    } else if (set.heightCm === null || set.heightCm === 0) {
      set.heightCm = 0;
    }

    if (typeof set.city === 'string') {
      const cityFields = await this.resolveCityFields(set.city);
      set.city = cityFields.city;
      set.cityLatitude = cityFields.cityLatitude;
      set.cityLongitude = cityFields.cityLongitude;
    }

    return set;
  }

  private async resolveCityFields(city?: string | null) {
    const cityId = city?.trim() ?? '';
    if (!cityId) {
      return { city: '', cityLatitude: null as number | null, cityLongitude: null as number | null };
    }

    const resolved = await this.citiesService.resolveCoordinates(cityId);
    return {
      city: cityId,
      cityLatitude: resolved?.latitude ?? null,
      cityLongitude: resolved?.longitude ?? null,
    };
  }

  async remove(profileId: string) {
    const profile = await this.profileModel.findOne({ profileId });
    if (!profile) {
      throw new NotFoundException(`הפרופיל "${profileId}" לא נמצא`);
    }
    profile.isDeleted = true;
    profile.deletedAt = new Date();
    await profile.save();
  }

  async removeForUser(profileId: string, user: AuthUserPayload) {
    const existing = await this.profileModel.findOne({
      profileId,
      isDeleted: { $ne: true },
    });
    if (!existing) {
      throw new NotFoundException(`הפרופיל "${profileId}" לא נמצא`);
    }

    if (user.role !== 'shadchan') {
      throw new ForbiddenException('אין הרשאה למחוק פרופיל זה');
    }

    if (!(await this.isManagedByShadchan(existing, user.accountId))) {
      throw new ForbiddenException('אין הרשאה למחוק פרופיל זה');
    }

    if (existing.ownerAccountId) {
      throw new ForbiddenException('לא ניתן למחוק פרופיל המשויך לחשבון משתמש');
    }

    existing.isDeleted = true;
    existing.deletedAt = new Date();
    await existing.save();
  }

  async findManyByIds(profileIds: string[]) {
    if (profileIds.length === 0) return [];
    const profiles = await this.profileModel.find({
      profileId: { $in: profileIds },
      isDeleted: { $ne: true },
    });
    return profiles.map((profile) => toProfileResponse(profile));
  }
}
