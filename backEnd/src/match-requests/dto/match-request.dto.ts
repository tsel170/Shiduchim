import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMatchRequestDto {
  @ApiProperty()
  @IsString()
  senderProfileId: string;

  @ApiProperty()
  @IsString()
  targetProfileId: string;

  @ApiProperty()
  @IsString()
  shadchanId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}

export class UpdateMatchRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}

export class MatchRequestResponseDto {
  @ApiProperty()
  requestId: string;

  @ApiProperty()
  senderProfileId: string;

  @ApiProperty()
  targetProfileId: string;

  @ApiProperty()
  shadchanId: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
