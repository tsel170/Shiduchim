import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountsService } from '../accounts/accounts.service';
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
    const profile = await this.profileModel.create({
      profileId: generateId(),
      firstName: createProfileDto.firstName.trim(),
      lastName: createProfileDto.lastName?.trim() ?? '',
      city: createProfileDto.city ?? '',
      age: createProfileDto.age,
      heightCm: createProfileDto.heightCm ?? 0,
      religiousStream: createProfileDto.religiousStream ?? '',
      gender: createProfileDto.gender,
      maritalStatus: createProfileDto.maritalStatus,
      personalityTraits: createProfileDto.personalityTraits ?? [],
      hobbies: createProfileDto.hobbies ?? [],
      familyVision: createProfileDto.familyVision ?? '',
      lookingFor: createProfileDto.lookingFor ?? [],
      references: createProfileDto.references ?? [],
      photos: createProfileDto.photos ?? [],
      shadchanIds: 'shadchanIds' in createProfileDto ? createProfileDto.shadchanIds ?? [] : [],
      aboutMe: 'aboutMe' in createProfileDto ? createProfileDto.aboutMe : undefined,
      aboutMyFamily:
        'aboutMyFamily' in createProfileDto ? createProfileDto.aboutMyFamily : undefined,
      ownerAccountId:
        'ownerAccountId' in createProfileDto ? createProfileDto.ownerAccountId ?? null : null,
      addedByShadchanId: createProfileDto.addedByShadchanId ?? null,
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

    const query: Record<string, string> = {};
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
    const profiles = await this.profileModel
      .find(await this.accountsService.getManagedProfilesFilter(shadchanId))
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
    const profiles = await this.profileModel.find().sort({ createdAt: -1 });
    return profiles
      .filter((profile) => matchesFilterConfiguration(profile, normalizedFilters))
      .map((profile) => toProfileResponse(profile));
  }

  async findOne(profileId: string) {
    const profile = await this.profileModel.findOne({ profileId });
    if (!profile) {
      throw new NotFoundException(`Profile "${profileId}" not found`);
    }
    return toProfileResponse(profile);
  }

  async update(profileId: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.profileModel.findOneAndUpdate(
      { profileId },
      { $set: updateProfileDto },
      { new: true, runValidators: true },
    );
    if (!profile) {
      throw new NotFoundException(`Profile "${profileId}" not found`);
    }
    return toProfileResponse(profile);
  }

  async updateForUser(
    profileId: string,
    user: AuthUserPayload,
    updateProfileDto: UpdateShadchanProfileDto | UpdateProfileDto,
  ) {
    const existing = await this.profileModel.findOne({ profileId });
    if (!existing) {
      throw new NotFoundException(`Profile "${profileId}" not found`);
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

    const normalized = this.normalizeProfileUpdate(updateProfileDto);
    const profile = await this.profileModel.findOneAndUpdate(
      { profileId },
      { $set: normalized },
      { new: true, runValidators: true },
    );
    if (!profile) {
      throw new NotFoundException(`Profile "${profileId}" not found`);
    }
    return toProfileResponse(profile);
  }

  private normalizeProfileUpdate(
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
    if (set.heightCm === undefined) {
      // keep existing
    } else if (set.heightCm === null || set.heightCm === 0) {
      set.heightCm = 0;
    }

    return set;
  }

  async remove(profileId: string) {
    const result = await this.profileModel.deleteOne({ profileId });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Profile "${profileId}" not found`);
    }
  }

  async removeForUser(profileId: string, user: AuthUserPayload) {
    const existing = await this.profileModel.findOne({ profileId });
    if (!existing) {
      throw new NotFoundException(`Profile "${profileId}" not found`);
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

    await this.profileModel.deleteOne({ profileId });
  }

  async findManyByIds(profileIds: string[]) {
    if (profileIds.length === 0) return [];
    const profiles = await this.profileModel.find({ profileId: { $in: profileIds } });
    return profiles.map((profile) => toProfileResponse(profile));
  }
}
