import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { INTEREST_STATUSES } from '../schemas/interest.schema';

export class CreateInterestDto {
  @ApiProperty()
  @IsString({ message: 'נדרש מזהה חשבון' })
  ownerAccountId: string;

  @ApiProperty()
  @IsString({ message: 'נדרש מזהה פרופיל' })
  profileId: string;

  @ApiPropertyOptional({ enum: INTEREST_STATUSES, default: 'notRequested' })
  @IsOptional()
  @IsIn(INTEREST_STATUSES, { message: 'סטטוס עניין לא תקין' })
  status?: (typeof INTEREST_STATUSES)[number];
}

export class UpdateInterestDto {
  @ApiPropertyOptional({ enum: INTEREST_STATUSES })
  @IsOptional()
  @IsIn(INTEREST_STATUSES, { message: 'סטטוס עניין לא תקין' })
  status?: (typeof INTEREST_STATUSES)[number];
}

export class InterestResponseDto {
  @ApiProperty()
  interestId: string;

  @ApiProperty()
  ownerAccountId: string;

  @ApiProperty()
  profileId: string;

  @ApiProperty({ enum: INTEREST_STATUSES })
  status: (typeof INTEREST_STATUSES)[number];

  @ApiProperty()
  updatedAt: Date;
}
