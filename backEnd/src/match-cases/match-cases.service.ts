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
import { CaseEventBus } from './case-event-bus.service';
import {
  canViewContactDetails,
  CaseHistoryAction,
  normalizeShidduchStatus,
  ShidduchStatus,
  TERMINAL_SHIDDUCH_STATUSES,
} from './constants/shidduch-workflow';
import { CASE_DOMAIN_EVENTS } from './domain/domain-events';
import { DenialReason, denialReasonLabel } from './domain/denial-reason';
import {
  applyApprove,
  applyDeny,
  applyShadchanAdvance,
  accountIdForSlot,
  canPersonAct,
  canShadchanActForSlot,
  canShadchanAdvanceStage,
  CaseStage,
  computeViewerContext as computeSimplifiedViewerContext,
  deriveInitiatedBy,
  initialStateForCreate,
  isCaseClosed,
  isVisibleToAccount,
  legacyStatusFromStage,
  PersonSlot as SimpleSlot,
  ProfileDecision,
  SimplifiedCaseState,
  slotForAccountId,
  stageFromLegacyStatus,
  STAGE_LABELS,
} from './domain/simplified-case-workflow';
import { PersonSlot } from './domain/case-participant.types';
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
    private readonly caseEventBus: CaseEventBus,
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
        targetAccountId = null;
      }
    }

    const duplicate = await this.matchCaseModel.findOne({
      senderAccountId,
      targetProfileId: dto.targetProfileId,
      assignedShadchanId: dto.assignedShadchanId,
      currentStatus: { $nin: [...TERMINAL_SHIDDUCH_STATUSES] },
    });
    if (duplicate) {
      throw new ConflictException('כבר קיים תיק שידוך פעיל עבור שילוב זה');
    }

    const tags = [...(dto.tags ?? [])];
    if (user.role === 'shadchan' && !tags.includes('shadchan-push')) {
      tags.push('shadchan-push');
    }

    const initiatedBy = user.role === 'shadchan' ? 'shadchan' : 'person';

    const initial = initialStateForCreate(initiatedBy);
    const legacyStatus = legacyStatusFromStage(initial.stage, {
      initiatedBy,
      personBReleased: initial.personBReleased,
      profileAStatus: initial.profileAStatus,
      profileBStatus: initial.profileBStatus,
    });

    const matchCase = await this.matchCaseModel.create({
      caseId: generateId(),
      senderProfileId: dto.senderProfileId,
      targetProfileId: dto.targetProfileId,
      senderAccountId,
      targetAccountId,
      assignedShadchanId: dto.assignedShadchanId,
      stage: initial.stage,
      profileAStatus: initial.profileAStatus,
      profileBStatus: initial.profileBStatus,
      personBReleased: initial.personBReleased,
      currentStatus: legacyStatus,
      initiatedBy,
      priority: dto.priority ?? 'normal',
      tags,
      internalNotes: dto.note?.trim() ?? '',
      closedAt: null,
    });

    await this.appendHistory({
      caseId: matchCase.caseId,
      action: 'Case Created',
      newStatus: normalizeShidduchStatus(legacyStatus),
      changedByAccountId: user.accountId,
      note: dto.note?.trim() || 'נשלח לשדכן',
    });
    await this.appendHistory({
      caseId: matchCase.caseId,
      action: 'Profile Sent',
      newStatus: normalizeShidduchStatus(legacyStatus),
      changedByAccountId: user.accountId,
    });

    this.caseEventBus.emit({
      type: CASE_DOMAIN_EVENTS.CASE_CREATED,
      caseId: matchCase.caseId,
      occurredAt: new Date(),
      payload: { initiatedBy },
    });
    this.caseEventBus.emit({
      type: CASE_DOMAIN_EVENTS.APPROVAL_REQUIRED,
      caseId: matchCase.caseId,
      occurredAt: new Date(),
    });

    return this.toEnrichedResponse(matchCase, user);
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
    if (query.stage) filter.stage = query.stage;
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
    const visible =
      user.role === 'person'
        ? cases.filter((matchCase) =>
            isVisibleToAccount(this.toSimplifiedState(matchCase), user.accountId),
          )
        : cases;
    return Promise.all(visible.map((matchCase) => this.toEnrichedResponse(matchCase, user)));
  }

  async findOne(user: AuthUserPayload, caseId: string) {
    const matchCase = await this.findCaseOrThrow(caseId);
    this.assertCanView(user, matchCase);
    return this.toEnrichedResponse(matchCase, user);
  }

  async update(user: AuthUserPayload, caseId: string, dto: UpdateMatchCaseDto) {
    if (user.role !== 'shadchan') {
      throw new ForbiddenException('רק שדכן/ית יכול/ה לעדכן תיק שידוך');
    }

    const matchCase = await this.findCaseOrThrow(caseId);
    this.assertShadchanAssigned(user, matchCase);

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

    if (dto.priority !== undefined) matchCase.priority = dto.priority;
    if (dto.tags !== undefined) matchCase.tags = dto.tags;
    if (dto.internalNotes !== undefined) {
      matchCase.internalNotes = dto.internalNotes;
      if (!dto.currentStatus && historyNote) {
        await this.appendHistory({
          caseId: matchCase.caseId,
          action: 'Notes Added',
          changedByAccountId: user.accountId,
          note: historyNote,
        });
      }
    } else if (historyNote && !dto.currentStatus && !dto.assignedShadchanId) {
      await this.appendHistory({
        caseId: matchCase.caseId,
        action: 'Notes Added',
        changedByAccountId: user.accountId,
        note: historyNote,
      });
    }

    await matchCase.save();
    return this.toEnrichedResponse(matchCase, user);
  }

  async applyPersonAction(
    user: AuthUserPayload,
    caseId: string,
    action: 'interested' | 'not_interested',
    denialReason?: DenialReason,
    note?: string,
  ) {
    if (user.role !== 'person') {
      throw new ForbiddenException('רק משודך/ת יכול/ה לבצע פעולה זו');
    }

    if (action === 'not_interested' && !denialReason) {
      denialReason = 'NotInterested';
    }

    return this.applyCaseAction(user, caseId, {
      type: action === 'interested' ? 'approve' : 'deny',
      denialReason,
      note,
    });
  }

  async applyCaseAction(
    user: AuthUserPayload,
    caseId: string,
    input: {
      type: 'approve' | 'deny' | 'approve_for' | 'release_to_person_b' | 'advance_stage';
      slot?: SimpleSlot | 'PersonA' | 'PersonB';
      denialReason?: DenialReason;
      note?: string;
    },
  ) {
    const matchCase = await this.findCaseOrThrow(caseId);
    const state = this.toSimplifiedState(matchCase);
    const previousStage = state.stage;

    if (input.type === 'release_to_person_b') {
      if (user.role !== 'shadchan') {
        throw new ForbiddenException('רק שדכן/ית יכול/ה לשלוח הצעה לצד ב׳');
      }
      this.assertShadchanAssigned(user, matchCase);
      if (
        state.initiatedBy !== 'person' ||
        state.personBReleased ||
        state.stage !== 'profile_check'
      ) {
        throw new BadRequestException('לא ניתן לשלוח את ההצעה לצד ב׳ כעת');
      }
      matchCase.personBReleased = true;
      this.syncLegacyFields(matchCase);
      await matchCase.save();
      await this.appendHistory({
        caseId: matchCase.caseId,
        action: 'Profile Sent',
        changedByAccountId: user.accountId,
        note: 'ההצעה נשלחה לצד ב׳',
        actorSlot: 'Shadchan',
      });
      return this.toEnrichedResponse(matchCase, user);
    }

    if (input.type === 'advance_stage') {
      if (user.role !== 'shadchan') {
        throw new ForbiddenException('רק שדכן/ית יכול/ה לקדם שלב');
      }
      this.assertShadchanAssigned(user, matchCase);
      if (!canShadchanAdvanceStage(state)) {
        throw new BadRequestException(
          'ניתן לקדם שלב רק לאחר ששני הצדדים אישרו',
        );
      }
      return this.applyShadchanAdvanceStage(user, matchCase, previousStage);
    }

    const simpleSlot = this.normalizeActionSlot(input.slot, user, matchCase);

    if (input.type === 'approve_for') {
      if (user.role !== 'shadchan') {
        throw new ForbiddenException('רק שדכן/ית יכול/ה לאשר בשם משתתף');
      }
      this.assertShadchanAssigned(user, matchCase);
      if (!simpleSlot || !canShadchanActForSlot(state, simpleSlot)) {
        throw new BadRequestException(
          'ניתן לאשר בשם משתתף רק כשאין לו חשבון במערכת',
        );
      }
      return this.applySimplifiedApprove(user, matchCase, simpleSlot, previousStage);
    }

    if (input.type === 'deny') {
      if (!input.denialReason) {
        throw new BadRequestException('יש לבחור סיבת דחייה');
      }
      if (user.role === 'person') {
        this.assertPersonParticipant(user, matchCase);
        if (!canPersonAct(state, user.accountId)) {
          throw new BadRequestException('לא ניתן לדחות בשלב הנוכחי');
        }
      } else {
        this.assertShadchanAssigned(user, matchCase);
        if (!simpleSlot) {
          throw new BadRequestException('יש לציין משתתף לדחייה');
        }
        if (accountIdForSlot(state, simpleSlot)) {
          throw new BadRequestException('לא ניתן לדחות בשם משתתף עם חשבון');
        }
      }

      const slot =
        user.role === 'shadchan'
          ? simpleSlot!
          : slotForAccountId(state, user.accountId)!;
      const denied = applyDeny(state, slot);
      matchCase.profileAStatus = denied.profileAStatus;
      matchCase.profileBStatus = denied.profileBStatus;
      matchCase.closedAt = denied.closedAt;
      matchCase.denialReason = input.denialReason;
      matchCase.denialNote = input.note?.trim() ?? null;
      this.syncLegacyFields(matchCase);
      await matchCase.save();
      await this.appendHistory({
        caseId: matchCase.caseId,
        action: 'Denied',
        previousStatus: normalizeShidduchStatus(matchCase.currentStatus),
        newStatus: 'denied',
        changedByAccountId: user.accountId,
        note: input.note?.trim() || denialReasonLabel(input.denialReason),
        denialReason: input.denialReason,
        actorSlot: user.role === 'shadchan' ? 'Shadchan' : this.historySlot(slot),
        onBehalfOfSlot: user.role === 'shadchan' ? this.historySlot(slot) : undefined,
      });
      this.caseEventBus.emit({
        type: CASE_DOMAIN_EVENTS.CASE_DENIED,
        caseId: matchCase.caseId,
        occurredAt: new Date(),
      });
      return this.toEnrichedResponse(matchCase, user);
    }

    // approve
    if (user.role !== 'person') {
      throw new ForbiddenException('רק משודך/ת יכול/ה לאשר');
    }
    this.assertPersonParticipant(user, matchCase);
    const slot = slotForAccountId(state, user.accountId);
    if (!slot || !canPersonAct(state, user.accountId)) {
      throw new BadRequestException('לא ניתן לאשר בשלב הנוכחי');
    }
    return this.applySimplifiedApprove(user, matchCase, slot, previousStage);
  }

  private async applySimplifiedApprove(
    user: AuthUserPayload,
    matchCase: MatchCaseDocument,
    slot: SimpleSlot,
    previousStage: CaseStage,
  ) {
    const state = this.toSimplifiedState(matchCase);
    const result = applyApprove(state, slot);
    matchCase.profileAStatus = result.profileAStatus;
    matchCase.profileBStatus = result.profileBStatus;
    this.syncLegacyFields(matchCase);
    await matchCase.save();

    await this.appendHistory({
      caseId: matchCase.caseId,
      action: 'Accepted By Other Side',
      previousStatus: normalizeShidduchStatus(
        legacyStatusFromStage(previousStage, state),
      ),
      newStatus: normalizeShidduchStatus(matchCase.currentStatus),
      changedByAccountId: user.accountId,
      note: 'אישור',
      actorSlot: user.role === 'shadchan' ? 'Shadchan' : this.historySlot(slot),
      onBehalfOfSlot: user.role === 'shadchan' ? this.historySlot(slot) : undefined,
    });

    if (
      result.profileAStatus === 'approved' &&
      result.profileBStatus === 'approved'
    ) {
      this.caseEventBus.emit({
        type: CASE_DOMAIN_EVENTS.APPROVAL_REQUIRED,
        caseId: matchCase.caseId,
        occurredAt: new Date(),
        payload: { waitingForShadchan: true, stage: matchCase.stage },
      });
    }

    return this.toEnrichedResponse(matchCase, user);
  }

  private async applyShadchanAdvanceStage(
    user: AuthUserPayload,
    matchCase: MatchCaseDocument,
    previousStage: CaseStage,
  ) {
    const state = this.toSimplifiedState(matchCase);
    const result = applyShadchanAdvance(state);
    matchCase.stage = result.stage;
    matchCase.profileAStatus = result.profileAStatus;
    matchCase.profileBStatus = result.profileBStatus;
    this.syncLegacyFields(matchCase);
    await matchCase.save();

    await this.appendHistory({
      caseId: matchCase.caseId,
      action: 'Status Changed',
      previousStatus: normalizeShidduchStatus(
        legacyStatusFromStage(previousStage, state),
      ),
      newStatus: normalizeShidduchStatus(matchCase.currentStatus),
      changedByAccountId: user.accountId,
      note: `עבר לשלב ${STAGE_LABELS[result.stage]}`,
      actorSlot: 'Shadchan',
    });

    this.caseEventBus.emit({
      type: CASE_DOMAIN_EVENTS.STAGE_CHANGED,
      caseId: matchCase.caseId,
      occurredAt: new Date(),
      payload: { from: previousStage, to: result.stage },
    });
    if (result.stage === 'background_check') {
      this.caseEventBus.emit({
        type: CASE_DOMAIN_EVENTS.CONTACT_DETAILS_AVAILABLE,
        caseId: matchCase.caseId,
        occurredAt: new Date(),
      });
    }
    this.caseEventBus.emit({
      type: CASE_DOMAIN_EVENTS.APPROVAL_REQUIRED,
      caseId: matchCase.caseId,
      occurredAt: new Date(),
      payload: { stage: result.stage },
    });

    return this.toEnrichedResponse(matchCase, user);
  }

  async getContactDetails(user: AuthUserPayload, caseId: string) {
    const matchCase = await this.findCaseOrThrow(caseId);
    this.assertPersonParticipant(user, matchCase);

    const viewerContext = await this.buildViewerContext(matchCase, user);
    if (!viewerContext.availableActions.canViewContactDetails) {
      throw new ForbiddenException(
        viewerContext.availableActions.contactDetailsBlockedReason ??
          'פרטי קשר אינם זמינים כרגע',
      );
    }

    const status = normalizeShidduchStatus(matchCase.currentStatus);

    const counterpartyProfileId =
      matchCase.senderAccountId === user.accountId
        ? matchCase.targetProfileId
        : matchCase.senderProfileId;

    const counterpartyProfile = await this.profilesService.findOne(counterpartyProfileId);
    const ownerAccountId = counterpartyProfile.ownerAccountId;
    let phone: string | null = null;
    if (ownerAccountId) {
      try {
        const account = await this.accountsService.findOne(ownerAccountId);
        phone = account.phone ?? null;
      } catch {
        phone = null;
      }
    }

    const slot = slotForAccountId(this.toSimplifiedState(matchCase), user.accountId);
    await this.appendHistory({
      caseId: matchCase.caseId,
      action: 'Viewed Contact Details',
      newStatus: status,
      changedByAccountId: user.accountId,
      actorSlot: slot ? this.historySlot(slot) : undefined,
    });

    return {
      caseId: matchCase.caseId,
      profileId: counterpartyProfileId,
      phone,
      references: counterpartyProfile.references ?? [],
      dorYesharimStatus: null as string | null,
    };
  }

  async close(user: AuthUserPayload, caseId: string, note?: string) {
    if (user.role !== 'shadchan') {
      throw new ForbiddenException('רק שדכן/ית יכול/ה לבטל תיק');
    }

    const matchCase = await this.findCaseOrThrow(caseId);
    this.assertShadchanAssigned(user, matchCase);

    const previousStatus = normalizeShidduchStatus(matchCase.currentStatus);
    if (previousStatus === 'cancelled') {
      return this.toEnrichedResponse(matchCase, user);
    }

    matchCase.currentStatus = 'cancelled';
    matchCase.closedAt = new Date();
    await matchCase.save();

    await this.appendHistory({
      caseId: matchCase.caseId,
      action: 'Cancelled',
      previousStatus,
      newStatus: 'cancelled',
      changedByAccountId: user.accountId,
      note: note?.trim(),
      actorSlot: 'Shadchan',
    });

    this.caseEventBus.emit({
      type: CASE_DOMAIN_EVENTS.CASE_CANCELLED,
      caseId: matchCase.caseId,
      occurredAt: new Date(),
    });

    return this.toEnrichedResponse(matchCase, user);
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

    const matchCase = await this.matchCaseModel
      .findOne({
        currentStatus: { $nin: [...TERMINAL_SHIDDUCH_STATUSES, 'on_hold'] },
        $or: [
          { senderAccountId: user.accountId, targetProfileId: profileId },
          { targetAccountId: user.accountId, senderProfileId: profileId },
        ],
      })
      .sort({ updatedAt: -1 });

    if (!matchCase) {
      return { hasCase: false as const };
    }

    if (!isVisibleToAccount(this.toSimplifiedState(matchCase), user.accountId)) {
      return { hasCase: false as const };
    }

    return {
      hasCase: true as const,
      matchCase: await this.toEnrichedResponse(matchCase, user),
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
      { caseId: string; stage: string; currentStatus: string; updatedAt: Date }
    >();

    for (const matchCase of cases) {
      if (
        user.role === 'person' &&
        !isVisibleToAccount(this.toSimplifiedState(matchCase), user.accountId)
      ) {
        continue;
      }
      const counterpartyProfileId = this.getCounterpartyProfileId(user, matchCase);
      if (!counterpartyProfileId || !uniqueIds.includes(counterpartyProfileId)) continue;
      if (latestByProfile.has(counterpartyProfileId)) continue;
      latestByProfile.set(counterpartyProfileId, {
        caseId: matchCase.caseId,
        stage: matchCase.stage,
        currentStatus: matchCase.currentStatus,
        updatedAt: matchCase.updatedAt,
      });
    }

    return uniqueIds.map((profileId) => {
      const latest = latestByProfile.get(profileId);
      return {
        profileId,
        stage: latest?.stage ?? null,
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

  private assertCanView(user: AuthUserPayload, matchCase: MatchCaseDocument) {
    if (user.role === 'shadchan') {
      this.assertShadchanAssigned(user, matchCase);
      return;
    }
    this.assertPersonParticipant(user, matchCase);
    if (!isVisibleToAccount(this.toSimplifiedState(matchCase), user.accountId)) {
      throw new ForbiddenException('ההצעה עדיין לא נשלחה אליך');
    }
  }

  private toSimplifiedState(matchCase: MatchCaseDocument): SimplifiedCaseState {
    const initiatedBy = (matchCase.initiatedBy ??
      deriveInitiatedBy(matchCase)) as 'person' | 'shadchan';
    const stage = (matchCase.stage ??
      stageFromLegacyStatus(matchCase.currentStatus)) as CaseStage;

    let profileAStatus = (matchCase.profileAStatus ?? 'waiting') as ProfileDecision;
    let profileBStatus = (matchCase.profileBStatus ?? 'waiting') as ProfileDecision;

    const personBReleased =
      matchCase.personBReleased ??
      (initiatedBy === 'shadchan' ||
        matchCase.currentStatus !== 'sent_to_shadchan');

    return {
      stage,
      profileAStatus,
      profileBStatus,
      initiatedBy,
      personBReleased,
      senderProfileId: matchCase.senderProfileId,
      targetProfileId: matchCase.targetProfileId,
      senderAccountId: matchCase.senderAccountId,
      targetAccountId: matchCase.targetAccountId,
      closedAt: matchCase.closedAt ?? null,
    };
  }

  private syncLegacyFields(matchCase: MatchCaseDocument) {
    const state = this.toSimplifiedState(matchCase);
    matchCase.stage = state.stage;
    matchCase.profileAStatus = state.profileAStatus;
    matchCase.profileBStatus = state.profileBStatus;
    matchCase.personBReleased = state.personBReleased;
    matchCase.currentStatus = legacyStatusFromStage(state.stage, state);
  }

  private normalizeActionSlot(
    slot: SimpleSlot | 'PersonA' | 'PersonB' | undefined,
    user: AuthUserPayload,
    matchCase: MatchCaseDocument,
  ): SimpleSlot | null {
    if (slot === 'A' || slot === 'PersonA') return 'A';
    if (slot === 'B' || slot === 'PersonB') return 'B';
    if (user.role === 'person') {
      return slotForAccountId(this.toSimplifiedState(matchCase), user.accountId);
    }
    return null;
  }

  private historySlot(slot: SimpleSlot): PersonSlot {
    return slot === 'A' ? 'PersonA' : 'PersonB';
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
    previousStatus?: ShidduchStatus;
    newStatus?: ShidduchStatus;
    changedByAccountId: string;
    note?: string;
    actorSlot?: string;
    onBehalfOfSlot?: string;
    denialReason?: DenialReason;
    metadata?: Record<string, unknown>;
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
      actorSlot: input.actorSlot,
      onBehalfOfSlot: input.onBehalfOfSlot,
      denialReason: input.denialReason,
      metadata: input.metadata ?? null,
    });
  }

  private async buildViewerContext(
    matchCase: MatchCaseDocument,
    user: AuthUserPayload,
  ) {
    const [senderProfile, targetProfile] = await Promise.all([
      this.profilesService.findOne(matchCase.senderProfileId),
      this.profilesService.findOne(matchCase.targetProfileId),
    ]);

    return computeSimplifiedViewerContext(
      this.toSimplifiedState(matchCase),
      user.accountId,
      user.role,
      {
        personAName: this.formatProfileName(senderProfile),
        personBName: this.formatProfileName(targetProfile),
      },
    );
  }

  private formatProfileName(profile: { firstName?: string; lastName?: string; profileId: string }) {
    const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
    return name || profile.profileId;
  }

  private emitStageEvents(
    caseId: string,
    from: ShidduchStatus,
    to: ShidduchStatus,
  ) {
    if (from === to) return;

    this.caseEventBus.emit({
      type: CASE_DOMAIN_EVENTS.STAGE_CHANGED,
      caseId,
      occurredAt: new Date(),
      payload: { from, to },
    });

    if (to === 'background_check') {
      this.caseEventBus.emit({
        type: CASE_DOMAIN_EVENTS.CONTACT_DETAILS_AVAILABLE,
        caseId,
        occurredAt: new Date(),
      });
    }
    if (to === 'waiting_for_meeting_approval') {
      this.caseEventBus.emit({
        type: CASE_DOMAIN_EVENTS.MEETING_REQUESTED,
        caseId,
        occurredAt: new Date(),
      });
    }
    if (
      to === 'waiting_for_other_side' ||
      to === 'sent_to_shadchan' ||
      to === 'waiting_for_meeting_approval' ||
      to === 'waiting_after_meeting'
    ) {
      this.caseEventBus.emit({
        type: CASE_DOMAIN_EVENTS.APPROVAL_REQUIRED,
        caseId,
        occurredAt: new Date(),
        payload: { stage: to },
      });
    }
  }

  private async toEnrichedResponse(
    matchCase: MatchCaseDocument,
    user?: AuthUserPayload,
  ) {
    const [senderProfile, targetProfile] = await Promise.all([
      this.profilesService.findOne(matchCase.senderProfileId),
      this.profilesService.findOne(matchCase.targetProfileId),
    ]);

    const state = this.toSimplifiedState(matchCase);
    const viewerContext = user
      ? computeSimplifiedViewerContext(
          state,
          user.accountId,
          user.role,
          {
            personAName: this.formatProfileName(senderProfile),
            personBName: this.formatProfileName(targetProfile),
          },
        )
      : undefined;

    return {
      caseId: matchCase.caseId,
      senderProfileId: matchCase.senderProfileId,
      targetProfileId: matchCase.targetProfileId,
      senderAccountId: matchCase.senderAccountId,
      targetAccountId: matchCase.targetAccountId,
      assignedShadchanId: matchCase.assignedShadchanId,
      stage: state.stage,
      profileAStatus: user?.role === 'shadchan' ? state.profileAStatus : null,
      profileBStatus: user?.role === 'shadchan' ? state.profileBStatus : null,
      personBReleased: state.personBReleased,
      currentStatus: normalizeShidduchStatus(matchCase.currentStatus),
      initiatedBy: matchCase.initiatedBy ?? deriveInitiatedBy(matchCase),
      denialReason: matchCase.denialReason ?? null,
      denialNote: matchCase.denialNote ?? null,
      priority: matchCase.priority,
      tags: matchCase.tags ?? [],
      internalNotes: matchCase.internalNotes ?? '',
      createdAt: matchCase.createdAt,
      updatedAt: matchCase.updatedAt,
      closedAt: matchCase.closedAt ?? null,
      senderProfile,
      targetProfile,
      canViewContactDetails:
        viewerContext?.availableActions.canViewContactDetails ??
        canViewContactDetails(normalizeShidduchStatus(matchCase.currentStatus)),
      viewerContext,
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
      actorSlot: entry.actorSlot,
      onBehalfOfSlot: entry.onBehalfOfSlot,
      denialReason: entry.denialReason,
      metadata: entry.metadata ?? undefined,
    };
  }
}
