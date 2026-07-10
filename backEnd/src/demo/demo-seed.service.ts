import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument } from '../accounts/schemas/account.schema';
import { AccountsService } from '../accounts/accounts.service';
import { computeAverageRating } from '../common/schemas/profile-rating.schema';
import { Favorite, FavoriteDocument } from '../favorites/schemas/favorite.schema';
import {
  MatchRequest,
  MatchRequestDocument,
} from '../match-requests/schemas/match-request.schema';
import {
  MatchCase,
  MatchCaseDocument,
} from '../match-cases/schemas/match-case.schema';
import { Profile, ProfileDocument } from '../profiles/schemas/profile.schema';
import {
  Suggestion,
  SuggestionDocument,
} from '../suggestions/schemas/suggestion.schema';
import { DEMO_BROWSE_PROFILES, DEMO_PERSON_PROFILE } from './demo-seed.data';
import { LegacyMatchMigrationService } from './legacy-match-migration.service';

@Injectable()
export class DemoSeedService implements OnModuleInit {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly legacyMigration: LegacyMatchMigrationService,
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<FavoriteDocument>,
    @InjectModel(Suggestion.name)
    private readonly suggestionModel: Model<SuggestionDocument>,
    @InjectModel(MatchRequest.name)
    private readonly matchRequestModel: Model<MatchRequestDocument>,
    @InjectModel(MatchCase.name)
    private readonly matchCaseModel: Model<MatchCaseDocument>,
  ) {}

  async onModuleInit() {
    await this.accountsService.seedDemoAccounts();
    await this.ensureDemoPersonShadchanLink();
    await this.ensureDemoPersonUnderShadchanResponsibility();
    await this.syncDemoShadchanReferences();
    await this.accountsService.syncShadchanLinksToProfiles();
    await this.legacyMigration.migrate();
    const existingProfiles = await this.profileModel.countDocuments();
    if (existingProfiles > 0) return;

    const personAccount = await this.accountModel.findOne({ email: 'Person' });
    const shadchanAccount = await this.accountModel.findOne({ email: 'Shadchan' });
    if (!personAccount || !shadchanAccount) return;

    for (const profile of DEMO_BROWSE_PROFILES) {
      const addedByShadchan = 'addedByShadchan' in profile && profile.addedByShadchan;
      const { profileId, firstName, lastName, city, heightCm, religiousStream, gender, maritalStatus, age, personalityTraits, hobbies, familyVision, lookingFor, references, photos } = profile;
      await this.profileModel.create({
        profileId,
        firstName,
        lastName,
        city,
        heightCm,
        religiousStream,
        gender,
        maritalStatus,
        age,
        personalityTraits: [...personalityTraits],
        hobbies: [...hobbies],
        familyVision,
        lookingFor: [...lookingFor],
        references: [...references],
        photos: [...photos],
        ownerAccountId: null,
        addedByShadchanId: addedByShadchan ? shadchanAccount.accountId : null,
      });
    }

    await this.profileModel.create({
      ...DEMO_PERSON_PROFILE,
      ownerAccountId: personAccount.accountId,
      addedByShadchanId: shadchanAccount.accountId,
    });

    personAccount.profileId = DEMO_PERSON_PROFILE.profileId;
    await personAccount.save();

    const fullRating = {
      personality: 4,
      hobbies: 5,
      familyVision: 4,
      lookingFor: 5,
      look: 4,
      averageRating: computeAverageRating({
        personality: 4,
        hobbies: 5,
        familyVision: 4,
        lookingFor: 5,
        look: 4,
      }),
    };

    await this.favoriteModel.insertMany([
      {
        favoriteId: 'fav-p1',
        ownerAccountId: personAccount.accountId,
        profileId: 'p1',
        rating: fullRating,
        requestId: null,
      },
      {
        favoriteId: 'fav-p2',
        ownerAccountId: personAccount.accountId,
        profileId: 'p2',
        rating: fullRating,
        requestId: null,
      },
    ]);

    const demoCases = this.legacyMigration.buildDemoMatchCases(
      personAccount.accountId,
      DEMO_PERSON_PROFILE.profileId,
      shadchanAccount.accountId,
    );
    await this.matchCaseModel.insertMany(demoCases);
  }

  private async ensureDemoPersonShadchanLink() {
    const personAccount = await this.accountModel.findOne({ email: 'Person' });
    const shadchanAccount = await this.accountModel.findOne({ email: 'Shadchan' });
    if (!personAccount || !shadchanAccount) return;

    const linkedIds = personAccount.linkedShadchanIds ?? [];
    if (linkedIds.includes(shadchanAccount.accountId)) return;

    personAccount.linkedShadchanIds = [...linkedIds, shadchanAccount.accountId];
    await personAccount.save();
  }

  private async ensureDemoPersonUnderShadchanResponsibility() {
    const personAccount = await this.accountModel.findOne({ email: 'Person' });
    const shadchanAccount = await this.accountModel.findOne({ email: 'Shadchan' });
    if (!personAccount || !shadchanAccount) return;

    await this.profileModel.updateOne(
      { profileId: DEMO_PERSON_PROFILE.profileId },
      { $set: { addedByShadchanId: shadchanAccount.accountId } },
    );
  }

  /** Keep demo suggestions/requests pointed at the current demo account IDs. */
  private async syncDemoShadchanReferences() {
    const personAccount = await this.accountModel.findOne({ email: 'Person' });
    const shadchanAccount = await this.accountModel.findOne({ email: 'Shadchan' });
    if (!personAccount || !shadchanAccount) return;

    const personAccountId = personAccount.accountId;
    const shadchanAccountId = shadchanAccount.accountId;

    await this.suggestionModel.updateMany(
      {
        $or: [
          { ownerAccountId: personAccountId },
          { suggestionId: { $in: ['sug-p1', 'sug-p3', 'sug-p4'] } },
        ],
      },
      {
        $set: {
          ownerAccountId: personAccountId,
          shadchanId: shadchanAccountId,
        },
      },
    );

    await this.matchRequestModel.updateMany(
      {
        $or: [
          { senderProfileId: DEMO_PERSON_PROFILE.profileId },
          { requestId: { $in: ['req-1', 'req-2'] } },
        ],
      },
      { $set: { shadchanId: shadchanAccountId } },
    );

    await this.profileModel.updateMany(
      {
        $or: [
          { profileId: DEMO_PERSON_PROFILE.profileId },
          { profileId: { $in: ['p3', 'p4'] } },
          { ownerAccountId: personAccountId },
        ],
      },
      { $set: { addedByShadchanId: shadchanAccountId } },
    );

    if (personAccount.profileId) {
      await this.profileModel.updateOne(
        { profileId: personAccount.profileId },
        { $addToSet: { shadchanIds: shadchanAccountId } },
      );
    }
  }
}
