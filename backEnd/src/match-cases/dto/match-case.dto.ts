import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ProfileResponseDto } from '../../profiles/dto/profile-response.dto';
import {
  MATCH_PRIORITIES,
  MATCH_STATUSES,
  PERSON_CASE_ACTIONS,
  WAITING_FOR_TARGETS,
} from '../constants/match-status';
import { DENIAL_REASONS } from '../domain/denial-reason';
import {
  CASE_STAGES,
  PROFILE_DECISIONS,
} from '../domain/simplified-case-workflow';
import {
  APPROVAL_STATUSES,
  PARTICIPANT_ROLES,
  PERSON_SLOTS,
  WAITING_FOR_PARTICIPANTS,
} from '../domain/case-participant.types';

export class CreateMatchCaseDto {
  @ApiProperty()
  @IsString({ message: 'פרופיל שולח: ערך לא תקין' })
  senderProfileId: string;

  @ApiProperty()
  @IsString({ message: 'פרופיל יעד: ערך לא תקין' })
  targetProfileId: string;

  @ApiProperty()
  @IsString({ message: 'שדכן: ערך לא תקין' })
  assignedShadchanId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'הערות: ערך לא תקין' })
  @MaxLength(4000, { message: 'ההערות ארוכות מדי' })
  note?: string;

  @ApiPropertyOptional({ enum: MATCH_PRIORITIES })
  @IsOptional()
  @IsIn(MATCH_PRIORITIES, { message: 'עדיפות לא תקינה' })
  priority?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray({ message: 'תגיות: ערך לא תקין' })
  @IsString({ each: true, message: 'תגית: ערך לא תקין' })
  tags?: string[];
}

export class UpdateMatchCaseDto {
  @ApiPropertyOptional({ enum: MATCH_STATUSES })
  @IsOptional()
  @IsIn(MATCH_STATUSES, { message: 'סטטוס לא תקין' })
  currentStatus?: string;

  @ApiPropertyOptional({ enum: MATCH_PRIORITIES })
  @IsOptional()
  @IsIn(MATCH_PRIORITIES, { message: 'עדיפות לא תקינה' })
  priority?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray({ message: 'תגיות: ערך לא תקין' })
  @IsString({ each: true, message: 'תגית: ערך לא תקין' })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'הערות פנימיות: ערך לא תקין' })
  @MaxLength(10000, { message: 'ההערות הפנימיות ארוכות מדי' })
  internalNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'שדכן: ערך לא תקין' })
  assignedShadchanId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'הערה: ערך לא תקין' })
  @MaxLength(4000, { message: 'ההערה ארוכה מדי' })
  note?: string;
}

export class PersonMatchCaseActionDto {
  @ApiProperty({ enum: PERSON_CASE_ACTIONS })
  @IsIn(PERSON_CASE_ACTIONS, { message: 'פעולה לא תקינה' })
  action: string;

  @ApiPropertyOptional({ enum: DENIAL_REASONS })
  @IsOptional()
  @IsIn(DENIAL_REASONS, { message: 'סיבת דחייה לא תקינה' })
  denialReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'הערה: ערך לא תקין' })
  @MaxLength(2000, { message: 'ההערה ארוכה מדי' })
  note?: string;
}

export class CloseMatchCaseDto {
  @ApiProperty({ description: 'Reason for cancelling the case (required)' })
  @IsString({ message: 'יש לציין סיבה לביטול התיק' })
  @MinLength(3, { message: 'סיבת הביטול קצרה מדי' })
  @MaxLength(2000, { message: 'סיבת הביטול ארוכה מדי' })
  reason: string;
}

export class CaseActionDto {
  @ApiProperty({
    enum: ['approve', 'deny', 'approve_for', 'release_to_person_b', 'advance_stage'],
  })
  @IsIn(['approve', 'deny', 'approve_for', 'release_to_person_b', 'advance_stage'], {
    message: 'פעולה לא תקינה',
  })
  type: 'approve' | 'deny' | 'approve_for' | 'release_to_person_b' | 'advance_stage';

  @ApiPropertyOptional({ enum: ['A', 'B', ...PERSON_SLOTS] })
  @IsOptional()
  @IsIn(['A', 'B', ...PERSON_SLOTS], { message: 'משתתף לא תקין' })
  slot?: string;

  @ApiPropertyOptional({ enum: DENIAL_REASONS })
  @IsOptional()
  @IsIn(DENIAL_REASONS, { message: 'סיבת דחייה לא תקינה' })
  denialReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'הערה: ערך לא תקין' })
  @MaxLength(2000, { message: 'ההערה ארוכה מדי' })
  note?: string;
}

export class AvailableActionsDto {
  @ApiProperty()
  canApprove: boolean;

  @ApiProperty()
  canDeny: boolean;

  @ApiProperty()
  canViewContactDetails: boolean;

  @ApiPropertyOptional()
  contactDetailsBlockedReason?: string;

  @ApiProperty()
  canReleaseToPersonB: boolean;

  @ApiProperty()
  canApproveForA: boolean;

  @ApiProperty()
  canApproveForB: boolean;

  @ApiProperty()
  canAdvanceStage: boolean;

  @ApiPropertyOptional()
  nextStageLabel?: string;

  @ApiProperty()
  canCancel: boolean;
}

export class CaseViewerContextDto {
  @ApiProperty({ enum: CASE_STAGES })
  stage: string;

  @ApiProperty()
  stageLabel: string;

  @ApiPropertyOptional({ enum: PROFILE_DECISIONS, nullable: true })
  profileAStatus?: string | null;

  @ApiPropertyOptional({ enum: PROFILE_DECISIONS, nullable: true })
  profileBStatus?: string | null;

  @ApiPropertyOptional({ enum: ['A', 'B', 'shadchan'], nullable: true })
  mySlot?: string | null;

  @ApiPropertyOptional({ enum: PROFILE_DECISIONS, nullable: true })
  myStatus?: string | null;

  @ApiProperty()
  statusMessage: string;

  @ApiProperty()
  isClosed: boolean;

  @ApiProperty()
  personAName: string;

  @ApiProperty()
  personBName: string;

  @ApiProperty({ type: AvailableActionsDto })
  @Type(() => AvailableActionsDto)
  availableActions: AvailableActionsDto;
}

export class CaseParticipantDto {
  @ApiProperty()
  accountId: string;

  @ApiPropertyOptional()
  profileId?: string | null;

  @ApiProperty({ enum: PARTICIPANT_ROLES })
  role: string;

  @ApiPropertyOptional({ enum: PERSON_SLOTS })
  personSlot?: string | null;

  @ApiProperty({ enum: APPROVAL_STATUSES })
  approvalStatus: string;

  @ApiPropertyOptional()
  approvedAt?: Date | null;

  @ApiPropertyOptional()
  approvedByAccountId?: string | null;
}

export class ListMatchCasesQueryDto {
  @ApiPropertyOptional({ enum: MATCH_STATUSES })
  @IsOptional()
  @IsIn(MATCH_STATUSES, { message: 'סטטוס לא תקין' })
  status?: string;

  @ApiPropertyOptional({ enum: CASE_STAGES })
  @IsOptional()
  @IsIn(CASE_STAGES, { message: 'שלב לא תקין' })
  stage?: string;

  @ApiPropertyOptional({ enum: MATCH_PRIORITIES })
  @IsOptional()
  @IsIn(MATCH_PRIORITIES, { message: 'עדיפות לא תקינה' })
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'שדכן: ערך לא תקין' })
  assignedShadchanId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'פרופיל: ערך לא תקין' })
  profileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'תגית: ערך לא תקין' })
  tag?: string;

  @ApiPropertyOptional({ enum: ['newest', 'oldest', 'updated'] })
  @IsOptional()
  @IsIn(['newest', 'oldest', 'updated'], { message: 'מיון לא תקין' })
  sort?: 'newest' | 'oldest' | 'updated';
}

export class ProfileStatusQueryDto {
  @ApiProperty({ type: [String] })
  @IsArray({ message: 'profileIds: ערך לא תקין' })
  @IsString({ each: true, message: 'profileId: ערך לא תקין' })
  @MinLength(1, { each: true })
  profileIds: string[];
}

export class MatchCaseResponseDto {
  @ApiProperty()
  caseId: string;

  @ApiProperty()
  senderProfileId: string;

  @ApiProperty()
  targetProfileId: string;

  @ApiProperty()
  senderAccountId: string;

  @ApiPropertyOptional()
  targetAccountId?: string | null;

  @ApiProperty()
  assignedShadchanId: string;

  @ApiProperty({ enum: MATCH_STATUSES })
  currentStatus: string;

  @ApiProperty({ enum: CASE_STAGES })
  stage: string;

  @ApiPropertyOptional({ enum: PROFILE_DECISIONS, nullable: true })
  profileAStatus?: string | null;

  @ApiPropertyOptional({ enum: PROFILE_DECISIONS, nullable: true })
  profileBStatus?: string | null;

  @ApiProperty()
  personBReleased: boolean;

  @ApiPropertyOptional({ enum: ['person', 'shadchan'] })
  initiatedBy?: string | null;

  @ApiPropertyOptional({ enum: DENIAL_REASONS })
  denialReason?: string | null;

  @ApiPropertyOptional()
  denialNote?: string | null;

  @ApiPropertyOptional({ type: CaseViewerContextDto })
  @Type(() => CaseViewerContextDto)
  viewerContext?: CaseViewerContextDto;

  @ApiPropertyOptional()
  canViewContactDetails?: boolean;

  @ApiProperty({ enum: MATCH_PRIORITIES })
  priority: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  internalNotes: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  closedAt?: Date | null;
}

export class EnrichedMatchCaseResponseDto extends MatchCaseResponseDto {
  @ApiProperty({ type: ProfileResponseDto })
  senderProfile: ProfileResponseDto;

  @ApiProperty({ type: ProfileResponseDto })
  targetProfile: ProfileResponseDto;
}

export class CaseHistoryResponseDto {
  @ApiProperty()
  historyId: string;

  @ApiProperty()
  caseId: string;

  @ApiProperty()
  action: string;

  @ApiPropertyOptional()
  previousStatus?: string;

  @ApiPropertyOptional()
  newStatus?: string;

  @ApiProperty()
  changedByAccountId: string;

  @ApiProperty()
  timestamp: Date;

  @ApiPropertyOptional()
  note?: string;

  @ApiPropertyOptional({ enum: [...PERSON_SLOTS, 'Shadchan'] })
  actorSlot?: string;

  @ApiPropertyOptional({ enum: PERSON_SLOTS })
  onBehalfOfSlot?: string;

  @ApiPropertyOptional({ enum: DENIAL_REASONS })
  denialReason?: string;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;
}

export class ProfileMatchStatusDto {
  @ApiProperty()
  profileId: string;

  @ApiPropertyOptional({ enum: CASE_STAGES })
  stage?: string | null;

  @ApiPropertyOptional({ enum: MATCH_STATUSES })
  currentStatus?: string | null;

  @ApiPropertyOptional()
  caseId?: string | null;

  @ApiPropertyOptional()
  updatedAt?: Date | null;
}

export class BatchProfileStatusDto {
  @ApiProperty({ type: [ProfileMatchStatusDto] })
  @Type(() => ProfileMatchStatusDto)
  statuses: ProfileMatchStatusDto[];
}

export class ProfileCaseContextDto {
  @ApiProperty()
  hasCase: boolean;

  @ApiPropertyOptional({ type: EnrichedMatchCaseResponseDto })
  @Type(() => EnrichedMatchCaseResponseDto)
  matchCase?: EnrichedMatchCaseResponseDto;
}
