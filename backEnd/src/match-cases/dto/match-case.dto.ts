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
} from '../constants/match-status';

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
}

export class ListMatchCasesQueryDto {
  @ApiPropertyOptional({ enum: MATCH_STATUSES })
  @IsOptional()
  @IsIn(MATCH_STATUSES, { message: 'סטטוס לא תקין' })
  status?: string;

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
}

export class ProfileMatchStatusDto {
  @ApiProperty()
  profileId: string;

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
