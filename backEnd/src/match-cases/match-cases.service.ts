import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountsService } from '../accounts/accounts.service';
import { AuthUserPayload } from '../auth/types/auth-user.payload';
import { generateId } from '../common/utils/generate-id';
import { ProfilesService } from '../profiles/profiles.service';
import {
  CaseHistoryAction,
  MatchStatus,
  isReopenTransition,
  isShadchanTransitionAllowed,
  resolvePersonActionTransition,
} from './constants/match-status';
import {
  CreateMatchCaseDto,
  ListMatchCasesQueryDto,
  UpdateMatchCaseDto,
} from './dto/match-case.dto';
import { CaseHistory, CaseHistoryDocument } from './schemas/case-history.schema';
import { MatchCase, MatchCaseDocument } from './schemas/match-case.schema';

@Injectable()
export class MatchCasesService {
  constructor(
    @InjectModel(MatchCase.name)
    private readonly matchCaseModel: Model<MatchCaseDocument>,
    @InjectModel(CaseHistory.name)
    private readonly caseHistoryModel: Model<CaseHistoryDocument>,
    private readonly profilesService: ProfilesService,
    private readonly accountsService: AccountsService,
  ) {}

  async create(user: AuthUserPayload, dto: CreateMatchCaseDto) {
    const senderProfile = await this.profilesService.findOne(dto.senderProfileId);
    const targetProfile = await this.profilesService.findOne(dto.targetProfileId);

    if (dto.senderProfileId === dto.targetProfileId) {
      throw new BadRequestException('לא ניתן לפתוח תיק שידוך לאותו פרופיל');
    }

    const shadchan = await this.accountsService.findOne(dto.assignedShadchanId);
    if (shadchan.role !== 'shadchan') {
      throw new NotFoundException('שדכן לא נמצא במערכת');
    }

    let senderAccountId: string;
    let targetAccountId: string | null;

    if (user.role === 'person') {
      if (senderProfile.ownerAccountId !== user.accountId) {
        throw new ForbiddenException('ניתן לפתוח תיק רק עם הפרופיל האישי שלך');
      }
      senderAccountId = user.accountId;
      targetAccountId = await this.accountsService.findPersonAccountIdForProfile({
        profileId: targetProfile.profileId,
        ownerAccountId: targetProfile.ownerAccountId ?? null,
      });
    } else {
      if (user.accountId !== dto.assignedShadchanId) {
        throw new ForbiddenException('שדכן יכול ליצור תיק רק עבור עצמו');
      }
      senderAccountId =
        senderProfile.ownerAccountId ??
        (await this.accountsService.findPersonAccountIdForProfile({
          profileId: senderProfile.profileId,
          ownerAccountId: senderProfile.ownerAccountId ?? null,
        })) ??
        '';
      if (!senderAccountId) {
        throw new BadRequestException('לפרופיל השולח אין חשבון משתמש');
      }
      targetAccountId = await this.accountsService.findPersonAccountIdForProfile({
        profileId: targetProfile.profileId,
        ownerAccountId: targetProfile.ownerAccountId ?? null,
      });
      if (!targetAccountId) {
        throw new BadRequestException('לפרופיל היעד אין חשבון משתמש');
      }
    }

    const duplicate = await this.matchCaseModel.findOne({
      senderAccountId,
      targetProfileId: dto.targetProfileId,
      assignedShadchanId: dto.assignedShadchanId,
      currentStatus: { $nin: ['closed', 'cancelled', 'rejected'] },
    });
    if (duplicate) {
      throw new ConflictException('כבר קיים תיק שידוך פעיל עבור שילוב זה');
    }

    const matchCase = await this.matchCaseModel.create({
      caseId: generateId(),
      senderProfileId: dto.senderProfileId,
      targetProfileId: dto.targetProfileId,
      senderAccountId,
      targetAccountId,
      assignedShadchanId: dto.assignedShadchanId,
      currentStatus: 'pending',
      priority: dto.priority ?? 'normal',
      tags: dto.tags ?? [],
      internalNotes: '',
      closedAt: null,
    });

    await this.appendHistory({
      caseId: matchCase.caseId,
      action: 'Created',
      newStatus: 'pending',
      changedByAccountId: user.accountId,
      note: dto.note?.trim() || undefined,
    });

    return this.toEnrichedResponse(matchCase);
  }

  async findAll(user: AuthUserPayload, query: ListMatchCasesQueryDto) {
    const filter: Record<string, unknown> = {};
    const andConditions: Record<string, unknown>[] = [];

    if (user.role === 'person') {
      andConditions.push({
        $or: [
          { senderAccountId: user.accountId },
          { targetAccountId: user.accountId },
        ],
      });
    } else {
      filter.assignedShadchanId = query.assignedShadchanId ?? user.accountId;
    }

    if (query.status) filter.currentStatus = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.tag) filter.tags = query.tag;

    if (query.profileId) {
      andConditions.push({
        $or: [
          { senderProfileId: query.profileId },
          { targetProfileId: query.profileId },
        ],
      });
    }

    if (andConditions.length === 1) {
      Object.assign(filter, andConditions[0]);
    } else if (andConditions.length > 1) {
      filter.$and = andConditions;
    }

    const sort: Record<string, 1 | -1> =
      query.sort === 'oldest'
        ? { createdAt: 1 }
        : query.sort === 'updated'
          ? { updatedAt: -1 }
          : { createdAt: -1 };

    const cases = await this.matchCaseModel.find(filter).sort(sort);
    return Promise.all(cases.map((matchCase) => this.toEnrichedResponse(matchCase)));
  }

  async findOne(user: AuthUserPayload, caseId: string) {
    const matchCase = await this.findCaseOrThrow(caseId);
    this.assertCanView(user, matchCase);
    return this.toEnrichedResponse(matchCase);
  }

  async update(user: AuthUserPayload, caseId: string, dto: UpdateMatchCaseDto) {
    if (user.role !== 'shadchan') {
      throw new ForbiddenException('רק שדכן/ית יכול/ה לעדכן תיק שידוך');
    }

    const matchCase = await this.findCaseOrThrow(caseId);
    this.assertShadchanAssigned(user, matchCase);

    const previousStatus = matchCase.currentStatus as MatchStatus;
    let historyAction: CaseHistoryAction = 'Note Added';
    let historyNote = dto.note?.trim();

    if (dto.assignedShadchanId && dto.assignedShadchanId !== matchCase.assignedShadchanId) {
      const newShadchan = await this.accountsService.findOne(dto.assignedShadchanId);
      if (newShadchan.role !== 'shadchan') {
        throw new NotFoundException('שדכן לא נמצא במערכת');
      }
      const wasAssigned = matchCase.assignedShadchanId;
      matchCase.assignedShadchanId = dto.assignedShadchanId;
      await this.appendHistory({
        caseId: matchCase.caseId,
        action: wasAssigned ? 'Reassigned' : 'Assigned',
        changedByAccountId: user.accountId,
        note: historyNote,
      });
    }

    if (dto.currentStatus && dto.currentStatus !== matchCase.currentStatus) {
      const nextStatus = dto.currentStatus as MatchStatus;
      this.assertShadchanStatusTransition(previousStatus, nextStatus);
      matchCase.currentStatus = nextStatus;
      matchCase.closedAt = nextStatus === 'closed' ? new Date() : null;
      historyAction = isReopenTransition(previousStatus, nextStatus)
        ? 'Reopened'
        : nextStatus === 'closed'
          ? 'Closed'
          : 'Status Changed';
      await this.appendHistory({
        caseId: matchCase.caseId,
        action: historyAction,
        previousStatus,
        newStatus: nextStatus,
        changedByAccountId: user.accountId,
        note: historyNote,
      });
      historyNote = undefined;
    }

    if (dto.priority !== undefined) matchCase.priority = dto.priority;
    if (dto.tags !== undefined) matchCase.tags = dto.tags;
    if (dto.internalNotes !== undefined) {
      matchCase.internalNotes = dto.internalNotes;
      if (!dto.currentStatus && historyNote) {
        await this.appendHistory({
          caseId: matchCase.caseId,
          action: 'Note Added',
          changedByAccountId: user.accountId,
          note: historyNote,
        });
      }
    } else if (historyNote && !dto.currentStatus && !dto.assignedShadchanId) {
      await this.appendHistory({
        caseId: matchCase.caseId,
        action: 'Note Added',
        changedByAccountId: user.accountId,
        note: historyNote,
      });
    }

    await matchCase.save();
    return this.toEnrichedResponse(matchCase);
  }

  async applyPersonAction(
    user: AuthUserPayload,
    caseId: string,
    action: 'interested' | 'not_interested',
  ) {
    if (user.role !== 'person') {
      throw new ForbiddenException('רק משודך/ת יכול/ה לבצע פעולה זו');
    }

    const matchCase = await this.findCaseOrThrow(caseId);
    this.assertPersonParticipant(user, matchCase);

    const previousStatus = matchCase.currentStatus as MatchStatus;
    const nextStatus = resolvePersonActionTransition(previousStatus, action);
    if (!nextStatus) {
      throw new BadRequestException('לא ניתן לבצע פעולה זו בסטטוס הנוכחי');
    }

    if (nextStatus === previousStatus) {
      return this.toEnrichedResponse(matchCase);
    }

    matchCase.currentStatus = nextStatus;
    if (nextStatus === 'rejected') {
      matchCase.closedAt = new Date();
    }

    await matchCase.save();
    await this.appendHistory({
      caseId: matchCase.caseId,
      action: 'Status Changed',
      previousStatus,
      newStatus: nextStatus,
      changedByAccountId: user.accountId,
      note: action === 'interested' ? 'מעוניין/ת' : 'לא מעוניין/ת',
    });

    return this.toEnrichedResponse(matchCase);
  }

  /** Soft close — history preserved, never hard delete. */
  async close(user: AuthUserPayload, caseId: string, note?: string) {
    if (user.role !== 'shadchan') {
      throw new ForbiddenException('רק שדכן/ית יכול/ה לסגור תיק');
    }

    const matchCase = await this.findCaseOrThrow(caseId);
    this.assertShadchanAssigned(user, matchCase);

    const previousStatus = matchCase.currentStatus as MatchStatus;
    if (previousStatus === 'closed') {
      return this.toEnrichedResponse(matchCase);
    }

    matchCase.currentStatus = 'closed';
    matchCase.closedAt = new Date();
    await matchCase.save();

    await this.appendHistory({
      caseId: matchCase.caseId,
      action: 'Closed',
      previousStatus,
      newStatus: 'closed',
      changedByAccountId: user.accountId,
      note: note?.trim(),
    });

    return this.toEnrichedResponse(matchCase);
  }

  async getHistory(user: AuthUserPayload, caseId: string) {
    const matchCase = await this.findCaseOrThrow(caseId);
    this.assertCanView(user, matchCase);

    const entries = await this.caseHistoryModel
      .find({ caseId })
      .sort({ timestamp: -1 });

    return entries.map((entry) => this.toHistoryResponse(entry));
  }

  async getProfileCaseContext(user: AuthUserPayload, profileId: string) {
    if (user.role !== 'person') {
      return { hasCase: false as const };
    }

    const terminalStatuses: MatchStatus[] = ['closed', 'cancelled', 'rejected', 'matched'];

    const matchCase = await this.matchCaseModel
      .findOne({
        currentStatus: { $nin: terminalStatuses },
        $or: [
          { senderAccountId: user.accountId, targetProfileId: profileId },
          { targetAccountId: user.accountId, senderProfileId: profileId },
        ],
      })
      .sort({ updatedAt: -1 });

    if (!matchCase) {
      return { hasCase: false as const };
    }

    return {
      hasCase: true as const,
      matchCase: await this.toEnrichedResponse(matchCase),
    };
  }

  async getProfileStatuses(user: AuthUserPayload, profileIds: string[]) {
    const uniqueIds = [...new Set(profileIds.filter(Boolean))];
    if (uniqueIds.length === 0) return [];

    const visibilityFilter =
      user.role === 'person'
        ? {
            $or: [
              { senderAccountId: user.accountId },
              { targetAccountId: user.accountId },
            ],
          }
        : { assignedShadchanId: user.accountId };

    const cases = await this.matchCaseModel
      .find({
        ...visibilityFilter,
        $or: [
          { senderProfileId: { $in: uniqueIds } },
          { targetProfileId: { $in: uniqueIds } },
        ],
      })
      .sort({ updatedAt: -1 });

    const latestByProfile = new Map<
      string,
      { caseId: string; currentStatus: string; updatedAt: Date }
    >();

    for (const matchCase of cases) {
      const counterpartyProfileId = this.getCounterpartyProfileId(user, matchCase);
      if (!counterpartyProfileId || !uniqueIds.includes(counterpartyProfileId)) continue;
      if (latestByProfile.has(counterpartyProfileId)) continue;
      latestByProfile.set(counterpartyProfileId, {
        caseId: matchCase.caseId,
        currentStatus: matchCase.currentStatus,
        updatedAt: matchCase.updatedAt,
      });
    }

    return uniqueIds.map((profileId) => {
      const latest = latestByProfile.get(profileId);
      return {
        profileId,
        currentStatus: latest?.currentStatus ?? null,
        caseId: latest?.caseId ?? null,
        updatedAt: latest?.updatedAt ?? null,
      };
    });
  }

  private getCounterpartyProfileId(
    user: AuthUserPayload,
    matchCase: MatchCaseDocument,
  ): string | null {
    if (user.role === 'shadchan') {
      return null;
    }
    if (matchCase.senderAccountId === user.accountId) {
      return matchCase.targetProfileId;
    }
    if (matchCase.targetAccountId === user.accountId) {
      return matchCase.senderProfileId;
    }
    return null;
  }

  private assertShadchanStatusTransition(from: MatchStatus, to: MatchStatus) {
    if (!isShadchanTransitionAllowed(from, to)) {
      throw new BadRequestException(
        `מעבר סטטוס לא חוקי: ${from} → ${to}`,
      );
    }
  }

  private assertCanView(user: AuthUserPayload, matchCase: MatchCaseDocument) {
    if (user.role === 'shadchan') {
      this.assertShadchanAssigned(user, matchCase);
      return;
    }
    this.assertPersonParticipant(user, matchCase);
  }

  private assertShadchanAssigned(user: AuthUserPayload, matchCase: MatchCaseDocument) {
    if (matchCase.assignedShadchanId !== user.accountId) {
      throw new ForbiddenException('אין הרשאה לתיק שידוך זה');
    }
  }

  private assertPersonParticipant(user: AuthUserPayload, matchCase: MatchCaseDocument) {
    const isSender = matchCase.senderAccountId === user.accountId;
    const isTarget = matchCase.targetAccountId === user.accountId;
    if (!isSender && !isTarget) {
      throw new ForbiddenException('אין הרשאה לתיק שידוך זה');
    }
  }

  private async findCaseOrThrow(caseId: string) {
    const matchCase = await this.matchCaseModel.findOne({ caseId });
    if (!matchCase) {
      throw new NotFoundException(`תיק שידוך "${caseId}" לא נמצא`);
    }
    return matchCase;
  }

  private async appendHistory(input: {
    caseId: string;
    action: CaseHistoryAction;
    previousStatus?: MatchStatus;
    newStatus?: MatchStatus;
    changedByAccountId: string;
    note?: string;
  }) {
    await this.caseHistoryModel.create({
      historyId: generateId(),
      caseId: input.caseId,
      action: input.action,
      previousStatus: input.previousStatus,
      newStatus: input.newStatus,
      changedByAccountId: input.changedByAccountId,
      timestamp: new Date(),
      note: input.note,
    });
  }

  private async toEnrichedResponse(matchCase: MatchCaseDocument) {
    const [senderProfile, targetProfile] = await Promise.all([
      this.profilesService.findOne(matchCase.senderProfileId),
      this.profilesService.findOne(matchCase.targetProfileId),
    ]);

    return {
      caseId: matchCase.caseId,
      senderProfileId: matchCase.senderProfileId,
      targetProfileId: matchCase.targetProfileId,
      senderAccountId: matchCase.senderAccountId,
      targetAccountId: matchCase.targetAccountId,
      assignedShadchanId: matchCase.assignedShadchanId,
      currentStatus: matchCase.currentStatus,
      priority: matchCase.priority,
      tags: matchCase.tags ?? [],
      internalNotes: matchCase.internalNotes ?? '',
      createdAt: matchCase.createdAt,
      updatedAt: matchCase.updatedAt,
      closedAt: matchCase.closedAt ?? null,
      senderProfile,
      targetProfile,
    };
  }

  private toHistoryResponse(entry: CaseHistoryDocument) {
    return {
      historyId: entry.historyId,
      caseId: entry.caseId,
      action: entry.action,
      previousStatus: entry.previousStatus,
      newStatus: entry.newStatus,
      changedByAccountId: entry.changedByAccountId,
      timestamp: entry.timestamp,
      note: entry.note,
    };
  }
}
