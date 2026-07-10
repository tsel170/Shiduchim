import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  normalizeShidduchStatus,
  SHIDDUCH_STATUSES,
} from './constants/shidduch-workflow';
import {
  deriveInitiatedBy,
  deriveProfileStatusesFromLegacy,
  legacyStatusFromStage,
  stageFromLegacyStatus,
} from './domain/simplified-case-workflow';
import { MatchCase, MatchCaseDocument } from './schemas/match-case.schema';

type LegacyCaseDoc = {
  caseId: string;
  currentStatus?: string;
  initiatedBy?: string | null;
  tags?: string[];
  approvals?: Record<string, Date | null>;
  waitingFor?: string | null;
  participants?: unknown[];
  updatedAt?: Date;
  closedAt?: Date | null;
};

@Injectable()
export class ShidduchCaseMigrationService implements OnModuleInit {
  private readonly logger = new Logger(ShidduchCaseMigrationService.name);

  constructor(
    @InjectModel(MatchCase.name)
    private readonly matchCaseModel: Model<MatchCaseDocument>,
  ) {}

  async onModuleInit() {
    await this.migrateLegacyStatuses();
    await this.backfillSimplifiedFields();
    await this.removeLegacyWorkflowFields();
  }

  private async migrateLegacyStatuses() {
    const cases = await this.matchCaseModel.find({
      currentStatus: { $nin: [...SHIDDUCH_STATUSES] },
    });

    if (cases.length === 0) return;

    this.logger.log(`Migrating ${cases.length} match cases to Shidduch statuses`);

    for (const matchCase of cases) {
      const legacy = matchCase.currentStatus;
      matchCase.currentStatus = normalizeShidduchStatus(legacy);
      if (
        ['denied', 'cancelled', 'matched'].includes(matchCase.currentStatus) &&
        !matchCase.closedAt
      ) {
        matchCase.closedAt = matchCase.updatedAt ?? new Date();
      }
      await matchCase.save();
    }
  }

  private async backfillSimplifiedFields() {
    const rawCases = (await this.matchCaseModel.collection
      .find({})
      .toArray()) as unknown as LegacyCaseDoc[];

    const needsBackfill = rawCases.filter(
      (doc) =>
        !('stage' in doc) ||
        !('profileAStatus' in doc) ||
        !('profileBStatus' in doc) ||
        !('personBReleased' in doc),
    );

    if (needsBackfill.length === 0) return;

    this.logger.log(
      `Backfilling simplified workflow for ${needsBackfill.length} match cases`,
    );

    for (const raw of needsBackfill) {
      const matchCase = await this.matchCaseModel.findOne({ caseId: raw.caseId });
      if (!matchCase) continue;

      const initiatedBy = deriveInitiatedBy({
        initiatedBy: raw.initiatedBy ?? matchCase.initiatedBy,
        tags: raw.tags ?? matchCase.tags,
      });
      const stage = stageFromLegacyStatus(matchCase.currentStatus);
      const { profileAStatus, profileBStatus } = deriveProfileStatusesFromLegacy(
        matchCase.currentStatus,
        raw.approvals ?? {},
        initiatedBy,
      );

      const personBReleased =
        matchCase.personBReleased ??
        (initiatedBy === 'shadchan'
          ? !(profileAStatus === 'waiting' && profileBStatus === 'waiting')
          : matchCase.currentStatus !== 'sent_to_shadchan');

      matchCase.stage = stage;
      matchCase.profileAStatus = profileAStatus;
      matchCase.profileBStatus = profileBStatus;
      matchCase.personBReleased = personBReleased;
      matchCase.initiatedBy = initiatedBy;
      matchCase.currentStatus = legacyStatusFromStage(stage, {
        initiatedBy,
        personBReleased,
        profileAStatus,
        profileBStatus,
      });

      if (
        profileAStatus === 'denied' ||
        profileBStatus === 'denied' ||
        ['denied', 'cancelled', 'matched'].includes(matchCase.currentStatus)
      ) {
        if (!matchCase.closedAt) {
          matchCase.closedAt = matchCase.updatedAt ?? new Date();
        }
      }

      await matchCase.save();
    }
  }

  private async removeLegacyWorkflowFields() {
    const result = await this.matchCaseModel.collection.updateMany(
      {},
      { $unset: { waitingFor: '', approvals: '', participants: '' } },
    );
    if (result.modifiedCount > 0) {
      this.logger.log(
        `Removed legacy waitingFor/approvals/participants from ${result.modifiedCount} match cases`,
      );
    }
  }
}
