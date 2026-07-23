import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument } from '../accounts/schemas/account.schema';
import { Profile, ProfileDocument } from '../profiles/schemas/profile.schema';
import { Favorite, FavoriteDocument } from '../favorites/schemas/favorite.schema';
import {
  MatchCase,
  MatchCaseDocument,
} from '../match-cases/schemas/match-case.schema';
import { AccountRole } from '../common/types/account-role';
import { toProfileResponse } from '../common/utils/profile-response.mapper';
import { normalizeAccountSettings } from '../common/utils/normalize-account-settings';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<FavoriteDocument>,
    @InjectModel(MatchCase.name)
    private readonly matchCaseModel: Model<MatchCaseDocument>,
  ) {}

  async listAccounts(params: {
    q?: string;
    role?: AccountRole;
    isBlocked?: boolean;
    isDeleted?: boolean;
  }) {
    const query: Record<string, unknown> = {};
    if (params.role) query.role = params.role;
    if (params.isBlocked != null) query.isBlocked = params.isBlocked;
    if (params.isDeleted != null) query.isDeleted = params.isDeleted;
    else query.isDeleted = { $ne: true };

    if (params.q?.trim()) {
      const q = params.q.trim();
      query.$or = [
        { email: new RegExp(q, 'i') },
        { firstName: new RegExp(q, 'i') },
        { lastName: new RegExp(q, 'i') },
        { accountId: q },
      ];
    }

    const accounts = await this.accountModel.find(query).sort({ email: 1 }).limit(500);
    const enriched = [];
    for (const account of accounts) {
      enriched.push(await this.toAdminAccount(account));
    }
    return enriched;
  }

  async getAccount(accountId: string) {
    const account = await this.accountModel.findOne({ accountId });
    if (!account) throw new NotFoundException('החשבון לא נמצא');
    return this.toAdminAccount(account);
  }

  async blockAccount(accountId: string, blocked: boolean) {
    const account = await this.requireAccount(accountId);
    if (account.role === 'admin') {
      throw new BadRequestException('לא ניתן לחסום חשבון מנהל');
    }
    account.isBlocked = blocked;
    await account.save();
    return this.toAdminAccount(account);
  }

  async softDeleteAccount(accountId: string) {
    const account = await this.requireAccount(accountId);
    if (account.role === 'admin') {
      throw new BadRequestException('לא ניתן למחוק חשבון מנהל');
    }
    account.isDeleted = true;
    account.deletedAt = new Date();
    account.isBlocked = true;
    await account.save();

    if (account.profileId) {
      const profile = await this.profileModel.findOne({ profileId: account.profileId });
      if (profile && !profile.isDeleted) {
        profile.isDeleted = true;
        profile.deletedAt = new Date();
        await profile.save();
      }
    }

    return this.toAdminAccount(account);
  }

  async restoreAccount(accountId: string) {
    const account = await this.requireAccount(accountId);
    account.isDeleted = false;
    account.deletedAt = null;
    account.isBlocked = false;
    await account.save();

    if (account.profileId) {
      const profile = await this.profileModel.findOne({ profileId: account.profileId });
      if (profile?.isDeleted) {
        profile.isDeleted = false;
        profile.deletedAt = null;
        await profile.save();
      }
    }

    return this.toAdminAccount(account);
  }

  async listProfiles(includeDeleted = false) {
    const query = includeDeleted ? {} : { isDeleted: { $ne: true } };
    const profiles = await this.profileModel.find(query).sort({ updatedAt: -1 }).limit(1000);
    return profiles.map((profile) => ({
      ...toProfileResponse(profile),
      isDeleted: Boolean(profile.isDeleted),
      deletedAt: profile.deletedAt ?? null,
      cityLatitude: profile.cityLatitude ?? null,
      cityLongitude: profile.cityLongitude ?? null,
    }));
  }

  async softDeleteProfile(profileId: string) {
    const profile = await this.requireProfile(profileId);
    profile.isDeleted = true;
    profile.deletedAt = new Date();
    await profile.save();
    return {
      ...toProfileResponse(profile),
      isDeleted: true,
      deletedAt: profile.deletedAt,
    };
  }

  async restoreProfile(profileId: string) {
    const profile = await this.requireProfile(profileId);
    profile.isDeleted = false;
    profile.deletedAt = null;
    await profile.save();
    return {
      ...toProfileResponse(profile),
      isDeleted: false,
      deletedAt: null,
    };
  }

  async listMatchCases() {
    return this.matchCaseModel.find().sort({ updatedAt: -1 }).limit(1000).lean();
  }

  async listFavorites() {
    return this.favoriteModel.find().sort({ createdAt: -1 }).limit(2000).lean();
  }

  private async requireAccount(accountId: string) {
    const account = await this.accountModel.findOne({ accountId });
    if (!account) throw new NotFoundException('החשבון לא נמצא');
    return account;
  }

  private async requireProfile(profileId: string) {
    const profile = await this.profileModel.findOne({ profileId });
    if (!profile) throw new NotFoundException('הפרופיל לא נמצא');
    return profile;
  }

  private async toAdminAccount(account: AccountDocument) {
    let associatedProfile = null;
    if (account.profileId) {
      const profile = await this.profileModel.findOne({ profileId: account.profileId });
      if (profile) {
        associatedProfile = {
          ...toProfileResponse(profile),
          isDeleted: Boolean(profile.isDeleted),
          deletedAt: profile.deletedAt ?? null,
        };
      }
    }

    let responsibleShadchanim: Array<{ accountId: string; email: string; firstName: string; lastName: string }> = [];
    if (account.role === 'person' && account.linkedShadchanIds?.length) {
      const shadchanim = await this.accountModel
        .find({ accountId: { $in: account.linkedShadchanIds } })
        .select('accountId email firstName lastName');
      responsibleShadchanim = shadchanim.map((s) => ({
        accountId: s.accountId,
        email: s.email,
        firstName: s.firstName ?? '',
        lastName: s.lastName ?? '',
      }));
    }

    return {
      accountId: account.accountId,
      firstName: account.firstName ?? '',
      lastName: account.lastName ?? '',
      email: account.email,
      role: account.role,
      profileId: account.profileId,
      phone: account.phone ?? null,
      settings: normalizeAccountSettings(account.settings),
      linkedShadchanIds: account.linkedShadchanIds ?? [],
      isBlocked: Boolean(account.isBlocked),
      isDeleted: Boolean(account.isDeleted),
      deletedAt: account.deletedAt ?? null,
      associatedProfile,
      responsibleShadchanim,
    };
  }
}
