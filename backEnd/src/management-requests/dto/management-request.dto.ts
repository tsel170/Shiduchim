import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export type ManagementRequestStatus = 'pending' | 'approved' | 'declined';

export class CreateManagementRequestDto {
  @ApiProperty({ description: 'Profile id of the person with an account' })
  @IsString()
  personProfileId: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message: string;
}

export class RespondManagementRequestDto {
  @ApiProperty({ enum: ['approved', 'declined'] })
  @IsIn(['approved', 'declined'])
  response: 'approved' | 'declined';
}

export class ShadchanSummaryDto {
  @ApiProperty()
  accountId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({ nullable: true })
  phone?: string | null;
}

export class ManagementRequestResponseDto {
  @ApiProperty()
  requestId: string;

  @ApiProperty()
  shadchanId: string;

  @ApiProperty()
  personAccountId: string;

  @ApiProperty()
  personProfileId: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ enum: ['pending', 'approved', 'declined'] })
  status: ManagementRequestStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: ShadchanSummaryDto })
  shadchan?: ShadchanSummaryDto;
}

export class ManagementRequestProfileContextDto {
  @ApiProperty()
  canSend: boolean;

  @ApiProperty()
  alreadyLinked: boolean;

  @ApiPropertyOptional({ nullable: true })
  reason?: string | null;

  @ApiPropertyOptional({ type: ManagementRequestResponseDto, nullable: true })
  pendingRequest?: ManagementRequestResponseDto | null;
}
