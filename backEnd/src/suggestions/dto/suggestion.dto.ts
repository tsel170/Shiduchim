import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ProfileResponseDto } from '../../profiles/dto/profile-response.dto';
import {
  PERSON_SUGGESTION_RESPONSES,
  SUGGESTION_CHECK_STATUSES,
  SUGGESTION_STAGES,
} from '../schemas/suggestion.schema';

export class CreateSuggestionDto {
  @ApiProperty()
  @IsString({ message: 'נדרש מזהה חשבון' })
  ownerAccountId: string;

  @ApiProperty()
  @IsString({ message: 'נדרש מזהה פרופיל' })
  profileId: string;

  @ApiProperty()
  @IsString({ message: 'נא להזין הערת שדכן' })
  shadchanNote: string;

  @ApiPropertyOptional({ enum: SUGGESTION_STAGES, default: 'new' })
  @IsOptional()
  @IsIn(SUGGESTION_STAGES, { message: 'שלב הצעה לא תקין' })
  stage?: (typeof SUGGESTION_STAGES)[number];

  @ApiPropertyOptional({ enum: SUGGESTION_CHECK_STATUSES })
  @IsOptional()
  @IsIn(SUGGESTION_CHECK_STATUSES, { message: 'סטטוס בדיקה לא תקין' })
  checkStatus?: (typeof SUGGESTION_CHECK_STATUSES)[number];
}

export class UpdateSuggestionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'הערת שדכן: ערך לא תקין' })
  @MaxLength(4000, { message: 'הערת השדכן ארוכה מדי' })
  shadchanNote?: string;

  @ApiPropertyOptional({ enum: SUGGESTION_STAGES })
  @IsOptional()
  @IsIn(SUGGESTION_STAGES, { message: 'שלב הצעה לא תקין' })
  stage?: (typeof SUGGESTION_STAGES)[number];

  @ApiPropertyOptional({ enum: SUGGESTION_CHECK_STATUSES })
  @IsOptional()
  @IsIn(SUGGESTION_CHECK_STATUSES, { message: 'סטטוס בדיקה לא תקין' })
  checkStatus?: (typeof SUGGESTION_CHECK_STATUSES)[number];
}

export class PersonSuggestionResponseDto {
  @ApiProperty({ enum: PERSON_SUGGESTION_RESPONSES })
  @IsIn(PERSON_SUGGESTION_RESPONSES, { message: 'תגובה לא תקינה' })
  response: (typeof PERSON_SUGGESTION_RESPONSES)[number];
}

export class SuggestionResponseDto {
  @ApiProperty()
  suggestionId: string;

  @ApiProperty()
  profileId: string;

  @ApiProperty()
  shadchanId: string;

  @ApiProperty()
  shadchanNote: string;

  @ApiProperty()
  sentAt: Date;

  @ApiProperty({ enum: SUGGESTION_STAGES })
  stage: (typeof SUGGESTION_STAGES)[number];

  @ApiPropertyOptional({ enum: SUGGESTION_CHECK_STATUSES })
  checkStatus?: (typeof SUGGESTION_CHECK_STATUSES)[number];

  @ApiPropertyOptional({ enum: PERSON_SUGGESTION_RESPONSES, nullable: true })
  personResponse?: (typeof PERSON_SUGGESTION_RESPONSES)[number] | null;

  @ApiPropertyOptional({ nullable: true })
  personRespondedAt?: Date | null;

  @ApiPropertyOptional({ type: ProfileResponseDto })
  profile?: ProfileResponseDto;
}
