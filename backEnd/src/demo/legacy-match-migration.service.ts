import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument } from '../accounts/schemas/account.schema';
import {
  MatchRequest,
  MatchRequestDocument,
} from '../match-requests/schemas/match-request.schema';
import { Profile, ProfileDocument } from '../profiles/schemas/profile.schema';
import {
  Suggestion,
  SuggestionDocument,
} from '../suggestions/schemas/suggestion.schema';
import { MatchStatus } from '../match-cases/constants/match-status';
import { CaseHistory, CaseHistoryDocument } from '../match-cases/schemas/case-history.schema';
import { MatchCase, MatchCaseDocument } from '../match-cases/schemas/match-case.schema';
import { DEMO_PERSON_PROFILE } from './demo-seed.data';

const SHADCHAN_PUSH_TAG = 'shadchan-push';
const LEGACY_SUGGESTION_PREFIX = 'legacy-sug-';
const LEGACY_REQUEST_PREFIX = 'legacy-req-';

@Injectable()
export class LegacyMatchMigrationService {
  constructor(
    @InjectModel(MatchCase.name)
    private readonly matchCaseModel: Model<MatchCaseDocument>,
    @InjectModel(CaseHistory.name)
    private readonly caseHistoryModel: Model<CaseHistoryDocument>,
    @InjectModel(Suggestion.name)
    private readonly suggestionModel: Model<SuggestionDocument>,
    @InjectModel(MatchRequest.name)
    private readonly matchRequestModel: Model<MatchRequestDocument>,
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
  ) {}

  async migrate() {
    await this.migrateSuggestions();
    await this.migrateMatchRequests();
  }

  private async migrateSuggestions() {
    const suggestions = await this.suggestionModel.find().lean();
    for (const suggestion of suggestions) {
      const caseId = `${LEGACY_SUGGESTION_PREFIX}${suggestion.suggestionId}`;
      const exists = await this.matchCaseModel.findOne({ caseId });
      if (exists) continue;

      const ownerAccount = await this.accountModel.findOne({
        accountId: suggestion.ownerAccountId,
      });
      if (!ownerAccount?.profileId) continue;

      const duplicate = await this.matchCaseModel.findOne({
        senderAccountId: suggestion.ownerAccountId,
        targetProfileId: suggestion.profileId,
        assignedShadchanId: suggestion.shadchanId,
        currentStatus: { $nin: ['closed', 'cancelled', 'rejected'] },
      });
      if (duplicate) continue;

      const currentStatus = this.mapSuggestionStatus(suggestion);
      const tags = [SHADCHAN_PUSH_TAG];

      await this.matchCaseModel.create({
        caseId,
        senderProfileId: ownerAccount.profileId,
        targetProfileId: suggestion.profileId,
        senderAccountId: suggestion.ownerAccountId,
        targetAccountId: null,
        assignedShadchanId: suggestion.shadchanId,
        currentStatus,
        priority: 'normal',
        tags,
        internalNotes: suggestion.shadchanNote ?? '',
        closedAt: ['rejected', 'matched', 'closed'].includes(currentStatus)
          ? suggestion.personRespondedAt ?? suggestion.sentAt
          : null,
        createdAt: suggestion.sentAt,
        updatedAt: suggestion.personRespondedAt ?? suggestion.sentAt,
      });

      await this.caseHistoryModel.create({
        historyId: `${caseId}-created`,
        caseId,
        action: 'Created',
        newStatus: currentStatus,
        changedByAccountId: suggestion.shadchanId,
        timestamp: suggestion.sentAt,
        note: `מיגרציה מהצעה: ${suggestion.shadchanNote ?? ''}`.trim(),
      });
    }
  }

  private async migrateMatchRequests() {
    const requests = await this.matchRequestModel.find().lean();
    for (const request of requests) {
      const caseId = `${LEGACY_REQUEST_PREFIX}${request.requestId}`;
      const exists = await this.matchCaseModel.findOne({ caseId });
      if (exists) continue;

      if (!request.senderProfileId) continue;

      const senderProfile = await this.profileModel.findOne({
        profileId: request.senderProfileId,
      });
      const senderAccountId = senderProfile?.ownerAccountId;
      if (!senderAccountId) continue;

      const duplicate = await this.matchCaseModel.findOne({
        senderAccountId,
        targetProfileId: request.targetProfileId,
        assignedShadchanId: request.shadchanId,
        currentStatus: { $nin: ['closed', 'cancelled', 'rejected'] },
      });
      if (duplicate) continue;

      await this.matchCaseModel.create({
        caseId,
        senderProfileId: request.senderProfileId,
        targetProfileId: request.targetProfileId,
        senderAccountId,
        targetAccountId: null,
        assignedShadchanId: request.shadchanId,
        currentStatus: 'waiting_for_other_side',
        stage: 'profile_check',
        profileAStatus: 'approved',
        profileBStatus: 'waiting',
        personBReleased: true,
        initiatedBy: 'person',
        priority: 'normal',
        tags: ['person-request'],
        internalNotes: request.notes ?? '',
        closedAt: null,
        createdAt: request.createdAt ?? new Date(),
        updatedAt: request.updatedAt ?? new Date(),
      });

      await this.caseHistoryModel.create({
        historyId: `${caseId}-created`,
        caseId,
        action: 'Created',
        newStatus: 'pending',
        changedByAccountId: senderAccountId,
        timestamp: request.createdAt ?? new Date(),
        note: `מיגרציה מבקשה: ${request.notes ?? ''}`.trim(),
      });
    }
  }

  private mapSuggestionStatus(suggestion: {
    stage: string;
    personResponse?: string | null;
  }): string {
    if (suggestion.personResponse === 'not_interested') return 'denied';
    if (suggestion.stage === 'checked') return 'matched';
    if (suggestion.stage === 'in_check' || suggestion.personResponse === 'interested') {
      return 'background_check';
    }
    return 'waiting_for_other_side';
  }

  /** Demo seed helper — same shape as migrated shadchan suggestions. */
  buildDemoMatchCases(
    personAccountId: string,
    personProfileId: string,
    shadchanAccountId: string,
  ) {
    return [
      {
        caseId: 'case-sug-p3',
        senderProfileId: personProfileId,
        targetProfileId: 'p3',
        senderAccountId: personAccountId,
        targetAccountId: null,
        assignedShadchanId: shadchanAccountId,
        currentStatus: 'waiting_for_other_side',
        stage: 'profile_check',
        profileAStatus: 'approved',
        profileBStatus: 'waiting',
        personBReleased: true,
        initiatedBy: 'person',
        priority: 'normal',
        tags: [SHADCHAN_PUSH_TAG],
        internalNotes: 'חשבתי שזה יכול להתאים לך — שווה לבדוק.',
        closedAt: null,
        createdAt: new Date('2026-06-02'),
        updatedAt: new Date('2026-06-02'),
      },
      {
        caseId: 'case-sug-p4',
        senderProfileId: personProfileId,
        targetProfileId: 'p4',
        senderAccountId: personAccountId,
        targetAccountId: null,
        assignedShadchanId: shadchanAccountId,
        currentStatus: 'waiting_for_other_side',
        stage: 'profile_check',
        profileAStatus: 'approved',
        profileBStatus: 'waiting',
        personBReleased: true,
        initiatedBy: 'person',
        priority: 'normal',
        tags: [SHADCHAN_PUSH_TAG],
        internalNotes: 'פרופיל מומלץ מהמאגר שלי.',
        closedAt: null,
        createdAt: new Date('2026-06-01'),
        updatedAt: new Date('2026-06-01'),
      },
      {
        caseId: 'case-sug-p1',
        senderProfileId: personProfileId,
        targetProfileId: 'p1',
        senderAccountId: personAccountId,
        targetAccountId: null,
        assignedShadchanId: shadchanAccountId,
        currentStatus: 'background_check',
        stage: 'background_check',
        profileAStatus: 'waiting',
        profileBStatus: 'waiting',
        personBReleased: true,
        initiatedBy: 'shadchan',
        priority: 'normal',
        tags: [SHADCHAN_PUSH_TAG],
        internalNotes: 'שלחתי את הפרופיל שלך לבדיקה.',
        closedAt: null,
        createdAt: new Date('2026-05-28'),
        updatedAt: new Date('2026-05-28'),
      },
      {
        caseId: 'case-req-2',
        senderProfileId: DEMO_PERSON_PROFILE.profileId,
        targetProfileId: 'p2',
        senderAccountId: personAccountId,
        targetAccountId: null,
        assignedShadchanId: shadchanAccountId,
        currentStatus: 'sent_to_shadchan',
        stage: 'profile_check',
        profileAStatus: 'approved',
        profileBStatus: 'waiting',
        personBReleased: false,
        initiatedBy: 'person',
        priority: 'normal',
        tags: ['person-request'],
        internalNotes: 'נשלח דרך "שלח לשדכן".',
        closedAt: null,
        createdAt: new Date('2026-05-26'),
        updatedAt: new Date('2026-05-26'),
      },
    ];
  }
}
