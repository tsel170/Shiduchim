import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ProfileResponseDto } from '../../profiles/dto/profile-response.dto';

export class CreateMatchRequestDto {
  @ApiPropertyOptional({ description: 'Defaults to the person account profile id' })
  @IsOptional()
  @IsString({ message: 'פרופיל שולח: ערך לא תקין' })
  senderProfileId?: string;

  @ApiProperty()
  @IsString({ message: 'נדרש פרופיל יעד' })
  targetProfileId: string;

  @ApiPropertyOptional({ description: 'Defaults to demo shadchan when omitted' })
  @IsOptional()
  @IsString({ message: 'שדכן: ערך לא תקין' })
  shadchanId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'הערות: ערך לא תקין' })
  @MaxLength(4000, { message: 'ההערות ארוכות מדי' })
  notes?: string;
}

export class UpdateMatchRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'הערות: ערך לא תקין' })
  @MaxLength(4000, { message: 'ההערות ארוכות מדי' })
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

export class EnrichedMatchRequestResponseDto extends MatchRequestResponseDto {
  @ApiProperty({ type: ProfileResponseDto })
  senderProfile: ProfileResponseDto;

  @ApiProperty({ type: ProfileResponseDto })
  targetProfile: ProfileResponseDto;
}
